import { prisma } from '@/lib/prisma';

export interface ReadinessCategoryScore {
  score: number;
  weight: number;
  label: string;
  earnedPoints: number;
  totalPoints: number;
  completedItemsCount: number;
  totalItemsCount: number;
}

export interface ReadinessBlockerItem {
  id: string;
  title: string;
  type: string;
  priority: string;
  reason: string;
  status: string;
  actionUrl: string;
  isPendingVerification?: boolean;
  isRejected?: boolean;
  blocksDispatch?: boolean;
  weight?: number;
}

export interface ReadinessNextAction {
  id: string;
  title: string;
  type: string;
  actionText: string;
  status?: string;
  dueDate?: string;
  priority?: string;
}

export interface ReadinessScoreResult {
  totalScore: number;
  readinessState: 'Getting Started' | 'In Progress' | 'Almost Ready' | 'Export Ready' | 'Action Required (Blockers)';
  isExportReady: boolean;
  greenChannelActive: boolean;
  criticalBlockersCount: number;
  totalBlockersCount: number;
  categoryScores: {
    business: ReadinessCategoryScore;
    documents: ReadinessCategoryScore;
    certifications: ReadinessCategoryScore;
    packaging: ReadinessCategoryScore;
    shipment: ReadinessCategoryScore;
  };
  blockers: ReadinessBlockerItem[];
  nextActions: ReadinessNextAction[];
  summary: string;
}

export interface ProductCountryReadinessData {
  id: string;
  product?: {
    name?: string;
    business?: {
      gstStatus?: string | null;
      iecStatus?: string | null;
      documents?: Array<{ type: string; status: string }>;
    } | null;
  } | null;
  country?: {
    id: string;
    name: string;
    isoCode: string;
  } | null;
  requirements: Array<{
    id: string;
    type: string; // "document", "certification", "packaging", "labelling", "shipment"
    priority: string; // "critical", "high", "medium", "low"
    status: string; // "missing", "uploaded", "under_review", "verified", "rejected", "expired"
    weight?: number | null;
    title: string;
    reason?: string | null;
    completedAt?: Date | null;
    rule?: {
      blocksDispatch?: boolean | null;
      priority?: string | null;
    } | null;
    documents?: Array<{
      id: string;
      status: string;
    }>;
  }>;
  packagingItems: Array<{
    id: string;
    title: string;
    type: string;
    priority?: string | null;
    mandatory: boolean;
    status: string; // "incomplete", "completed"
    notes?: string | null;
  }>;
}

/**
 * Pure mathematical scoring engine for Export Readiness Assessment.
 * Implements deterministic multi-criteria weighted scoring and strict compliance gate evaluation.
 */
export function calculateReadinessFromData(pc: ProductCountryReadinessData): ReadinessScoreResult {
  const requirements = pc.requirements || [];
  const packagingItems = pc.packagingItems || [];
  const business = pc.product?.business || {};

  // -------------------------------------------------------------
  // 1. Business Profile & Statutory Registrations (Weight: 20%)
  // -------------------------------------------------------------
  let businessEarned = 0;
  const gstLower = (business.gstStatus || '').toLowerCase();
  const iecLower = (business.iecStatus || '').toLowerCase();

  const isGstVerified =
    (gstLower.includes('active') || gstLower.includes('verified')) &&
    !gstLower.includes('not') &&
    !gstLower.includes('pending') &&
    !gstLower.includes('missing') &&
    !gstLower.includes('unregistered');

  const isIecVerified =
    (iecLower.includes('active') || iecLower.includes('verified')) &&
    !iecLower.includes('not') &&
    !iecLower.includes('pending') &&
    !iecLower.includes('missing') &&
    !iecLower.includes('unregistered');

  if (isGstVerified) businessEarned += 50;
  if (isIecVerified) businessEarned += 50;
  const businessScore = Math.min(100, Math.max(0, businessEarned));

  // -------------------------------------------------------------
  // 2. Export Documents Score (Weight: 25%)
  // -------------------------------------------------------------
  const docReqs = requirements.filter((r) => r.type === 'document');
  let docEarnedWeight = 0;
  let docTotalWeight = 0;
  let docVerifiedCount = 0;

  for (const req of docReqs) {
    const w = typeof req.weight === 'number' && req.weight > 0 ? req.weight : 10;
    docTotalWeight += w;
    if (req.status === 'verified') {
      docEarnedWeight += w;
      docVerifiedCount++;
    }
  }
  const docScore = docTotalWeight > 0 ? Math.round((docEarnedWeight / docTotalWeight) * 100) : 100;

  // -------------------------------------------------------------
  // 3. Product Certifications Score (Weight: 20%)
  // -------------------------------------------------------------
  const certReqs = requirements.filter((r) => r.type === 'certification');
  let certEarnedWeight = 0;
  let certTotalWeight = 0;
  let certVerifiedCount = 0;

  for (const req of certReqs) {
    const w = typeof req.weight === 'number' && req.weight > 0 ? req.weight : 15;
    certTotalWeight += w;
    if (req.status === 'verified') {
      certEarnedWeight += w;
      certVerifiedCount++;
    }
  }
  const certScore = certTotalWeight > 0 ? Math.round((certEarnedWeight / certTotalWeight) * 100) : 100;

  // -------------------------------------------------------------
  // 4. Packaging & Labelling Score (Weight: 15%)
  // -------------------------------------------------------------
  let packagingEarnedWeight = 0;
  let packagingTotalWeight = 0;
  let packagingCompletedCount = 0;

  for (const item of packagingItems) {
    // Mandatory items have 2x weight multiplier compared to optional
    const itemWeight = item.mandatory ? 20 : 10;
    packagingTotalWeight += itemWeight;
    if (item.status === 'completed') {
      packagingEarnedWeight += itemWeight;
      packagingCompletedCount++;
    }
  }
  const packagingScore =
    packagingTotalWeight > 0 ? Math.round((packagingEarnedWeight / packagingTotalWeight) * 100) : 100;

  // -------------------------------------------------------------
  // 5. Shipment Prerequisites Score (Weight: 20%)
  // -------------------------------------------------------------
  const shipmentReqs = requirements.filter((r) => r.type === 'shipment' || r.type === 'labelling');
  let shipmentEarnedWeight = 0;
  let shipmentTotalWeight = 0;
  let shipmentVerifiedCount = 0;

  for (const req of shipmentReqs) {
    const w = typeof req.weight === 'number' && req.weight > 0 ? req.weight : 10;
    shipmentTotalWeight += w;
    if (req.status === 'verified') {
      shipmentEarnedWeight += w;
      shipmentVerifiedCount++;
    }
  }
  const shipmentScore =
    shipmentTotalWeight > 0 ? Math.round((shipmentEarnedWeight / shipmentTotalWeight) * 100) : 100;

  // -------------------------------------------------------------
  // Weighted Total Overall Score Calculation
  // -------------------------------------------------------------
  const totalScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        businessScore * 0.20 +
          docScore * 0.25 +
          certScore * 0.20 +
          packagingScore * 0.15 +
          shipmentScore * 0.20
      )
    )
  );

  // -------------------------------------------------------------
  // Strict Blocker & Compliance Gate Evaluation
  // -------------------------------------------------------------
  const blockers: ReadinessBlockerItem[] = [];

  // Check GST/IEC Business blockers
  if (!isGstVerified) {
    blockers.push({
      id: 'blocker-gst',
      title: 'GSTIN Registration Verification Missing',
      type: 'business',
      priority: 'critical',
      reason: 'Active GST registration with GSTN portal proof is mandatory prior to export customs clearance.',
      status: 'missing',
      actionUrl: '/business',
      blocksDispatch: true,
      weight: 10,
    });
  }

  if (!isIecVerified) {
    blockers.push({
      id: 'blocker-iec',
      title: 'DGFT Import Export Code (IEC) Required',
      type: 'business',
      priority: 'critical',
      reason: 'Valid DGFT IEC Exporter code is mandatory for ICEGATE shipping bill generation.',
      status: 'missing',
      actionUrl: '/business',
      blocksDispatch: true,
      weight: 10,
    });
  }

  // Check Requirement blockers (documents, certifications, shipment)
  for (const req of requirements) {
    if (req.status !== 'verified') {
      const isCritical = req.priority === 'critical' || Boolean(req.rule?.blocksDispatch);
      const isUnderReview = req.status === 'under_review';
      const isRejected = req.status === 'rejected';
      const isMissing = req.status === 'missing' || !req.status;

      let actionUrl = '/readiness';
      if (req.type === 'document') actionUrl = '/documents';
      else if (req.type === 'certification') actionUrl = '/certifications';
      else if (req.type === 'labelling' || req.type === 'packaging') actionUrl = '/packaging';
      else if (req.type === 'shipment') actionUrl = '/shipments';

      let reasonText = req.reason || 'Statutory export compliance prerequisite must be verified.';
      if (isUnderReview) {
        reasonText = 'Evidence submitted. Compliance partner audit pending verification.';
      } else if (isRejected) {
        reasonText = `Submission rejected: ${req.reason || 'Document failed verification'}. Upload corrected file.`;
      }

      blockers.push({
        id: req.id,
        title: req.title,
        type: req.type,
        priority: req.priority,
        reason: reasonText,
        status: req.status,
        actionUrl,
        isPendingVerification: isUnderReview,
        isRejected,
        blocksDispatch: isCritical,
        weight: req.weight || 10,
      });
    }
  }

  // Check Packaging blockers
  for (const item of packagingItems) {
    if (item.status !== 'completed' && item.mandatory) {
      blockers.push({
        id: item.id,
        title: item.title,
        type: item.type,
        priority: item.priority || 'high',
        reason: item.notes || `Mandatory export packaging/labelling requirement incomplete.`,
        status: 'incomplete',
        actionUrl: '/packaging',
        blocksDispatch: true,
        weight: 10,
      });
    }
  }

  // Sort blockers by urgency:
  // 1. Rejected items (must be re-uploaded)
  // 2. Critical dispatch blockers
  // 3. Under review (waiting)
  // 4. Missing / incomplete
  blockers.sort((a, b) => {
    if (a.isRejected && !b.isRejected) return -1;
    if (!a.isRejected && b.isRejected) return 1;
    if (a.blocksDispatch && !b.blocksDispatch) return -1;
    if (!a.blocksDispatch && b.blocksDispatch) return 1;
    return 0;
  });

  const criticalBlockersCount = blockers.filter((b) => b.blocksDispatch || b.priority === 'critical' || b.isRejected).length;

  // -------------------------------------------------------------
  // Readiness State Determination
  // -------------------------------------------------------------
  let readinessState: ReadinessScoreResult['readinessState'] = 'Getting Started';
  const isExportReady = blockers.length === 0 && totalScore >= 75;
  const greenChannelActive = isExportReady && totalScore >= 90;

  if (blockers.length > 0) {
    readinessState = 'Action Required (Blockers)';
  } else if (totalScore >= 90) {
    readinessState = 'Export Ready';
  } else if (totalScore >= 70) {
    readinessState = 'Almost Ready';
  } else if (totalScore >= 40) {
    readinessState = 'In Progress';
  } else {
    readinessState = 'Getting Started';
  }

  // Next recommended actions (top 5 prioritized items)
  const nextActions: ReadinessNextAction[] = blockers.slice(0, 5).map((b) => {
    let actionText = 'Complete Requirement';
    if (b.isRejected) {
      actionText = 'Replace Rejected Doc →';
    } else if (b.isPendingVerification) {
      actionText = 'Verification Pending ⏳';
    } else if (b.type === 'document') {
      actionText = 'Upload Document Proof →';
    } else if (b.type === 'certification') {
      actionText = 'Request Accredited Lab Cert →';
    } else if (b.type === 'packaging' || b.type === 'labelling') {
      actionText = 'Complete Packaging Task →';
    } else if (b.type === 'shipment') {
      actionText = 'Book Freight / Cargo →';
    } else if (b.type === 'business') {
      actionText = 'Update Registrations →';
    }

    return {
      id: b.id,
      title: b.title,
      type: b.type,
      status: b.status,
      priority: b.priority,
      actionText,
    };
  });

  const summary = isExportReady
    ? 'All statutory compliance requirements and certifications are verified. Your consignment is cleared for green-channel port dispatch.'
    : blockers.length === 1
    ? '1 critical compliance blocker must be resolved before customs shipping bill clearance.'
    : `${blockers.length} compliance prerequisites require verification prior to port gate-in.`;

  return {
    totalScore,
    readinessState,
    isExportReady,
    greenChannelActive,
    criticalBlockersCount,
    totalBlockersCount: blockers.length,
    categoryScores: {
      business: {
        score: businessScore,
        weight: 20,
        label: 'Business & Registrations',
        earnedPoints: businessEarned,
        totalPoints: 100,
        completedItemsCount: (isGstVerified ? 1 : 0) + (isIecVerified ? 1 : 0),
        totalItemsCount: 2,
      },
      documents: {
        score: docScore,
        weight: 25,
        label: 'Export Documents',
        earnedPoints: docEarnedWeight,
        totalPoints: docTotalWeight || 100,
        completedItemsCount: docVerifiedCount,
        totalItemsCount: docReqs.length,
      },
      certifications: {
        score: certScore,
        weight: 20,
        label: 'Product Certifications',
        earnedPoints: certEarnedWeight,
        totalPoints: certTotalWeight || 100,
        completedItemsCount: certVerifiedCount,
        totalItemsCount: certReqs.length,
      },
      packaging: {
        score: packagingScore,
        weight: 15,
        label: 'Packaging & Labelling',
        earnedPoints: packagingEarnedWeight,
        totalPoints: packagingTotalWeight || 100,
        completedItemsCount: packagingCompletedCount,
        totalItemsCount: packagingItems.length,
      },
      shipment: {
        score: shipmentScore,
        weight: 20,
        label: 'Shipment Prerequisites',
        earnedPoints: shipmentEarnedWeight,
        totalPoints: shipmentTotalWeight || 100,
        completedItemsCount: shipmentVerifiedCount,
        totalItemsCount: shipmentReqs.length,
      },
    },
    blockers,
    nextActions,
    summary,
  };
}

/**
 * Loads product country corridor mapping and computes full readiness assessment.
 */
export async function calculateReadinessScore(productCountryId: string): Promise<ReadinessScoreResult> {
  const pc = await prisma.productCountry.findUnique({
    where: { id: productCountryId },
    select: {
      id: true,
      product: {
        select: {
          name: true,
          business: {
            select: {
              gstStatus: true,
              iecStatus: true,
              documents: {
                select: {
                  type: true,
                  status: true,
                },
              },
            },
          },
        },
      },
      country: {
        select: {
          id: true,
          name: true,
          isoCode: true,
        },
      },
      requirements: {
        select: {
          id: true,
          type: true,
          priority: true,
          status: true,
          weight: true,
          title: true,
          reason: true,
          completedAt: true,
          rule: {
            select: {
              blocksDispatch: true,
              priority: true,
            },
          },
          documents: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      },
      packagingItems: {
        select: {
          id: true,
          title: true,
          type: true,
          priority: true,
          mandatory: true,
          status: true,
          notes: true,
        },
      },
    },
  });

  if (!pc) {
    throw new Error('Product country mapping not found');
  }

  return calculateReadinessFromData(pc as any);
}
