import {
  getStatutoryExportIncentive,
  getDestinationFtaArbitrage,
  calculateConsignmentFinancialRoi,
} from '@/lib/services/financialRoi';

describe('VyaparFlow Financial ROI & Statutory Rebates Engine Tests', () => {
  describe('Pillar 1: DGFT Statutory Remissions (RoDTEP & RoSCTL)', () => {
    test('Textiles & Garments qualify for RoSCTL at 4.05%', () => {
      const incentive = getStatutoryExportIncentive('Textiles & Apparel', '6109.10.00');
      expect(incentive.schemeName).toBe('RoSCTL');
      expect(incentive.ratePercentage).toBe(4.05);
      expect(incentive.schemeFullName).toContain('Rebate of State and Central Taxes');
    });

    test('Food Processing qualifies for RoDTEP at 2.5%', () => {
      const incentive = getStatutoryExportIncentive('Food Processing & Agro', '2008.99.11');
      expect(incentive.schemeName).toBe('RoDTEP');
      expect(incentive.ratePercentage).toBe(2.5);
    });

    test('Spices & Condiments qualify for RoDTEP at 2.2%', () => {
      const incentive = getStatutoryExportIncentive('Spices & Condiments', '0904.11.20');
      expect(incentive.schemeName).toBe('RoDTEP');
      expect(incentive.ratePercentage).toBe(2.2);
    });

    test('Engineering Goods qualify for RoDTEP at 2.0%', () => {
      const incentive = getStatutoryExportIncentive('Engineering Goods', '8409.91.00');
      expect(incentive.schemeName).toBe('RoDTEP');
      expect(incentive.ratePercentage).toBe(2.0);
    });

    test('Ceramics & Tiles qualify for RoDTEP at 2.2%', () => {
      const incentive = getStatutoryExportIncentive('Ceramics & Tiles', '6907.21.00');
      expect(incentive.schemeName).toBe('RoDTEP');
      expect(incentive.ratePercentage).toBe(2.2);
    });

    test('Chemicals & Pharma qualify for RoDTEP at 1.6%', () => {
      const incentive = getStatutoryExportIncentive('Chemicals & Allied', '2922.49.00');
      expect(incentive.schemeName).toBe('RoDTEP');
      expect(incentive.ratePercentage).toBe(1.6);
    });
  });

  describe('Pillar 2: Bilateral FTA Duty Arbitrage Savings', () => {
    test('UAE corridor grants 5.0% CEPA preferential duty savings', () => {
      const fta = getDestinationFtaArbitrage('AE', 'United Arab Emirates');
      expect(fta.dutySavedPercentage).toBe(5.0);
      expect(fta.preferentialFtaRate).toBe(0.0);
      expect(fta.tradeAgreement).toContain('CEPA');
    });

    test('Australia corridor grants 5.0% ECTA preferential duty savings', () => {
      const fta = getDestinationFtaArbitrage('AU', 'Australia');
      expect(fta.dutySavedPercentage).toBe(5.0);
      expect(fta.preferentialFtaRate).toBe(0.0);
      expect(fta.tradeAgreement).toContain('ECTA');
    });

    test('Vietnam corridor grants 10.0% AIFTA Form AI duty savings', () => {
      const fta = getDestinationFtaArbitrage('VN', 'Vietnam');
      expect(fta.dutySavedPercentage).toBe(10.0);
      expect(fta.tradeAgreement).toContain('AIFTA');
    });

    test('Non-FTA destination reflects standard MFN with 0% duty saved', () => {
      const fta = getDestinationFtaArbitrage('BR', 'Brazil');
      expect(fta.dutySavedPercentage).toBe(0.0);
      expect(fta.tradeAgreement).toContain('WTO');
    });
  });

  describe('Pillar 3: End-to-End Consignment ROI & Platform Monetization', () => {
    test('Calculates exact financial returns on ₹25,00,000 consignment to Dubai', () => {
      const roi = calculateConsignmentFinancialRoi({
        declaredFobValueInr: 2500000,
        businessTypeOrSector: 'Food Processing & Agro',
        destinationCountryIso: 'AE',
        destinationCountryName: 'United Arab Emirates',
        quotedFreightInr: 120000,
        hsCode: '2008.99.11',
      });

      // 1. RoDTEP @ 2.5% on ₹25,00,000 = ₹62,500
      expect(roi.statutoryIncentive.rebateAmountInr).toBe(62500);

      // 2. CEPA @ 5% on ₹25,00,000 = ₹1,25,000
      expect(roi.ftaArbitrage.dutySavedAmountInr).toBe(125000);

      // 3. Total Financial Advantage = ₹1,87,500
      expect(roi.totalFinancialAdvantageInr).toBe(187500);

      // 4. Platform 1.5% take-rate on ₹1,20,000 freight = ₹1,800
      expect(roi.monetization.platformFeeInr).toBe(1800);
      expect(roi.monetization.gstOnPlatformFeeInr).toBe(324); // 18% of 1800

      // 5. Net Benefit after freight = ₹1,87,500 - ₹1,20,000 = ₹67,500 pure surplus
      expect(roi.netBenefitAfterFreightInr).toBe(67500);

      // 6. Platform ROI multiplier is high (₹1,87,500 benefit vs ₹2,124 fee)
      expect(roi.platformRoiMultiplier).toBeGreaterThan(80);
      expect(roi.summaryHeadline).toContain('CEPA');
    });

    test('Calculates RoSCTL return on ₹50,00,000 Textile consignment to Germany', () => {
      const roi = calculateConsignmentFinancialRoi({
        declaredFobValueInr: 5000000,
        businessTypeOrSector: 'Textiles & Garments',
        destinationCountryIso: 'DE',
        destinationCountryName: 'Germany',
        quotedFreightInr: 200000,
        hsCode: '6109.10.00',
      });

      // RoSCTL @ 4.05% on ₹50,00,000 = ₹2,02,500
      expect(roi.statutoryIncentive.schemeName).toBe('RoSCTL');
      expect(roi.statutoryIncentive.rebateAmountInr).toBe(202500);
      expect(roi.totalFinancialAdvantageInr).toBeGreaterThanOrEqual(202500);
    });
  });
});

