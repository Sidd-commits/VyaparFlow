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
        : destinationCountryIso === 'AU'
        ? 'Certificate of Origin (India-Australia ECTA Preferential)'
        : destinationCountryIso === 'VN' || destinationCountryIso === 'SG'
        ? 'Certificate of Origin (AIFTA Form AI Preferential)'
        : destinationCountryIso === 'JP'
        ? 'Certificate of Origin (India-Japan CEPA Preferential)'
        : destinationCountryIso === 'NL' || destinationCountryIso === 'DE' || destinationCountryIso === 'FR' || destinationCountryIso === 'IT'
        ? 'Certificate of Origin (EU Registered Exporter System - REX)'
        : destinationCountryIso === 'GB'
        ? 'Certificate of Origin (UK Developing Countries Trading Scheme / Standard)'
        : 'Certificate of Origin (Non-Preferential / Chamber of Commerce)',
      type: 'document',
      priority: 'critical',
      weight: 15,
      blocksDispatch: true,
      reason: destinationCountryIso === 'AE'
        ? 'Mandatory COO under India-UAE Comprehensive Economic Partnership Agreement (CEPA) for 0% preferential duty clearance.'
        : destinationCountryIso === 'AU'
        ? 'Mandatory COO under India-Australia Economic Cooperation and Trade Agreement (ECTA).'
        : destinationCountryIso === 'VN' || destinationCountryIso === 'SG'
        ? 'Mandatory COO under ASEAN-India Free Trade Agreement (AIFTA Form AI) for preferential duty benefits.'
        : destinationCountryIso === 'JP'
        ? 'Mandatory COO under India-Japan Comprehensive Economic Partnership Agreement (CEPA).'
        : destinationCountryIso === 'NL' || destinationCountryIso === 'DE' || destinationCountryIso === 'FR' || destinationCountryIso === 'IT'
        ? 'Self-certification statement or Chamber COO under EU Registered Exporter (REX) system for customs clearance at EU ports (Rotterdam, Hamburg).'
        : destinationCountryIso === 'GB'
        ? 'Chamber of Commerce Certificate of Origin for HM Revenue & Customs clearance in the United Kingdom.'
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
        title: 'Pharmexcil / Chemexcil Registration (RCMC)',
        type: 'certification',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
        reason: 'Statutory registration with Pharmexcil or Basic Chemicals, Cosmetics & Dyes Export Promotion Council.',
        mandatory: true,
      },
      {
        title: 'WHO-GMP & Certificate of Analysis (COA)',
        type: 'certification',
        priority: 'critical',
        weight: 20,
        blocksDispatch: true,
        reason: 'Good Manufacturing Practice validation and batch-specific chemical assay analysis.',
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
  } else if (destinationCountryIso === 'NL' || destinationCountryIso === 'DE' || destinationCountryIso === 'FR') {
    rules.push({
      title: 'EU CE Marking & REACH Chemical Declaration',
      type: 'certification',
      priority: 'high',
      weight: 10,
      blocksDispatch: false,
      reason: 'European Union single market compliance declaring conformity with EU health, safety, and environmental protection standards.',
      mandatory: true,
    });
    rules.push({
      title: 'EU Single Window Customs Document (Transit Port Rotterdam/Hamburg)',
      type: 'document',
      priority: 'critical',
      weight: 15,
      blocksDispatch: true,
      reason: 'EU Entry Summary Declaration (ENS) and customs entry manifest for maritime arrival at Port of Rotterdam.',
      mandatory: true,
    });
  } else if (destinationCountryIso === 'GB') {
    rules.push({
      title: 'UKCA Conformity Declaration & UK Customs Declaration Service (CDS)',
      type: 'document',
      priority: 'high',
      weight: 10,
      blocksDispatch: false,
      reason: 'UK Conformity Assessed marking and CDS electronic customs declaration.',
      mandatory: true,
    });
  } else if (destinationCountryIso === 'SA') {
    rules.push({
      title: 'Saber Platform Product & Shipment Certificate of Conformity (PCoC / SCoC)',
      type: 'certification',
      priority: 'critical',
      weight: 15,
      blocksDispatch: true,
      reason: 'Saudi Standards, Metrology and Quality Organization (SASO) Saber electronic portal certification.',
      mandatory: true,
    });
  } else if (destinationCountryIso === 'VN') {
    rules.push({
      title: 'Vietnam Customs Form AI & Quality Inspection Certificate',
      type: 'document',
      priority: 'high',
      weight: 10,
      blocksDispatch: false,
      reason: 'General Department of Vietnam Customs import clearance and state quality inspection.',
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
  hsCode?: string,
  productName?: string,
  destinationCountryIso?: string,
  destinationCountryName?: string
): TariffIntelligenceData {
  const safeHs = hsCode && hsCode !== 'PENDING' ? hsCode : 'HS Not Classified Yet';
  const safeProd = productName || 'Export Merchandise';
  const safeDestName = destinationCountryName || 'No export destination added yet';
  const iso = destinationCountryIso?.toUpperCase() || '';

  if (!destinationCountryIso || destinationCountryIso === '--' || !destinationCountryName) {
    return {
      corridorName: 'No Active Trade Corridor Configured',
      hsCode: safeHs,
      productName: safeProd,
      originCountry: 'India (JNPT / Nhava Sheva Port)',
      destinationCountry: 'No destination added yet',
      standardMfnTariff: 'N/A — Add destination market',
      preferentialTariff: 'N/A — Add destination market',
      tradeAgreement: 'Select an export destination to view bilateral trade agreements',
      dutySavings: 'Configure target market to calculate preferential duty savings',
      rulesOfOriginRule: 'Determined based on destination trade agreement',
      sourceAuthority: 'Indian Customs ICEGATE / DGFT Trade Intelligence',
      lastVerifiedDate: '12 Sep 2026',
      disclaimer: 'Add an export destination in Onboarding or Product Settings to view tailored tariff schedules and duty arbitrage.',
    };
  }

  // Vietnam (ASEAN - AIFTA)
  if (iso === 'VN') {
    return {
      corridorName: 'India → Vietnam (ASEAN-India Free Trade Area / AIFTA Corridor)',
      hsCode: safeHs,
      productName: safeProd,
      originCountry: 'India (Nhava Sheva / Chennai Port)',
      destinationCountry: 'Vietnam (Hai Phong / Cat Lai Port, Ho Chi Minh City)',
      standardMfnTariff: '10.0% – 15.0% Most-Favoured-Nation (MFN) Duty',
      preferentialTariff: '0.0% – 3.0% Preferential Duty (AIFTA Framework)',
      tradeAgreement: 'ASEAN-India Free Trade Agreement (AIFTA - Trade in Goods)',
      dutySavings: 'Save up to 10.0%–12.0% with verified Form AI Certificate of Origin',
      rulesOfOriginRule: 'Regional Value Content (RVC) ≥ 35% + Change in Tariff Subheading (CTSH)',
      sourceAuthority: 'General Department of Vietnam Customs / Ministry of Industry & Trade (MOIT) / DGFT India',
      lastVerifiedDate: '12 Sep 2026',
      disclaimer: 'Indicative preferential rate under AIFTA Schedule. Exporters must submit a valid Form AI Certificate of Origin issued by authorized agencies (EIC/DGFT) for preferential customs duty.',
    };
  }

  // United Arab Emirates (India-UAE CEPA)
  if (iso === 'AE') {
    return {
      corridorName: 'India → United Arab Emirates (India-UAE CEPA Corridor)',
      hsCode: safeHs,
      productName: safeProd,
      originCountry: 'India (Nhava Sheva / JNPT / Mundra)',
      destinationCountry: 'United Arab Emirates (Jebel Ali / Dubai DXB)',
      standardMfnTariff: '5.0% Most-Favoured-Nation (MFN) Duty',
      preferentialTariff: '0.0% Preferential Duty (Duty Free)',
      tradeAgreement: 'India-UAE Comprehensive Economic Partnership Agreement (CEPA)',
      dutySavings: 'Save 5.0% on declared CIF invoice value under CEPA tariff elimination',
      rulesOfOriginRule: 'Wholly Obtained (WO) or 40% Value Addition (VA) with CTSH Rule',
      sourceAuthority: 'Indian Customs ICEGATE / DGFT FTP 2023 / UAE Customs Tariff Schedule',
      lastVerifiedDate: '12 Sep 2026',
      disclaimer: 'Indicative tariff calculated based on published India-UAE CEPA schedule. Final customs duty assessed at port of destination based on verified CEPA Certificate of Origin.',
    };
  }

  // Germany & European Union (EU Single Market)
  if (iso === 'DE' || iso === 'NL' || iso === 'FR' || iso === 'IT' || iso === 'BE') {
    return {
      corridorName: `India → ${destinationCountryName} (EU Single Market Trade Corridor)`,
      hsCode: safeHs,
      productName: safeProd,
      originCountry: 'India (Nhava Sheva / Mumbai Air Cargo)',
      destinationCountry: `${destinationCountryName} (Hamburg / Rotterdam / Frankfurt)`,
      standardMfnTariff: '4.0% – 6.5% EU Common Customs Tariff (CCT)',
      preferentialTariff: 'Standard EU MFN / REX Self-Certification Scheme',
      tradeAgreement: 'EU Registered Exporter System (REX) & WTO MFN Schedule',
      dutySavings: 'REX statement on origin facilitates swift customs clearance across EU',
      rulesOfOriginRule: 'EU Non-Preferential Origin Rules / REX Statement on Commercial Invoice',
      sourceAuthority: 'European Commission TARIC Database / DGFT India REX Portal',
      lastVerifiedDate: '12 Sep 2026',
      disclaimer: 'Indicative TARIC rate for EU entry. Consignments must adhere to EU REACH, CE marking, and applicable food/textile safety directives.',
    };
  }

  // United States (USITC HTS)
  if (iso === 'US') {
    return {
      corridorName: 'India → United States (US Customs Trade Corridor)',
      hsCode: safeHs,
      productName: safeProd,
      originCountry: 'India (Nhava Sheva / JNPT)',
      destinationCountry: 'United States of America (New York / Newark / LA Port)',
      standardMfnTariff: '3.2% – 5.5% Standard MFN Tariff Rate',
      preferentialTariff: '3.2% (GSP Expired / Standard MFN Applicable)',
      tradeAgreement: 'WTO Most-Favoured-Nation Schedule',
      dutySavings: 'Standard duty applicable; FDA / Lacey Act / EPA compliance required',
      rulesOfOriginRule: 'Non-preferential Rules of Origin (Substantial Transformation)',
      sourceAuthority: 'US International Trade Commission (USITC HTS) / ICEGATE',
      lastVerifiedDate: '12 Sep 2026',
      disclaimer: 'Indicative US tariff rate under Harmonized Tariff Schedule (HTS). Merchandise processing fees (MPF) and harbor maintenance fees (HMF) apply separately.',
    };
  }

  // United Kingdom (UKCA / DCTS)
  if (iso === 'GB') {
    return {
      corridorName: 'India → United Kingdom (UK Trade Tariff Corridor)',
      hsCode: safeHs,
      productName: safeProd,
      originCountry: 'India (Nhava Sheva / Chennai / Delhi Cargo)',
      destinationCountry: 'United Kingdom (Felixstowe / Southampton / London Heathrow)',
      standardMfnTariff: '4.0% UK Global Tariff (UKGT)',
      preferentialTariff: 'Reduced / Standard under Developing Countries Trading Scheme (DCTS)',
      tradeAgreement: 'UK Developing Countries Trading Scheme (DCTS)',
      dutySavings: 'Eligible for DCTS preferential tariff margins on qualifying goods',
      rulesOfOriginRule: 'UK Rules of Origin Declaration on invoice with EORI registration',
      sourceAuthority: 'HM Revenue & Customs (HMRC) Trade Tariff / DGFT',
      lastVerifiedDate: '12 Sep 2026',
      disclaimer: 'Indicative rate under UK Global Tariff. Consignments require UKCA compliance or UK product safety declarations where applicable.',
    };
  }

  // Australia (India-Australia ECTA)
  if (iso === 'AU') {
    return {
      corridorName: 'India → Australia (India-Australia ECTA Free Trade Corridor)',
      hsCode: safeHs,
      productName: safeProd,
      originCountry: 'India (Nhava Sheva / Chennai)',
      destinationCountry: 'Australia (Port of Melbourne / Sydney Botany)',
      standardMfnTariff: '5.0% Standard Australian Customs Tariff',
      preferentialTariff: '0.0% Preferential Duty under ECTA Agreement',
      tradeAgreement: 'Economic Cooperation and Trade Agreement (Ind-Aus ECTA)',
      dutySavings: 'Save 5.0% on declared value with ECTA preferential Certificate of Origin',
      rulesOfOriginRule: 'Wholly Produced or Qualifying Value Content (QVC) ≥ 35% with CTSH',
      sourceAuthority: 'Australian Border Force (ABF) / DFAT / DGFT India',
      lastVerifiedDate: '12 Sep 2026',
      disclaimer: 'Indicative preferential rate under Ind-Aus ECTA. Requires COO issued by designated Indian issuing agencies.',
    };
  }

  // Saudi Arabia (SASO Saber / GCC)
  if (iso === 'SA') {
    return {
      corridorName: 'India → Saudi Arabia (SASO Saber Corridor)',
      hsCode: safeHs,
      productName: safeProd,
      originCountry: 'India (Nhava Sheva / Mundra / Cochin)',
      destinationCountry: 'Kingdom of Saudi Arabia (Jeddah Islamic Port / King Abdulaziz Port, Dammam)',
      standardMfnTariff: '5.0% – 12.0% GCC Unified Customs Tariff',
      preferentialTariff: '5.0% Standard GCC Common External Tariff',
      tradeAgreement: 'GCC Unified Customs Tariff Schedule',
      dutySavings: 'Standard GCC rate; fast-track clearance via Saber e-platform certification',
      rulesOfOriginRule: 'Standard Certificate of Origin authenticated with Arabic labelling',
      sourceAuthority: 'Zakat, Tax and Customs Authority (ZATCA) / SASO Saber / DGFT',
      lastVerifiedDate: '12 Sep 2026',
      disclaimer: 'Consignments require Saber product & shipment conformity certificates (PCoC / SCoC) prior to vessel departure.',
    };
  }

  // Japan (India-Japan CEPA)
  if (iso === 'JP') {
    return {
      corridorName: 'India → Japan (India-Japan CEPA Corridor)',
      hsCode: safeHs,
      productName: safeProd,
      originCountry: 'India (Nhava Sheva / JNPT)',
      destinationCountry: 'Japan (Tokyo Port / Yokohama / Osaka)',
      standardMfnTariff: '3.5% – 5.0% Japan Customs Tariff',
      preferentialTariff: '0.0% – 1.8% Preferential CEPA Duty',
      tradeAgreement: 'Comprehensive Economic Partnership Agreement (India-Japan CEPA)',
      dutySavings: 'Save up to 3.5% with certified IJCEPA Certificate of Origin',
      rulesOfOriginRule: 'Qualifying Value Content (QVC) ≥ 35% with Change in Tariff Heading (CTH)',
      sourceAuthority: 'Japan Customs (Ministry of Finance) / METI / DGFT India',
      lastVerifiedDate: '12 Sep 2026',
      disclaimer: 'Preferential tariff rate under IJCEPA. Requires formal Certificate of Origin issued by Export Inspection Council (EIC).',
    };
  }

  // General Bilateral Corridor Fallback
  return {
    corridorName: `India → ${destinationCountryName} Trade Corridor`,
    hsCode: safeHs,
    productName: safeProd,
    originCountry: 'India (Nhava Sheva / JNPT)',
    destinationCountry: destinationCountryName,
    standardMfnTariff: '4.5% Standard MFN Tariff Rate',
    preferentialTariff: '4.5% Standard Duty Rate',
    tradeAgreement: 'Standard Bilateral Trade Framework (WTO MFN)',
    dutySavings: 'Standard WTO MFN tariff schedule applicable',
    rulesOfOriginRule: 'Standard Certificate of Origin (Non-Preferential)',
    sourceAuthority: 'ICEGATE Customs Tariff & DGFT Schedule',
    lastVerifiedDate: '12 Sep 2026',
    disclaimer: 'Indicative tariff estimate based on standard HS code classification. Please verify with destination customs broker for port clearance.',
  };
}
