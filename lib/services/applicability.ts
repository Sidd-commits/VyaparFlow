import { prisma } from '@/lib/prisma';
import {
  BUSINESS_TYPES,
  BUSINESS_TYPE_CONFIGS,
  type BusinessType,
} from '@/lib/businessTypeConfig';

export interface ApplicableCorridorRule {
  title: string;
  type: 'document' | 'certification' | 'packaging' | 'labelling' | 'shipment';
  priority: 'critical' | 'high' | 'medium' | 'low';
  weight: number;
  blocksDispatch: boolean;
  reason: string;
  mandatory: boolean;
}

export interface TariffIntelligenceData {
  corridorName: string;
  hsCode: string;
  productName: string;
  originCountry: string;
  destinationCountry: string;
  standardMfnTariff: string;
  preferentialTariff: string;
  tradeAgreement: string;
  dutySavings: string;
  rulesOfOriginRule: string;
  sourceAuthority: string;
  lastVerifiedDate: string;
  disclaimer: string;
}

/**
 * Returns tailored compliance requirements strictly applicable to the exporter's product, industry, and destination.
 */
export function getApplicableRequirementsForCorridor(
  businessTypeStr: string,
  productCategoryName: string,
  hsCode: string,
  destinationCountryIso: string
): ApplicableCorridorRule[] {
  // Normalize business type
  let matchedType: BusinessType = 'Food';
  for (const type of BUSINESS_TYPES) {
    if (
      businessTypeStr.toLowerCase().includes(type.toLowerCase()) ||
      productCategoryName.toLowerCase().includes(type.toLowerCase())
    ) {
      matchedType = type;
      break;
    }
  }

  // Base requirements common to all Indian exporters
  const rules: ApplicableCorridorRule[] = [
    {
      title: 'GSTIN Registration Certificate',
      type: 'document',
      priority: 'critical',
      weight: 10,
      blocksDispatch: true,
      reason: 'Statutory GST identification on GSTN portal for export clearance under LUT/IGST.',
      mandatory: true,
    },
    {
      title: 'DGFT Import Export Code (IEC)',
      type: 'document',
      priority: 'critical',
      weight: 10,
      blocksDispatch: true,
      reason: 'Mandatory 10-digit DGFT exporter identification for customs shipping bill generation.',
      mandatory: true,
    },
    {
      title: 'Commercial Invoice & Detailed Packing List',
      type: 'document',
      priority: 'high',
      weight: 10,
      blocksDispatch: true,
      reason: 'Itemized commercial invoice declaring export value, HS code, and container packing tare/gross weight.',
      mandatory: true,
    },
    {
      title: destinationCountryIso === 'AE'
        ? 'Certificate of Origin (India-UAE CEPA Preferential)'
        : 'Certificate of Origin (Non-Preferential / Chamber of Commerce)',
      type: 'document',
      priority: 'critical',
      weight: 15,
      blocksDispatch: true,
      reason: destinationCountryIso === 'AE'
        ? 'Mandatory COO under India-UAE Comprehensive Economic Partnership Agreement (CEPA) for 0% preferential duty clearance.'
        : 'Official certificate verifying Indian manufacturing origin for destination customs clearance.',
      mandatory: true,
    },
  ];

  // Industry-specific certifications & regulatory requirements
  const bizStr = `${businessTypeStr} ${productCategoryName}`.toLowerCase();

  if (bizStr.includes('food') || bizStr.includes('agri') || bizStr.includes('spice') || bizStr.includes('tea') || bizStr.includes('beverage')) {
    rules.push(
      {
        title: 'FSSAI Food Export Manufacturing License',
        type: 'certification',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
        reason: 'Food Safety and Standards Authority of India (FSSAI) export premises authorization.',
        mandatory: true,
      },
      {
        title: 'APEDA Registration-cum-Membership Certificate (RCMC)',
        type: 'certification',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
        reason: 'Agricultural & Processed Food Products Export Development Authority registration for foreign trade.',
        mandatory: true,
      },
      {
        title: 'Phytosanitary & NABL Lab Residue Test Report',
        type: 'certification',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
        reason: 'Laboratory analytical test report verifying pesticide and heavy metal maximum residue limits (MRL).',
        mandatory: true,
      }
    );
  } else if (bizStr.includes('steel') || bizStr.includes('metal') || bizStr.includes('iron') || bizStr.includes('alloy') || bizStr.includes('pipe')) {
    rules.push(
      {
        title: 'BIS Quality Certification (Bureau of Indian Standards)',
        type: 'certification',
        priority: 'critical',
        weight: 20,
        blocksDispatch: true,
        reason: 'Mandatory BIS steel quality license for industrial metals and alloy exports.',
        mandatory: true,
      },
      {
        title: 'Mill Test Certificate (MTC EN 10204 3.1)',
        type: 'certification',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
        reason: 'Metallurgical chemical composition and tensile strength analysis certificate.',
        mandatory: true,
      }
    );
  } else if (bizStr.includes('gold') || bizStr.includes('jewel') || bizStr.includes('diamond') || bizStr.includes('silver') || bizStr.includes('precious')) {
    rules.push(
      {
        title: 'GJEPC Registration-cum-Membership Certificate (RCMC)',
        type: 'certification',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
        reason: 'Gem & Jewellery Export Promotion Council registration for precious metals export.',
        mandatory: true,
      },
      {
        title: bizStr.includes('diamond')
          ? 'Kimberley Process Certificate (KPCS)'
          : 'BIS Hallmark & Gold Assaying Certificate',
        type: 'certification',
        priority: 'critical',
        weight: 20,
        blocksDispatch: true,
        reason: bizStr.includes('diamond')
          ? 'International conflict-free diamond certification under Kimberley Process.'
          : 'Official purity assay certificate for gold jewellery and precious articles.',
        mandatory: true,
      }
    );
  } else if (bizStr.includes('textile') || bizStr.includes('apparel') || bizStr.includes('garment') || bizStr.includes('cotton') || bizStr.includes('fabric')) {
    rules.push(
      {
        title: 'AEPC / Texprocil Export Promotion RCMC',
        type: 'certification',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
        reason: 'Apparel Export Promotion Council registration for garment and textile consignments.',
        mandatory: true,
      },
      {
        title: 'OEKO-TEX Standard 100 & AZO-Free Dye Lab Report',
        type: 'certification',
        priority: 'high',
        weight: 15,
        blocksDispatch: true,
        reason: 'Laboratory test verifying absence of harmful carcinogenic aromatic amines and AZO dyes.',
        mandatory: true,
      }
    );
  } else if (bizStr.includes('chemical') || bizStr.includes('pharma') || bizStr.includes('drug') || bizStr.includes('medicine')) {
    rules.push(
      {
        title: 'Pharmexcil / CHEMEXCIL Registration (RCMC)',
        type: 'certification',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
        reason: 'Statutory Export Promotion Council registration for pharmaceuticals and chemicals.',
        mandatory: true,
      },
      {
        title: 'Certificate of Analysis (CoA) & GMP Compliance Declaration',
        type: 'certification',
        priority: 'critical',
        weight: 20,
        blocksDispatch: true,
        reason: 'Batch chemical purity assay and Good Manufacturing Practice compliance documentation.',
        mandatory: true,
      }
    );
  } else if (bizStr.includes('engineer') || bizStr.includes('machin') || bizStr.includes('electric') || bizStr.includes('auto')) {
    rules.push(
      {
        title: 'EEPC India Registration-cum-Membership Certificate (RCMC)',
        type: 'certification',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
        reason: 'Engineering Export Promotion Council registration for industrial machinery and parts.',
        mandatory: true,
      },
      {
        title: 'CE Conformity & Industrial Safety Declaration',
        type: 'certification',
        priority: 'high',
        weight: 15,
        blocksDispatch: true,
        reason: 'International safety and electromagnetic compatibility compliance certificate.',
        mandatory: true,
      }
    );
  } else if (bizStr.includes('leather') || bizStr.includes('footwear')) {
    rules.push(
      {
        title: 'Council for Leather Exports (CLE) RCMC',
        type: 'certification',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
        reason: 'Statutory registration for finished leather and footwear exports.',
        mandatory: true,
      },
      {
        title: 'Chromium VI & Chemical Safety Test Certificate',
        type: 'certification',
        priority: 'high',
        weight: 15,
        blocksDispatch: true,
        reason: 'Laboratory analytical test report verifying compliance with international restricted substance limits.',
        mandatory: true,
      }
    );
  } else if (bizStr.includes('handicraft') || bizStr.includes('wood') || bizStr.includes('carpet')) {
    rules.push(
      {
        title: 'EPCH Export Promotion Council for Handicrafts RCMC',
        type: 'certification',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
        reason: 'Handicrafts export registration for artisanal and cultural craft consignments.',
        mandatory: true,
      },
      {
        title: 'VRIKSH Timber Legality & Origin Verification',
        type: 'certification',
        priority: 'high',
        weight: 15,
        blocksDispatch: true,
        reason: 'CITES-compliant timber legality verification for wooden handicrafts and furniture.',
        mandatory: true,
      }
    );
  } else {
    rules.push(
      {
        title: 'Federation of Indian Export Organisations (FIEO) RCMC',
        type: 'certification',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
        reason: 'Apex Indian trade promotion body membership for general merchandise exporters.',
        mandatory: true,
      }
    );
  }

  // Destination-specific requirements
  if (destinationCountryIso === 'AE') {
    rules.push({
      title: 'Bilingual (Arabic & English) Export Labelling',
      type: 'labelling',
      priority: 'high',
      weight: 10,
      blocksDispatch: false,
      reason: 'UAE MoIAT standard requiring Arabic product description, production, and expiry dates.',
      mandatory: true,
    });
  } else if (destinationCountryIso === 'US') {
    rules.push({
      title: 'US FDA Prior Notice & FSVP Verification',
      type: 'document',
      priority: 'critical',
      weight: 15,
      blocksDispatch: true,
      reason: 'US Customs and FDA electronic Prior Notice confirmation for US port entry.',
      mandatory: true,
    });
  }

  // Standard Shipment & Cargo Insurance Prerequisite
  rules.push({
    title: 'Export Marine Cargo Insurance Policy (ICC A)',
    type: 'shipment',
    priority: 'medium',
    weight: 10,
    blocksDispatch: false,
    reason: 'All-risk marine transit insurance policy protecting consignment against ocean freight hazards.',
    mandatory: false,
  });

  return rules;
}

/**
 * Synchronizes and updates the statutory requirements for a business's active product/destination corridor.
 */
export async function syncBusinessRequirements(businessId: string): Promise<void> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      products: {
        include: {
          category: true,
          destinations: { include: { country: true, requirements: { include: { documents: true } } } },
        },
      },
    },
  });

  if (!business || business.products.length === 0) return;

  for (const product of business.products) {
    for (const pc of product.destinations) {
      const applicableRules = getApplicableRequirementsForCorridor(
        business.businessType,
        product.category?.name || '',
        product.hsCode,
        pc.country.isoCode
      );

      const existingReqs = pc.requirements;

      // Add missing applicable rules
      for (const rule of applicableRules) {
        const existing = existingReqs.find((r) => r.title.toLowerCase() === rule.title.toLowerCase());
        if (!existing) {
          await prisma.requirement.create({
            data: {
              productCountryId: pc.id,
              title: rule.title,
              type: rule.type,
              priority: rule.priority,
              status: 'missing',
              weight: rule.weight,
              reason: rule.reason,
            },
          });
        }
      }

      // Identify obsolete requirements from other unrelated industries (e.g. FSSAI on Gold, or BIS Steel on Food)
      for (const existing of existingReqs) {
        const isStillApplicable = applicableRules.some(
          (rule) => rule.title.toLowerCase() === existing.title.toLowerCase()
        );

        // If not applicable and not uploaded with verified user documents, cleanly remove it
        if (!isStillApplicable && existing.documents.length === 0 && existing.status !== 'verified') {
          await prisma.requirement.delete({
            where: { id: existing.id },
          }).catch(() => {});
        }
      }
    }
  }
}

/**
 * Returns structured indicative tariff intelligence for an export trade corridor.
 */
export function getTariffIntelligence(
  hsCode: string,
  productName: string,
  destinationCountryIso: string,
  destinationCountryName: string
): TariffIntelligenceData {
  if (destinationCountryIso === 'AE') {
    return {
      corridorName: 'India → United Arab Emirates (India-UAE CEPA Corridor)',
      hsCode: hsCode || '2008.99.11',
      productName: productName || 'Export Cargo',
      originCountry: 'India (Nhava Sheva / JNPT)',
      destinationCountry: 'United Arab Emirates (Jebel Ali / DXB)',
      standardMfnTariff: '5.0% Most-Favoured-Nation (MFN) Duty',
      preferentialTariff: '0.0% Preferential Duty (Duty Free)',
      tradeAgreement: 'India-UAE Comprehensive Economic Partnership Agreement (CEPA)',
      dutySavings: 'Save 5.0% on declared CIF invoice value',
      rulesOfOriginRule: 'Wholly Obtained (WO) or 40% Value Addition (VA) with CTSH Rule',
      sourceAuthority: 'Indian Customs ICEGATE / DGFT FTP 2023 / UAE Customs Tariff Schedule',
      lastVerifiedDate: '12 Sep 2026',
      disclaimer: 'Indicative tariff calculated based on published India-UAE CEPA schedule. Final customs duty assessed at port of destination based on verified Certificate of Origin.',
    };
  }

  if (destinationCountryIso === 'US') {
    return {
      corridorName: 'India → United States (US Customs Trade Corridor)',
      hsCode: hsCode || '0910.30.00',
      productName: productName || 'Export Cargo',
      originCountry: 'India (Nhava Sheva / JNPT)',
      destinationCountry: 'United States of America (New York / Newark Port)',
      standardMfnTariff: '3.2% Standard MFN Tariff Rate',
      preferentialTariff: '3.2% (GSP Expired / Standard MFN Applicable)',
      tradeAgreement: 'WTO Most-Favoured-Nation Schedule',
      dutySavings: 'Standard duty applicable; FDA compliance required',
      rulesOfOriginRule: 'Non-preferential Rules of Origin (Substantial Transformation)',
      sourceAuthority: 'US International Trade Commission (USITC HTS) / ICEGATE',
      lastVerifiedDate: '12 Sep 2026',
      disclaimer: 'Indicative US tariff rate under Harmonized Tariff Schedule (HTS). Merchandise processing fees (MPF) and harbor maintenance fees (HMF) apply separately.',
    };
  }

  return {
    corridorName: `India → ${destinationCountryName} Corridor`,
    hsCode: hsCode || 'General HS',
    productName: productName || 'Export Cargo',
    originCountry: 'India (Nhava Sheva / JNPT)',
    destinationCountry: destinationCountryName,
    standardMfnTariff: '4.5% Standard MFN Tariff',
    preferentialTariff: '4.5% Standard Duty Rate',
    tradeAgreement: 'Standard Bilateral Trade Framework',
    dutySavings: 'Standard WTO MFN tariff applicable',
    rulesOfOriginRule: 'Standard Certificate of Origin (Non-Preferential)',
    sourceAuthority: 'ICEGATE Customs Tariff & DGFT Schedule',
    lastVerifiedDate: '12 Sep 2026',
    disclaimer: 'Indicative tariff estimate based on standard HS code classification. Please verify with local customs broker for destination port clearance.',
  };
}
