import {
  getApplicableRequirementsForCorridor,
  getTariffIntelligence,
} from '@/lib/services/applicability';
import {
  BUSINESS_TYPES,
  BUSINESS_TYPE_CONFIGS,
} from '@/lib/businessTypeConfig';

describe('VyaparFlow — Multi-Cluster Sector Compliance & Tariff Intelligence Engine', () => {
  describe('Pillar 1: Dynamic Industry Cluster Isolation & Anti-Hallucination Barrier', () => {
    test('1. Food Exporter receives APEDA & FSSAI, never Textiles or Engineering rules', () => {
      const foodRules = getApplicableRequirementsForCorridor(
        'Food & Processed Agri',
        'Mango Pulp Canned',
        '2008.99.11',
        'NL'
      );
      const titles = foodRules.map((r) => r.title.toLowerCase());

      // Must include Food statutory compliance
      expect(titles.some((t) => t.includes('fssai'))).toBe(true);
      expect(titles.some((t) => t.includes('apeda'))).toBe(true);
      expect(titles.some((t) => t.includes('phytosanitary'))).toBe(true);

      // Must NEVER leak unrelated industry rules
      expect(titles.some((t) => t.includes('spices board'))).toBe(false);
      expect(titles.some((t) => t.includes('oeko-tex'))).toBe(false);
      expect(titles.some((t) => t.includes('eepc'))).toBe(false);
      expect(titles.some((t) => t.includes('capexil'))).toBe(false);
      expect(titles.some((t) => t.includes('gjepc'))).toBe(false);
      expect(titles.some((t) => t.includes('kimberley'))).toBe(false);
    });

    test('2. Spices Exporter receives Spices Board & AGMARK, never general FSSAI or Textiles', () => {
      const spiceRules = getApplicableRequirementsForCorridor(
        'Spices & Condiments',
        'Malabar Black Pepper & Turmeric',
        '0904.11.20',
        'AE'
      );
      const titles = spiceRules.map((r) => r.title.toLowerCase());

      // Must include Spices statutory requirements
      expect(titles.some((t) => t.includes('spices board'))).toBe(true);
      expect(titles.some((t) => t.includes('agmark'))).toBe(true);
      expect(titles.some((t) => t.includes('aflatoxin'))).toBe(true);
      expect(titles.some((t) => t.includes('fumigation'))).toBe(true);

      // Must NEVER leak unrelated sectors
      expect(titles.some((t) => t.includes('fssai'))).toBe(false);
      expect(titles.some((t) => t.includes('oeko-tex'))).toBe(false);
      expect(titles.some((t) => t.includes('eepc'))).toBe(false);
      expect(titles.some((t) => t.includes('mill test'))).toBe(false);
      expect(titles.some((t) => t.includes('capexil'))).toBe(false);
    });

    test('3. Textiles Exporter receives AEPC, OEKO-TEX & GOTS, never FSSAI or Phytosanitary', () => {
      const textileRules = getApplicableRequirementsForCorridor(
        'Textiles & Garments',
        'Cotton Knitted Garments',
        '6109.10.00',
        'DE'
      );
      const titles = textileRules.map((r) => r.title.toLowerCase());

      // Must include Textile regulatory standards
      expect(titles.some((t) => t.includes('aepc') || t.includes('texprocil'))).toBe(true);
      expect(titles.some((t) => t.includes('oeko-tex'))).toBe(true);
      expect(titles.some((t) => t.includes('gots'))).toBe(true);

      // Must NEVER leak Food or Agro or Spices
      expect(titles.some((t) => t.includes('fssai'))).toBe(false);
      expect(titles.some((t) => t.includes('apeda'))).toBe(false);
      expect(titles.some((t) => t.includes('spices board'))).toBe(false);
      expect(titles.some((t) => t.includes('phytosanitary'))).toBe(false);
      expect(titles.some((t) => t.includes('bis steel'))).toBe(false);
    });

    test('4. Engineering Exporter receives EEPC, Mill Test & PPAP, never FSSAI or Textiles', () => {
      const engRules = getApplicableRequirementsForCorridor(
        'Engineering Goods',
        'CNC Machined Auto Parts',
        '8409.91.00',
        'US'
      );
      const titles = engRules.map((r) => r.title.toLowerCase());

      // Must include Engineering quality gates
      expect(titles.some((t) => t.includes('eepc'))).toBe(true);
      expect(titles.some((t) => t.includes('mill test'))).toBe(true);
      expect(titles.some((t) => t.includes('ppap'))).toBe(true);

      // Must NEVER show food or textile rules
      expect(titles.some((t) => t.includes('fssai'))).toBe(false);
      expect(titles.some((t) => t.includes('oeko-tex'))).toBe(false);
      expect(titles.some((t) => t.includes('apeda'))).toBe(false);
      expect(titles.some((t) => t.includes('fda prior notice'))).toBe(false);
    });

    test('5. Chemicals Exporter receives Chemexcil, WHO-GMP, SDS & DG Declaration', () => {
      const chemRules = getApplicableRequirementsForCorridor(
        'Chemicals & Allied',
        'Specialty Active Pharma Ingredients',
        '2922.49.00',
        'GB'
      );
      const titles = chemRules.map((r) => r.title.toLowerCase());

      expect(titles.some((t) => t.includes('chemexcil') || t.includes('pharmexcil'))).toBe(true);
      expect(titles.some((t) => t.includes('certificate of analysis'))).toBe(true);
      expect(titles.some((t) => t.includes('safety data sheet'))).toBe(true);
      expect(titles.some((t) => t.includes('dangerous goods'))).toBe(true);

      // Must NEVER show steel or textiles
      expect(titles.some((t) => t.includes('bis quality certification'))).toBe(false);
      expect(titles.some((t) => t.includes('oeko-tex'))).toBe(false);
    });

    test('6. Ceramics Exporter receives CAPEXIL & ISO 10545 tile test, never FSSAI', () => {
      const ceramicRules = getApplicableRequirementsForCorridor(
        'Ceramics & Tiles',
        'Vitrified Porcelain Floor Tiles',
        '6907.21.00',
        'AE'
      );
      const titles = ceramicRules.map((r) => r.title.toLowerCase());

      expect(titles.some((t) => t.includes('capexil'))).toBe(true);
      expect(titles.some((t) => t.includes('10545'))).toBe(true);

      expect(titles.some((t) => t.includes('fssai'))).toBe(false);
      expect(titles.some((t) => t.includes('spices board'))).toBe(false);
    });

    test('7. Gems & Jewellery Exporter receives GJEPC, Hallmark/Assay or KPCS, never Food', () => {
      const diamondRules = getApplicableRequirementsForCorridor(
        'Gems & Jewellery',
        'Polished Natural Diamonds',
        '7102.39.00',
        'AE'
      );
      const dTitles = diamondRules.map((r) => r.title.toLowerCase());

      expect(dTitles.some((t) => t.includes('gjepc'))).toBe(true);
      expect(dTitles.some((t) => t.includes('kimberley'))).toBe(true);
      expect(dTitles.some((t) => t.includes('customs valuation'))).toBe(true);

      const goldRules = getApplicableRequirementsForCorridor(
        'Gems & Jewellery',
        '22K Gold Handcrafted Jewellery',
        '7113.19.10',
        'AE'
      );
      const gTitles = goldRules.map((r) => r.title.toLowerCase());

      expect(gTitles.some((t) => t.includes('gjepc'))).toBe(true);
      expect(gTitles.some((t) => t.includes('hallmark'))).toBe(true);
      expect(gTitles.some((t) => t.includes('fssai'))).toBe(false);
    });
  });

  describe('Pillar 2: Bilateral Trade Corridors & Preferential Tariff Arbitrage', () => {
    test('India -> UAE (CEPA): 0% preferential duty with 5% MFN delta', () => {
      const tariff = getTariffIntelligence('2008.99.11', 'Mango Pulp', 'AE', 'United Arab Emirates');
      expect(tariff.corridorName).toContain('India-UAE CEPA');
      expect(tariff.tradeAgreement).toContain('CEPA');
      expect(tariff.preferentialTariff).toContain('0.0%');
      expect(tariff.dutySavings).toContain('Save 5.0%');
    });

    test('India -> Australia (ECTA): 0% preferential tariff under Ind-Aus agreement', () => {
      const tariff = getTariffIntelligence('6109.10.00', 'Cotton Garments', 'AU', 'Australia');
      expect(tariff.tradeAgreement).toContain('ECTA');
      expect(tariff.preferentialTariff).toContain('0.0%');
      expect(tariff.dutySavings).toContain('Save 5.0%');
    });

    test('India -> Vietnam (AIFTA): Form AI preferential tariff vs MFN baseline', () => {
      const tariff = getTariffIntelligence('0904.11.20', 'Black Pepper', 'VN', 'Vietnam');
      expect(tariff.tradeAgreement).toContain('AIFTA');
      expect(tariff.preferentialTariff).toContain('0.0% – 3.0%');
      expect(tariff.dutySavings).toContain('Form AI');
    });

    test('India -> Japan (CEPA): Preferential IJCEPA duty reduction', () => {
      const tariff = getTariffIntelligence('8409.91.00', 'Auto Parts', 'JP', 'Japan');
      expect(tariff.tradeAgreement).toContain('India-Japan CEPA');
      expect(tariff.preferentialTariff).toContain('Preferential CEPA Duty');
    });

    test('India -> European Union (NL, DE): REX self-certification & TARIC schedule', () => {
      const tariff = getTariffIntelligence('6907.21.00', 'Ceramic Tiles', 'NL', 'Netherlands');
      expect(tariff.corridorName).toContain('Netherlands');
      expect(tariff.tradeAgreement).toContain('REX');
    });
  });

  describe('Pillar 3: Sector-Specific Packaging & Labelling Configurations', () => {
    test('All 7 key export manufacturing sectors have tailored packaging configurations', () => {
      const sectorsToCheck = [
        'Food',
        'Agricultural Goods',
        'Spices',
        'Textiles',
        'Engineering',
        'Chemicals',
        'Ceramics',
        'Gems & Jewellery',
      ] as const;

      for (const sector of sectorsToCheck) {
        const config = BUSINESS_TYPE_CONFIGS[sector];
        expect(config).toBeDefined();
        expect(config.packagingItems.length).toBeGreaterThanOrEqual(3);
        expect(config.requirements.length).toBeGreaterThanOrEqual(4);
        expect(config.defaultProduct.hsCode).toBeDefined();
      }
    });

    test('Engineering includes anti-rust VCI film and heavy-duty ISPM-15 crates', () => {
      const engPkg = BUSINESS_TYPE_CONFIGS['Engineering'].packagingItems;
      const titles = engPkg.map((p) => p.title.toLowerCase());
      expect(titles.some((t) => t.includes('vci') || t.includes('anti-rust'))).toBe(true);
      expect(titles.some((t) => t.includes('ispm-15'))).toBe(true);
    });

    test('Chemicals includes UN-certified packaging and GHS diamond hazard labels', () => {
      const chemPkg = BUSINESS_TYPE_CONFIGS['Chemicals'].packagingItems;
      const titles = chemPkg.map((p) => p.title.toLowerCase());
      expect(titles.some((t) => t.includes('un-certified'))).toBe(true);
      expect(titles.some((t) => t.includes('ghs'))).toBe(true);
    });

    test('Spices includes moisture-barrier poly liner and AGMARK lot stenciling', () => {
      const spicePkg = BUSINESS_TYPE_CONFIGS['Spices'].packagingItems;
      const titles = spicePkg.map((p) => p.title.toLowerCase());
      expect(titles.some((t) => t.includes('moisture-barrier') || t.includes('polypropylene'))).toBe(true);
      expect(titles.some((t) => t.includes('agmark'))).toBe(true);
    });
  });
});

