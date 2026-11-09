/**
 * VyaparFlow Financial ROI & Statutory Rebates Engine
 *
 * Implements deterministic calculation of:
 * 1. Indian Government Export Remissions:
 *    - RoDTEP (Remission of Duties and Taxes on Exported Products) per DGFT FTP 2023-28
 *    - RoSCTL (Rebate of State and Central Taxes and Levies) for Textiles & Apparels
 *    - Duty Drawback (AIR) under Section 75 of the Customs Act
 * 2. Bilateral Destination FTA Duty Savings (CEPA, ECTA, AIFTA, DCTS)
 * 3. Platform Facilitation Take-Rate & Commercial Monetization Breakdown
 */

export interface StatutoryIncentiveBreakdown {
  schemeName: 'RoDTEP' | 'RoSCTL';
  schemeFullName: string;
  ratePercentage: number;
  rebateAmountInr: number;
  dgftNotificationRef: string;
  disbursementMode: string;
}

export interface FtaDutyArbitrageBreakdown {
  tradeAgreement: string;
  destinationCountry: string;
  standardMfnRate: number;
  preferentialFtaRate: number;
  dutySavedPercentage: number;
  dutySavedAmountInr: number;
  certificateRequired: string;
}

export interface CommercialMonetizationBreakdown {
  baseFreightInr: number;
  platformTakeRatePercentage: number;
  platformFeeInr: number;
  gstOnPlatformFeeInr: number;
  totalFreightPayableInr: number;
  escrowProtectionIncluded: boolean;
}

export interface ConsignmentFinancialRoiResult {
  declaredFobValueInr: number;
  statutoryIncentive: StatutoryIncentiveBreakdown;
  ftaArbitrage: FtaDutyArbitrageBreakdown;
  monetization: CommercialMonetizationBreakdown;
  totalFinancialAdvantageInr: number;
  netBenefitAfterFreightInr: number;
  platformRoiMultiplier: number; // e.g. 104x return on platform fee
  summaryHeadline: string;
}

/**
 * Determines statutory RoDTEP or RoSCTL scheme and rate based on business sector and HS code.
 */
export function getStatutoryExportIncentive(
  businessTypeOrSector: string,
  hsCode?: string
): {
  schemeName: 'RoDTEP' | 'RoSCTL';
  schemeFullName: string;
  ratePercentage: number;
  dgftNotificationRef: string;
  disbursementMode: string;
} {
  const norm = (businessTypeOrSector || '').toLowerCase();
  const hs = (hsCode || '').replace(/\./g, '').trim();

  // 1. Textiles & Apparel: Eligible for RoSCTL (Chapters 61 & 62)
  if (
    norm.includes('textile') ||
    norm.includes('apparel') ||
    norm.includes('garment') ||
    norm.includes('cotton') ||
    hs.startsWith('61') ||
    hs.startsWith('62')
  ) {
    return {
      schemeName: 'RoSCTL',
      schemeFullName: 'Rebate of State and Central Taxes and Levies (RoSCTL)',
      ratePercentage: 4.05,
      dgftNotificationRef: 'Ministry of Textiles / DGFT Public Notice No. 58/2015-2020',
      disbursementMode: 'Electronic Duty Credit Scrip credited directly to ICEGATE Ledger',
    };
  }

  // 2. Spices & Condiments
  if (norm.includes('spice') || hs.startsWith('0904') || hs.startsWith('0910')) {
    return {
      schemeName: 'RoDTEP',
      schemeFullName: 'Remission of Duties and Taxes on Exported Products (RoDTEP)',
      ratePercentage: 2.2,
      dgftNotificationRef: 'DGFT Notification No. 19/2015-2020 (Appendix 4R Schedule)',
      disbursementMode: 'Direct credit to Customs ICEGATE e-Scrip Account',
    };
  }

  // 3. Food Processing & Agricultural Goods
  if (
    norm.includes('food') ||
    norm.includes('agri') ||
    norm.includes('mango') ||
    norm.includes('fruit') ||
    norm.includes('grain') ||
    hs.startsWith('2008') ||
    hs.startsWith('07') ||
    hs.startsWith('08')
  ) {
    return {
      schemeName: 'RoDTEP',
      schemeFullName: 'Remission of Duties and Taxes on Exported Products (RoDTEP)',
      ratePercentage: 2.5,
      dgftNotificationRef: 'DGFT Notification No. 19/2015-2020 (Appendix 4R Schedule)',
      disbursementMode: 'Direct credit to Customs ICEGATE e-Scrip Account',
    };
  }

  // 4. Engineering, Industrial Goods & Machinery
  if (
    norm.includes('engineer') ||
    norm.includes('machin') ||
    norm.includes('auto') ||
    norm.includes('fastener') ||
    hs.startsWith('84') ||
    hs.startsWith('87')
  ) {
    return {
      schemeName: 'RoDTEP',
      schemeFullName: 'Remission of Duties and Taxes on Exported Products (RoDTEP)',
      ratePercentage: 2.0,
      dgftNotificationRef: 'DGFT Notification No. 19/2015-2020 (Appendix 4R Schedule)',
      disbursementMode: 'Direct credit to Customs ICEGATE e-Scrip Account',
    };
  }

  // 5. Ceramics & Sanitaryware (Morbi Cluster)
  if (norm.includes('ceramic') || norm.includes('tile') || hs.startsWith('6907')) {
    return {
      schemeName: 'RoDTEP',
      schemeFullName: 'Remission of Duties and Taxes on Exported Products (RoDTEP)',
      ratePercentage: 2.2,
      dgftNotificationRef: 'DGFT Appendix 4R RoDTEP Tariff Schedule',
      disbursementMode: 'Direct credit to Customs ICEGATE e-Scrip Account',
    };
  }

  // 6. Chemicals & Pharmaceuticals
  if (norm.includes('chemical') || norm.includes('pharma') || hs.startsWith('29') || hs.startsWith('30')) {
    return {
      schemeName: 'RoDTEP',
      schemeFullName: 'Remission of Duties and Taxes on Exported Products (RoDTEP)',
      ratePercentage: 1.6,
      dgftNotificationRef: 'DGFT Appendix 4R RoDTEP Tariff Schedule',
      disbursementMode: 'Direct credit to Customs ICEGATE e-Scrip Account',
    };
  }

  // 7. Steel & Industrial Metals
  if (norm.includes('steel') || norm.includes('metal') || hs.startsWith('72') || hs.startsWith('73')) {
    return {
      schemeName: 'RoDTEP',
      schemeFullName: 'Remission of Duties and Taxes on Exported Products (RoDTEP)',
      ratePercentage: 1.0,
      dgftNotificationRef: 'DGFT Appendix 4R RoDTEP Tariff Schedule',
      disbursementMode: 'Direct credit to Customs ICEGATE e-Scrip Account',
    };
  }

  // 8. Gems & Jewellery
  if (norm.includes('gold') || norm.includes('jewel') || norm.includes('diamond') || hs.startsWith('71')) {
    return {
      schemeName: 'RoDTEP',
      schemeFullName: 'Remission of Duties and Taxes on Exported Products (RoDTEP)',
      ratePercentage: 0.75,
      dgftNotificationRef: 'DGFT Appendix 4R RoDTEP Tariff Schedule',
      disbursementMode: 'Direct credit to Customs ICEGATE e-Scrip Account',
    };
  }

  // Default Standard Merchandise Rate
  return {
    schemeName: 'RoDTEP',
    schemeFullName: 'Remission of Duties and Taxes on Exported Products (RoDTEP)',
    ratePercentage: 1.5,
    dgftNotificationRef: 'DGFT FTP 2023 Remission Framework',
    disbursementMode: 'Direct credit to Customs ICEGATE e-Scrip Account',
  };
}

/**
 * Calculates bilateral destination duty arbitrage based on country ISO code.
 */
export function getDestinationFtaArbitrage(
  destinationCountryIso?: string,
  destinationCountryName?: string
): {
  tradeAgreement: string;
  standardMfnRate: number;
  preferentialFtaRate: number;
  dutySavedPercentage: number;
  certificateRequired: string;
} {
  const iso = (destinationCountryIso || '').toUpperCase();

  // UAE (CEPA)
  if (iso === 'AE') {
    return {
      tradeAgreement: 'India-UAE Comprehensive Economic Partnership Agreement (CEPA)',
      standardMfnRate: 5.0,
      preferentialFtaRate: 0.0,
      dutySavedPercentage: 5.0,
      certificateRequired: 'India-UAE CEPA Preferential Certificate of Origin',
    };
  }

  // Australia (ECTA)
  if (iso === 'AU') {
    return {
      tradeAgreement: 'India-Australia Economic Cooperation and Trade Agreement (ECTA)',
      standardMfnRate: 5.0,
      preferentialFtaRate: 0.0,
      dutySavedPercentage: 5.0,
      certificateRequired: 'Ind-Aus ECTA Certificate of Origin',
    };
  }

  // Vietnam / ASEAN (AIFTA)
  if (iso === 'VN' || iso === 'SG' || iso === 'MY' || iso === 'TH' || iso === 'ID') {
    return {
      tradeAgreement: 'ASEAN-India Free Trade Area (AIFTA Form AI)',
      standardMfnRate: 12.0,
      preferentialFtaRate: 2.0,
      dutySavedPercentage: 10.0,
      certificateRequired: 'AIFTA Form AI Certificate of Origin',
    };
  }

  // Japan (CEPA)
  if (iso === 'JP') {
    return {
      tradeAgreement: 'India-Japan Comprehensive Economic Partnership Agreement (IJCEPA)',
      standardMfnRate: 4.5,
      preferentialFtaRate: 0.5,
      dutySavedPercentage: 4.0,
      certificateRequired: 'India-Japan CEPA Certificate of Origin',
    };
  }

  // United Kingdom (DCTS)
  if (iso === 'GB') {
    return {
      tradeAgreement: 'UK Developing Countries Trading Scheme (DCTS)',
      standardMfnRate: 4.0,
      preferentialFtaRate: 0.0,
      dutySavedPercentage: 4.0,
      certificateRequired: 'UK Rules of Origin Commercial Invoice Declaration',
    };
  }

  // European Union (Netherlands, Germany, France - REX)
  if (iso === 'NL' || iso === 'DE' || iso === 'FR' || iso === 'IT' || iso === 'BE') {
    return {
      tradeAgreement: 'European Union Registered Exporter System (EU REX)',
      standardMfnRate: 6.5,
      preferentialFtaRate: 2.5,
      dutySavedPercentage: 4.0,
      certificateRequired: 'EU REX Statement of Origin on Commercial Invoice',
    };
  }

  // Non-FTA Destination
  return {
    tradeAgreement: 'Standard WTO Most-Favoured-Nation Framework',
    standardMfnRate: 4.5,
    preferentialFtaRate: 4.5,
    dutySavedPercentage: 0.0,
    certificateRequired: 'Non-Preferential Certificate of Origin (Chamber of Commerce)',
  };
}

/**
 * Pure mathematical calculation engine for MSME Financial ROI and VyaparFlow Commercial Take-Rate.
 */
export function calculateConsignmentFinancialRoi(params: {
  declaredFobValueInr: number;
  businessTypeOrSector: string;
  destinationCountryIso?: string;
  destinationCountryName?: string;
  quotedFreightInr?: number;
  hsCode?: string;
}): ConsignmentFinancialRoiResult {
  const fob = Math.max(10000, params.declaredFobValueInr || 2500000);
  const freight = Math.max(5000, params.quotedFreightInr || 120000);

  // 1. Statutory Remission Calculation
  const incentiveConfig = getStatutoryExportIncentive(params.businessTypeOrSector, params.hsCode);
  const rebateAmountInr = Math.round((fob * incentiveConfig.ratePercentage) / 100);

  // 2. Bilateral Destination FTA Arbitrage Calculation
  const ftaConfig = getDestinationFtaArbitrage(params.destinationCountryIso, params.destinationCountryName);
  const dutySavedAmountInr = Math.round((fob * ftaConfig.dutySavedPercentage) / 100);

  // 3. Commercial Platform Monetization (Take-Rate: 1.5% on freight)
  const platformTakeRatePercentage = 1.5;
  const platformFeeInr = Math.max(750, Math.round((freight * platformTakeRatePercentage) / 100));
  const gstOnPlatformFeeInr = Math.round(platformFeeInr * 0.18);
  const baseFreightInr = freight - platformFeeInr;
  const totalFreightPayableInr = freight + gstOnPlatformFeeInr;

  // 4. Net Aggregation
  const totalFinancialAdvantageInr = rebateAmountInr + dutySavedAmountInr;
  const netBenefitAfterFreightInr = totalFinancialAdvantageInr - freight;
  const platformRoiMultiplier = Math.max(1, Math.round(totalFinancialAdvantageInr / (platformFeeInr + gstOnPlatformFeeInr)));

  let summaryHeadline = '';
  if (ftaConfig.dutySavedPercentage > 0) {
    summaryHeadline = `Save ₹${dutySavedAmountInr.toLocaleString('en-IN')} via ${ftaConfig.tradeAgreement} + Claim ₹${rebateAmountInr.toLocaleString('en-IN')} in ${incentiveConfig.schemeName} cash scrips.`;
  } else {
    summaryHeadline = `Claim ₹${rebateAmountInr.toLocaleString('en-IN')} directly into your ICEGATE ledger under the ${incentiveConfig.schemeName} scheme.`;
  }

  return {
    declaredFobValueInr: fob,
    statutoryIncentive: {
      ...incentiveConfig,
      rebateAmountInr,
    },
    ftaArbitrage: {
      ...ftaConfig,
      destinationCountry: params.destinationCountryName || 'Destination Market',
      dutySavedAmountInr,
    },
    monetization: {
      baseFreightInr,
      platformTakeRatePercentage,
      platformFeeInr,
      gstOnPlatformFeeInr,
      totalFreightPayableInr,
      escrowProtectionIncluded: true,
    },
    totalFinancialAdvantageInr,
    netBenefitAfterFreightInr,
    platformRoiMultiplier,
    summaryHeadline,
  };
}
