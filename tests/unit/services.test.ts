import { getApplicableRequirementsForCorridor, getTariffIntelligence } from '@/lib/services/applicability';
import { validateGSTIN, validateIEC } from '@/lib/businessTypeConfig';

describe('Export Intelligence & Applicability Service Tests', () => {
  it('validates GSTIN formats correctly', () => {
    expect(validateGSTIN('27AAAAA0000A1Z5').valid).toBe(true);
    expect(validateGSTIN('INVALID_GST').valid).toBe(false);
  });

  it('validates DGFT IEC codes properly', () => {
    expect(validateIEC('0301099882').valid).toBe(true);
    expect(validateIEC('123').valid).toBe(false);
  });

  it('provides corridor-specific requirements for Netherlands (NL)', () => {
    const rules = getApplicableRequirementsForCorridor(
      'Food & Agri',
      'Processed Food Products',
      '2008.99.11',
      'NL'
    );
    expect(rules.length).toBeGreaterThan(0);
    const cooRule = rules.find((r) => r.title.includes('EU Registered Exporter System'));
    expect(cooRule).toBeDefined();
  });

  it('provides corridor-specific requirements for Japan (JP)', () => {
    const rules = getApplicableRequirementsForCorridor(
      'Food & Agri',
      'Processed Food Products',
      '2008.99.11',
      'JP'
    );
    const cooRule = rules.find((r) => r.title.includes('India-Japan CEPA'));
    expect(cooRule).toBeDefined();
  });

  it('returns valid tariff intelligence for Netherlands (NL)', () => {
    const tariff = getTariffIntelligence(
      '2008.99.11',
      'Processed Mango Pulp',
      'NL',
      'Netherlands'
    );
    expect(tariff.corridorName).toContain('Netherlands');
    expect(tariff.tradeAgreement).toContain('EU');
  });

  it('returns valid tariff intelligence for Japan (JP)', () => {
    const tariff = getTariffIntelligence(
      '2008.99.11',
      'Processed Mango Pulp',
      'JP',
      'Japan'
    );
    expect(tariff.corridorName).toContain('Japan');
    expect(tariff.tradeAgreement).toContain('India-Japan CEPA');
  });
});
