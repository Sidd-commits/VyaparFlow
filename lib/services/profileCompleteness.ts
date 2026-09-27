import { prisma } from '@/lib/prisma';
import { validateGSTIN, validateIEC } from '@/lib/businessTypeConfig';

export interface ProfileChecklistItem {
  key: string;
  category: 'identity' | 'address' | 'tax_registration' | 'catalog' | 'corridor';
  label: string;
  points: number;
  maxPoints: number;
  status: 'completed' | 'pending' | 'missing';
  reason: string;
  actionUrl: string;
  actionText: string;
}

export interface ProfileCompletenessResult {
  totalScore: number; // 0 - 100
  tier: 'Incomplete' | 'Basic Profile' | 'Verified Exporter' | 'Fully Certified Exporter';
  isComplete: boolean;
  categoryScores: {
    identity: { score: number; maxPoints: number; label: string };
    address: { score: number; maxPoints: number; label: string };
    taxRegistration: { score: number; maxPoints: number; label: string };
    catalog: { score: number; maxPoints: number; label: string };
    corridor: { score: number; maxPoints: number; label: string };
  };
  checklist: ProfileChecklistItem[];
  missingFields: string[];
  completedFields: string[];
  nextRecommendedAction?: {
    label: string;
    actionUrl: string;
    actionText: string;
    pointsToGain: number;
  };
}

export interface BusinessDataForProfile {
  id?: string;
  legalName?: string | null;
  displayName?: string | null;
  businessType?: string | null;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  gstStatus?: string | null;
  iecStatus?: string | null;
  products?: Array<{
    id: string;
    name: string;
    hsCode: string;
    destinations?: Array<{
      id: string;
      country?: { id: string; name: string; isoCode: string } | null;
      requirements?: Array<{ id: string; status: string }>;
    }>;
  }>;
  documents?: Array<{
    id: string;
    type: string;
    status: string;
  }>;
}

/**
 * Pure deterministic algorithm to calculate Exporter Profile Completeness (0-100%)
 * based on verified fields, government tax credentials, product catalog, and export corridors.
 */
export function calculateProfileCompletenessFromData(business: BusinessDataForProfile): ProfileCompletenessResult {
  const checklist: ProfileChecklistItem[] = [];
  const missingFields: string[] = [];
  const completedFields: string[] = [];

  let identityPoints = 0;
  let addressPoints = 0;
  let taxPoints = 0;
  let catalogPoints = 0;
  let corridorPoints = 0;

  // -------------------------------------------------------------
  // 1. Legal & Commercial Identity (Max 20 pts)
  // -------------------------------------------------------------
  const legalName = business.legalName?.trim() || '';
  const isLegalNameValid = legalName.length >= 3 && !legalName.toLowerCase().includes('pending');
  if (isLegalNameValid) {
    identityPoints += 10;
    completedFields.push('Registered Legal Entity Name');
    checklist.push({
      key: 'legal_name',
      category: 'identity',
      label: 'Registered Legal Entity Name',
      points: 10,
      maxPoints: 10,
      status: 'completed',
      reason: `Registered as "${legalName}"`,
      actionUrl: '/business',
      actionText: 'View Details',
    });
  } else {
    missingFields.push('Registered Legal Entity Name');
    checklist.push({
      key: 'legal_name',
      category: 'identity',
      label: 'Registered Legal Entity Name',
      points: 0,
      maxPoints: 10,
      status: 'missing',
      reason: 'Official registered entity name (Pvt Ltd, LLP, Sole Proprietorship) is required.',
      actionUrl: '/business',
      actionText: 'Set Legal Name',
    });
  }

  const displayName = business.displayName?.trim() || '';
  const isDisplayNameValid = displayName.length >= 2;
  if (isDisplayNameValid) {
    identityPoints += 5;
    completedFields.push('Commercial Brand Name');
    checklist.push({
      key: 'display_name',
      category: 'identity',
      label: 'Commercial Brand Name',
      points: 5,
      maxPoints: 5,
      status: 'completed',
      reason: `Commercial identity: "${displayName}"`,
      actionUrl: '/business',
      actionText: 'View Details',
    });
  } else {
    missingFields.push('Commercial Brand Name');
    checklist.push({
      key: 'display_name',
      category: 'identity',
      label: 'Commercial Brand Name',
      points: 0,
      maxPoints: 5,
      status: 'missing',
      reason: 'Commercial trade or export brand name is missing.',
      actionUrl: '/business',
      actionText: 'Set Brand Name',
    });
  }

  const businessType = business.businessType?.trim() || '';
  const isBusinessTypeConfigured = businessType.length > 0 && businessType !== 'MSME Exporter';
  if (isBusinessTypeConfigured) {
    identityPoints += 5;
    completedFields.push('Industry Sector Classification');
    checklist.push({
      key: 'business_type',
      category: 'identity',
      label: 'Industry Sector Classification',
      points: 5,
      maxPoints: 5,
      status: 'completed',
      reason: `Classified under "${businessType}"`,
      actionUrl: '/business',
      actionText: 'Change Sector',
    });
  } else {
    missingFields.push('Industry Sector Classification');
    checklist.push({
      key: 'business_type',
      category: 'identity',
      label: 'Industry Sector Classification',
      points: 0,
      maxPoints: 5,
      status: 'pending',
      reason: 'Select your export product domain (Food, Steel, Gems, Textiles, etc.)',
      actionUrl: '/business',
      actionText: 'Select Sector',
    });
  }

  // -------------------------------------------------------------
  // 2. Physical & Operating Origin Address (Max 20 pts)
  // -------------------------------------------------------------
  const location = business.location?.trim() || '';
  const isLocationProvided = location.length >= 4;
  if (isLocationProvided) {
    addressPoints += 10;
    completedFields.push('Factory / Facility Address');
    checklist.push({
      key: 'facility_address',
      category: 'address',
      label: 'Operating Facility / Factory Address',
      points: 10,
      maxPoints: 10,
      status: 'completed',
      reason: `Located at ${location}`,
      actionUrl: '/business',
      actionText: 'Edit Location',
    });
  } else {
    missingFields.push('Factory / Facility Address');
    checklist.push({
      key: 'facility_address',
      category: 'address',
      label: 'Operating Facility / Factory Address',
      points: 0,
      maxPoints: 10,
      status: 'missing',
      reason: 'Operating address / industrial plot number required for port customs clearance.',
      actionUrl: '/business',
      actionText: 'Add Address',
    });
  }

  const city = business.city?.trim() || '';
  const state = business.state?.trim() || '';
  const isCityStateProvided = city.length >= 2 && state.length >= 2;
  if (isCityStateProvided) {
    addressPoints += 10;
    completedFields.push('City & Origin State Jurisdiction');
    checklist.push({
      key: 'city_state',
      category: 'address',
      label: 'City & Origin State Jurisdiction',
      points: 10,
      maxPoints: 10,
      status: 'completed',
      reason: `${city}, ${state}`,
      actionUrl: '/business',
      actionText: 'Edit',
    });
  } else {
    missingFields.push('City & State');
    checklist.push({
      key: 'city_state',
      category: 'address',
      label: 'City & Origin State Jurisdiction',
      points: 0,
      maxPoints: 10,
      status: 'missing',
      reason: 'City and state jurisdiction are required for GST jurisdictional assessment.',
      actionUrl: '/business',
      actionText: 'Set City/State',
    });
  }

  // -------------------------------------------------------------
  // 3. Statutory Tax & Regulatory Registrations (Max 30 pts)
  // -------------------------------------------------------------
  const gstStatus = business.gstStatus?.trim() || '';
  const gstLower = gstStatus.toLowerCase();
  const hasGstActive =
    (gstLower.includes('active') || gstLower.includes('verified')) &&
    !gstLower.includes('not') &&
    !gstLower.includes('pending') &&
    !gstLower.includes('missing') &&
    !gstLower.includes('unregistered');
  const gstDoc = business.documents?.find(
    (d) => (d.type === 'GST_CERTIFICATE' || d.type === 'GST') && (d.status === 'verified' || d.status === 'uploaded' || d.status === 'under_review')
  );

  if (hasGstActive) {
    taxPoints += 10;
    completedFields.push('GSTIN Registration Status');
    checklist.push({
      key: 'gst_status',
      category: 'tax_registration',
      label: 'GSTIN Registration Verification',
      points: 10,
      maxPoints: 10,
      status: 'completed',
      reason: gstStatus,
      actionUrl: '/business',
      actionText: 'View GSTIN',
    });
  } else {
    missingFields.push('GSTIN Registration');
    checklist.push({
      key: 'gst_status',
      category: 'tax_registration',
      label: 'GSTIN Registration Verification',
      points: 0,
      maxPoints: 10,
      status: 'missing',
      reason: 'Active 15-digit GSTIN is mandatory for all Indian export dispatches.',
      actionUrl: '/business',
      actionText: 'Enter GSTIN',
    });
  }

  if (gstDoc) {
    taxPoints += 5;
    completedFields.push('GSTIN Certificate Document');
    checklist.push({
      key: 'gst_doc',
      category: 'tax_registration',
      label: 'GSTIN Certificate Document Proof',
      points: 5,
      maxPoints: 5,
      status: gstDoc.status === 'verified' ? 'completed' : 'pending',
      reason: gstDoc.status === 'verified' ? 'Certificate verified by compliance officer' : 'Document uploaded, awaiting verification',
      actionUrl: '/business',
      actionText: 'View Document',
    });
  } else {
    missingFields.push('GSTIN Certificate Proof');
    checklist.push({
      key: 'gst_doc',
      category: 'tax_registration',
      label: 'GSTIN Certificate Document Proof',
      points: 0,
      maxPoints: 5,
      status: 'missing',
      reason: 'Upload official Form GST REG-06 certificate copy.',
      actionUrl: '/business',
      actionText: 'Upload GST Cert',
    });
  }

  const iecStatus = business.iecStatus?.trim() || '';
  const iecLower = iecStatus.toLowerCase();
  const hasIecActive =
    (iecLower.includes('active') || iecLower.includes('verified')) &&
    !iecLower.includes('not') &&
    !iecLower.includes('pending') &&
    !iecLower.includes('missing') &&
    !iecLower.includes('unregistered');
  const iecDoc = business.documents?.find(
    (d) => (d.type === 'IEC_CERTIFICATE' || d.type === 'IEC') && (d.status === 'verified' || d.status === 'uploaded' || d.status === 'under_review')
  );

  if (hasIecActive) {
    taxPoints += 10;
    completedFields.push('DGFT IEC Exporter Code');
    checklist.push({
      key: 'iec_status',
      category: 'tax_registration',
      label: 'DGFT IEC Exporter Code Registration',
      points: 10,
      maxPoints: 10,
      status: 'completed',
      reason: iecStatus,
      actionUrl: '/business',
      actionText: 'View IEC',
    });
  } else {
    missingFields.push('DGFT IEC Exporter Code');
    checklist.push({
      key: 'iec_status',
      category: 'tax_registration',
      label: 'DGFT IEC Exporter Code Registration',
      points: 0,
      maxPoints: 10,
      status: 'missing',
      reason: '10-digit DGFT Import Export Code (IEC) is mandatory for customs shipping bill.',
      actionUrl: '/business',
      actionText: 'Enter IEC',
    });
  }

  if (iecDoc) {
    taxPoints += 5;
    completedFields.push('DGFT IEC Certificate Document');
    checklist.push({
      key: 'iec_doc',
      category: 'tax_registration',
      label: 'DGFT IEC Certificate Document Proof',
      points: 5,
      maxPoints: 5,
      status: iecDoc.status === 'verified' ? 'completed' : 'pending',
      reason: iecDoc.status === 'verified' ? 'Certificate verified by compliance officer' : 'Document uploaded, awaiting verification',
      actionUrl: '/business',
      actionText: 'View Document',
    });
  } else {
    missingFields.push('DGFT IEC Certificate Proof');
    checklist.push({
      key: 'iec_doc',
      category: 'tax_registration',
      label: 'DGFT IEC Certificate Document Proof',
      points: 0,
      maxPoints: 5,
      status: 'missing',
      reason: 'Upload official DGFT e-IEC certificate copy.',
      actionUrl: '/business',
      actionText: 'Upload IEC Cert',
    });
  }

  // -------------------------------------------------------------
  // 4. Export Product Catalog Configuration (Max 15 pts)
  // -------------------------------------------------------------
  const products = business.products || [];
  const hasProducts = products.length > 0;
  if (hasProducts) {
    catalogPoints += 8;
    completedFields.push('Export Product Catalog');
    checklist.push({
      key: 'product_catalog',
      category: 'catalog',
      label: 'Export Commodity Catalog Defined',
      points: 8,
      maxPoints: 8,
      status: 'completed',
      reason: `${products.length} product(s) registered: "${products[0].name}"`,
      actionUrl: '/onboarding',
      actionText: 'Manage Products',
    });
  } else {
    missingFields.push('Export Product Catalog');
    checklist.push({
      key: 'product_catalog',
      category: 'catalog',
      label: 'Export Commodity Catalog Defined',
      points: 0,
      maxPoints: 8,
      status: 'missing',
      reason: 'Configure at least one export product to evaluate compliance rules.',
      actionUrl: '/onboarding',
      actionText: 'Add Export Product',
    });
  }

  const firstProductHs = products[0]?.hsCode?.trim() || '';
  const isHsCodeValid = firstProductHs.length >= 4 && !firstProductHs.includes('0000');
  if (isHsCodeValid) {
    catalogPoints += 7;
    completedFields.push('Harmonized System (HS) Code Classification');
    checklist.push({
      key: 'hs_code',
      category: 'catalog',
      label: 'Harmonized System (HS) Tariff Classification',
      points: 7,
      maxPoints: 7,
      status: 'completed',
      reason: `ITC-HS Code: ${firstProductHs}`,
      actionUrl: '/onboarding',
      actionText: 'View Classification',
    });
  } else {
    missingFields.push('HS Code Classification');
    checklist.push({
      key: 'hs_code',
      category: 'catalog',
      label: 'Harmonized System (HS) Tariff Classification',
      points: 0,
      maxPoints: 7,
      status: 'missing',
      reason: 'Specify valid 6 to 8 digit HS Code for tariff and compliance calculation.',
      actionUrl: '/onboarding',
      actionText: 'Set HS Code',
    });
  }

  // -------------------------------------------------------------
  // 5. Target International Export Corridor (Max 15 pts)
  // -------------------------------------------------------------
  const destinations = products.flatMap((p) => p.destinations || []).filter(Boolean);
  const hasDestinations = destinations.length > 0;
  if (hasDestinations) {
    corridorPoints += 8;
    completedFields.push('Target Destination Market');
    const destName = destinations[0].country?.name || 'Assigned Market';
    checklist.push({
      key: 'destination_country',
      category: 'corridor',
      label: 'Target Destination Export Market',
      points: 8,
      maxPoints: 8,
      status: 'completed',
      reason: `Target corridor: ${destName}`,
      actionUrl: '/readiness',
      actionText: 'View Corridor',
    });
  } else {
    missingFields.push('Target Destination Market');
    checklist.push({
      key: 'destination_country',
      category: 'corridor',
      label: 'Target Destination Export Market',
      points: 0,
      maxPoints: 8,
      status: 'missing',
      reason: 'Select destination market to auto-generate import regulations & duties.',
      actionUrl: '/onboarding',
      actionText: 'Select Destination',
    });
  }

  const hasGeneratedRequirements = destinations.some((d) => d.requirements && d.requirements.length > 0);
  if (hasGeneratedRequirements) {
    corridorPoints += 7;
    completedFields.push('Corridor Compliance Rule Mapping');
    checklist.push({
      key: 'corridor_rules',
      category: 'corridor',
      label: 'Corridor Compliance Rule Engine Initialized',
      points: 7,
      maxPoints: 7,
      status: 'completed',
      reason: 'Specific bilateral trade & customs rules loaded',
      actionUrl: '/readiness',
      actionText: 'View Rules',
    });
  } else {
    missingFields.push('Corridor Compliance Rule Mapping');
    checklist.push({
      key: 'corridor_rules',
      category: 'corridor',
      label: 'Corridor Compliance Rule Engine Initialized',
      points: 0,
      maxPoints: 7,
      status: hasDestinations ? 'pending' : 'missing',
      reason: 'Corridor compliance requirements checklist initialization pending.',
      actionUrl: '/readiness',
      actionText: 'Initialize Rules',
    });
  }

  // -------------------------------------------------------------
  // Final Score Aggregation
  // -------------------------------------------------------------
  const totalScore = Math.min(
    100,
    Math.max(0, identityPoints + addressPoints + taxPoints + catalogPoints + corridorPoints)
  );

  let tier: ProfileCompletenessResult['tier'] = 'Incomplete';
  if (totalScore === 100) {
    tier = 'Fully Certified Exporter';
  } else if (totalScore >= 80) {
    tier = 'Verified Exporter';
  } else if (totalScore >= 50) {
    tier = 'Basic Profile';
  } else {
    tier = 'Incomplete';
  }

  // Identify highest impact next action to complete profile
  const pendingItems = checklist.filter((item) => item.points < item.maxPoints);
  let nextRecommendedAction: ProfileCompletenessResult['nextRecommendedAction'] = undefined;
  if (pendingItems.length > 0) {
    // Sort by points to gain descending
    const sorted = [...pendingItems].sort((a, b) => (b.maxPoints - b.points) - (a.maxPoints - a.points));
    const best = sorted[0];
    nextRecommendedAction = {
      label: best.label,
      actionUrl: best.actionUrl,
      actionText: best.actionText,
      pointsToGain: best.maxPoints - best.points,
    };
  }

  return {
    totalScore,
    tier,
    isComplete: totalScore >= 85,
    categoryScores: {
      identity: { score: identityPoints, maxPoints: 20, label: 'Identity & Legal Entity' },
      address: { score: addressPoints, maxPoints: 20, label: 'Origin Facility & Location' },
      taxRegistration: { score: taxPoints, maxPoints: 30, label: 'Statutory GST & IEC Registrations' },
      catalog: { score: catalogPoints, maxPoints: 15, label: 'Export Product Catalog' },
      corridor: { score: corridorPoints, maxPoints: 15, label: 'Target Export Corridors' },
    },
    checklist,
    missingFields,
    completedFields,
    nextRecommendedAction,
  };
}

/**
 * Calculates Profile Completeness for a business by ID from Prisma database.
 */
export async function calculateProfileCompleteness(businessId: string): Promise<ProfileCompletenessResult> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      id: true,
      legalName: true,
      displayName: true,
      businessType: true,
      location: true,
      city: true,
      state: true,
      gstStatus: true,
      iecStatus: true,
      profileCompletion: true,
      products: {
        select: {
          id: true,
          name: true,
          hsCode: true,
          destinations: {
            select: {
              id: true,
              country: {
                select: { id: true, name: true, isoCode: true },
              },
              requirements: {
                select: { id: true, status: true },
              },
            },
          },
        },
      },
      documents: {
        select: {
          id: true,
          type: true,
          status: true,
        },
      },
    },
  });

  if (!business) {
    throw new Error(`Business record not found for ID: ${businessId}`);
  }

  return calculateProfileCompletenessFromData(business);
}

/**
 * Calculates and synchronizes Business.profileCompletion field in the database.
 */
export async function syncBusinessProfileCompleteness(businessId: string): Promise<ProfileCompletenessResult> {
  const result = await calculateProfileCompleteness(businessId);

  await prisma.business.update({
    where: { id: businessId },
    data: {
      profileCompletion: result.totalScore,
    },
  });

  return result;
}
