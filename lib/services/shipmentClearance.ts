import { prisma } from '@/lib/prisma';
import { calculateReadinessScore } from './readiness';
import { calculateProfileCompleteness } from './profileCompleteness';

export interface ShipmentClearanceCheck {
  id: string;
  name: string;
  category: 'profile' | 'readiness' | 'documents' | 'freight' | 'packaging';
  passed: boolean;
  score: number;
  maxScore: number;
  details: string;
  actionUrl?: string;
  actionText?: string;
}

export interface ShipmentClearanceResult {
  shipmentId: string;
  shipmentNumber: string;
  canDispatch: boolean;
  clearanceScore: number; // 0 - 100
  status: 'CLEARED' | 'CONDITIONAL_PASS' | 'BLOCKED_CRITICAL' | 'INCOMPLETE_DOCS';
  checks: ShipmentClearanceCheck[];
  blockers: string[];
  summary: string;
}

/**
 * Deterministic compliance clearance algorithm for Export Shipment dispatch.
 * Checks business identity, corridor readiness, freight booking, and customs prerequisites.
 */
export async function evaluateShipmentClearance(shipmentId: string): Promise<ShipmentClearanceResult> {
  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: {
      business: {
        include: {
          documents: true,
        },
      },
      product: {
        include: {
          destinations: {
            include: {
              country: true,
            },
          },
        },
      },
      destinationCountry: true,
      quotes: true,
      documents: true,
      providerTasks: true,
    },
  });

  if (!shipment) {
    throw new Error(`Shipment record not found for ID: ${shipmentId}`);
  }

  const checks: ShipmentClearanceCheck[] = [];
  const blockers: string[] = [];

  // 1. Business Profile Completeness check (20 pts)
  const profileResult = await calculateProfileCompleteness(shipment.businessId);
  const isProfileAdequate = profileResult.totalScore >= 70;
  const profilePoints = Math.round((profileResult.totalScore / 100) * 20);

  checks.push({
    id: 'check-profile',
    name: 'MSME Business Entity Registration',
    category: 'profile',
    passed: isProfileAdequate,
    score: profilePoints,
    maxScore: 20,
    details: `Business profile is ${profileResult.totalScore}% complete (${profileResult.tier}).`,
    actionUrl: '/business',
    actionText: isProfileAdequate ? 'View Profile' : 'Complete Profile',
  });

  if (!isProfileAdequate) {
    blockers.push(`Business profile is only ${profileResult.totalScore}% complete. Update GSTIN/IEC credentials.`);
  }

  // 2. Export Corridor Readiness Score (30 pts)
  const targetPc = shipment.product.destinations.find(
    (d) => d.country?.id === shipment.destinationCountryId || d.country?.isoCode === shipment.destinationCountry.isoCode
  );

  let corridorScore = 0;
  let hasReadinessBlockers = false;

  if (targetPc) {
    const readiness = await calculateReadinessScore(targetPc.id);
    corridorScore = readiness.totalScore;
    hasReadinessBlockers = readiness.blockers.length > 0;
    const readinessPoints = Math.round((readiness.totalScore / 100) * 30);

    checks.push({
      id: 'check-readiness',
      name: 'Destination Trade & Regulatory Readiness',
      category: 'readiness',
      passed: !hasReadinessBlockers && readiness.totalScore >= 75,
      score: readinessPoints,
      maxScore: 30,
      details: `${readiness.totalScore}% readiness for corridor to ${shipment.destinationCountry.name}. (${readiness.blockers.length} blockers).`,
      actionUrl: '/readiness',
      actionText: 'View Readiness Audit',
    });

    if (hasReadinessBlockers) {
      blockers.push(`${readiness.blockers.length} compliance blockers pending resolution in export corridor.`);
    }
  } else {
    checks.push({
      id: 'check-readiness',
      name: 'Destination Trade & Regulatory Readiness',
      category: 'readiness',
      passed: false,
      score: 0,
      maxScore: 30,
      details: `No active regulatory mapping found for ${shipment.destinationCountry.name}.`,
      actionUrl: '/readiness',
      actionText: 'Initialize Corridor',
    });
    blockers.push(`No compliance rules mapped for ${shipment.destinationCountry.name}.`);
  }

  // 3. Freight Carrier Quote Selection (25 pts)
  const selectedQuote = shipment.quotes.find((q) => q.isSelected);
  const hasSelectedQuote = Boolean(selectedQuote);

  checks.push({
    id: 'check-freight',
    name: 'Freight Carrier Booking & Route Confirmation',
    category: 'freight',
    passed: hasSelectedQuote,
    score: hasSelectedQuote ? 25 : 0,
    maxScore: 25,
    details: hasSelectedQuote
      ? `Carrier quote confirmed (${selectedQuote?.mode} mode - ₹${selectedQuote?.cost.toLocaleString('en-IN')}).`
      : 'No freight quote selected. Request bids from accredited forwarders.',
    actionUrl: `/shipments`,
    actionText: hasSelectedQuote ? 'View Quotes' : 'Select Freight Quote',
  });

  if (!hasSelectedQuote) {
    blockers.push('Carrier freight rate booking is not confirmed.');
  }

  // 4. Mandatory Customs & Shipping Documents (25 pts)
  const allDocs = [...shipment.documents, ...shipment.business.documents];
  const hasInvoice = allDocs.some((d) => d.type.includes('INVOICE') || d.type.includes('COMMERCIAL'));
  const hasPackingList = allDocs.some((d) => d.type.includes('PACKING'));
  const hasGstIec = allDocs.some((d) => d.type.includes('GST') || d.type.includes('IEC'));

  let docPoints = 0;
  if (hasGstIec) docPoints += 9;
  if (hasInvoice) docPoints += 8;
  if (hasPackingList) docPoints += 8;

  const docsPassed = docPoints >= 20;

  checks.push({
    id: 'check-docs',
    name: 'Customs Shipping Documentation Manifest',
    category: 'documents',
    passed: docsPassed,
    score: docPoints,
    maxScore: 25,
    details: `Commercial documentation: GST/IEC (${hasGstIec ? '✓' : '✗'}), Invoice (${hasInvoice ? '✓' : '✗'}), Packing List (${hasPackingList ? '✓' : '✗'}).`,
    actionUrl: '/documents',
    actionText: 'Manage Documents',
  });

  if (!hasInvoice || !hasPackingList) {
    blockers.push('Commercial Invoice or Packing List manifest missing from consignment dossier.');
  }

  // Final Total Clearance Score
  const clearanceScore = checks.reduce((acc, c) => acc + c.score, 0);
  const canDispatch = blockers.length === 0 && clearanceScore >= 80;

  let status: ShipmentClearanceResult['status'] = 'BLOCKED_CRITICAL';
  if (canDispatch) {
    status = 'CLEARED';
  } else if (clearanceScore >= 65 && !hasReadinessBlockers) {
    status = 'CONDITIONAL_PASS';
  } else if (!docsPassed) {
    status = 'INCOMPLETE_DOCS';
  } else {
    status = 'BLOCKED_CRITICAL';
  }

  const summary = canDispatch
    ? `Consignment ${shipment.shipmentNumber} is 100% compliant and cleared for port gate-in & customs handover.`
    : `Consignment ${shipment.shipmentNumber} cannot be dispatched: ${blockers.length} compliance prerequisites unresolved.`;

  return {
    shipmentId: shipment.id,
    shipmentNumber: shipment.shipmentNumber,
    canDispatch,
    clearanceScore,
    status,
    checks,
    blockers,
    summary,
  };
}
