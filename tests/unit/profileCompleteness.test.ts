import { calculateProfileCompletenessFromData } from '@/lib/services/profileCompleteness';

describe('Profile Completeness Scoring Algorithm Unit Tests', () => {
  it('calculates 0% for completely empty business profile', () => {
    const result = calculateProfileCompletenessFromData({});
    expect(result.totalScore).toBe(0);
    expect(result.tier).toBe('Incomplete');
    expect(result.isComplete).toBe(false);
    expect(result.missingFields.length).toBeGreaterThan(0);
    expect(result.nextRecommendedAction).toBeDefined();
  });

  it('calculates partial score for basic name and city', () => {
    const result = calculateProfileCompletenessFromData({
      legalName: 'Apex Exporters Pvt Ltd',
      displayName: 'Apex Global',
      city: 'Mumbai',
      state: 'Maharashtra',
    });

    // Legal Name (10) + Display Name (5) + City/State (10) = 25 pts
    expect(result.totalScore).toBe(25);
    expect(result.categoryScores.identity.score).toBe(15);
    expect(result.categoryScores.address.score).toBe(10);
    expect(result.tier).toBe('Incomplete');
  });

  it('calculates 60%+ score when address and active GSTIN/IEC are added', () => {
    const result = calculateProfileCompletenessFromData({
      legalName: 'Apex Exporters Pvt Ltd',
      displayName: 'Apex Global',
      businessType: 'Food & Agri (Processed Foods)',
      location: 'MIDC Industrial Area, Phase II',
      city: 'Mumbai',
      state: 'Maharashtra',
      gstStatus: 'Active (27AAAAA0000A1Z5)',
      iecStatus: 'Active (0301099882)',
    });

    // Identity (20) + Address (20) + Tax Status (20) = 60 pts
    expect(result.totalScore).toBe(60);
    expect(result.categoryScores.identity.score).toBe(20);
    expect(result.categoryScores.address.score).toBe(20);
    expect(result.categoryScores.taxRegistration.score).toBe(20);
    expect(result.tier).toBe('Basic Profile');
  });

  it('calculates 100% Fully Certified Exporter when all credentials, catalog, corridor and docs are verified', () => {
    const result = calculateProfileCompletenessFromData({
      legalName: 'Apex Exporters Pvt Ltd',
      displayName: 'Apex Global',
      businessType: 'Food & Agri (Processed Foods)',
      location: 'MIDC Industrial Area, Phase II, Plot 42',
      city: 'Mumbai',
      state: 'Maharashtra',
      gstStatus: 'Active (27AAAAA0000A1Z5)',
      iecStatus: 'Active (0301099882)',
      documents: [
        { id: 'doc-1', type: 'GST_CERTIFICATE', status: 'verified' },
        { id: 'doc-2', type: 'IEC_CERTIFICATE', status: 'verified' },
      ],
      products: [
        {
          id: 'prod-1',
          name: 'Alphonso Mango Pulp',
          hsCode: '2008.99.11',
          destinations: [
            {
              id: 'pc-1',
              country: { id: 'c-1', name: 'Netherlands', isoCode: 'NL' },
              requirements: [{ id: 'req-1', status: 'verified' }],
            },
          ],
        },
      ],
    });

    expect(result.totalScore).toBe(100);
    expect(result.tier).toBe('Fully Certified Exporter');
    expect(result.isComplete).toBe(true);
    expect(result.missingFields.length).toBe(0);
    expect(result.checklist.every((item) => item.status === 'completed')).toBe(true);
  });
});
