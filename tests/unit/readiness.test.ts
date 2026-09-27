import { calculateReadinessFromData, calculateReadinessScore } from '@/lib/services/readiness';

describe('Readiness Scoring Engine Unit Tests', () => {
  it('throws error when database record does not exist', async () => {
    await expect(calculateReadinessScore('non-existent-id')).rejects.toThrow('Product country mapping not found');
  });

  it('computes 0% score when nothing is verified or registered', () => {
    const data = {
      id: 'pc-1',
      product: {
        name: 'Organic Spices',
        business: {
          gstStatus: 'Not Registered',
          iecStatus: 'Not Registered',
        },
      },
      country: { id: 'c-1', name: 'Germany', isoCode: 'DE' },
      requirements: [
        { id: 'req-1', type: 'document', priority: 'critical', status: 'missing', weight: 10, title: 'Commercial Invoice' },
        { id: 'req-2', type: 'certification', priority: 'high', status: 'missing', weight: 20, title: 'Organic Certificate' },
        { id: 'req-3', type: 'shipment', priority: 'medium', status: 'missing', weight: 10, title: 'Freight Booking' },
      ],
      packagingItems: [
        { id: 'pack-1', title: 'Tamper-proof tape', type: 'packaging', priority: 'high', mandatory: true, status: 'incomplete' },
      ],
    };

    const result = calculateReadinessFromData(data as any);
    expect(result.totalScore).toBe(0);
    expect(result.readinessState).toBe('Action Required (Blockers)');
    expect(result.isExportReady).toBe(false);
    expect(result.greenChannelActive).toBe(false);
    expect(result.blockers.length).toBeGreaterThan(0);
  });

  it('awards 0 document points for under_review submissions until verified (Uploaded != Approved)', () => {
    const data = {
      id: 'pc-1',
      product: {
        name: 'Organic Spices',
        business: {
          gstStatus: 'Active (27AAAAA0000A1Z5)',
          iecStatus: 'Active (0301099882)',
        },
      },
      country: { id: 'c-1', name: 'Germany', isoCode: 'DE' },
      requirements: [
        { id: 'req-1', type: 'document', priority: 'critical', status: 'under_review', weight: 20, title: 'Certificate of Origin' },
        { id: 'req-2', type: 'certification', priority: 'high', status: 'verified', weight: 20, title: 'FSSAI Export NOC' },
      ],
      packagingItems: [],
    };

    const result = calculateReadinessFromData(data as any);
    // Business: 100% (20 pts), Docs: 0% (0 pts), Certs: 100% (20 pts), Packaging: 100% (15 pts), Shipment: 100% (20 pts)
    // Total = 20 + 0 + 20 + 15 + 20 = 75
    expect(result.categoryScores.documents.score).toBe(0);
    expect(result.categoryScores.certifications.score).toBe(100);
    expect(result.categoryScores.business.score).toBe(100);
    expect(result.totalScore).toBe(75);
    // Because req-1 is under_review and critical, it still counts as a blocker until approved
    expect(result.readinessState).toBe('Action Required (Blockers)');
    expect(result.isExportReady).toBe(false);
  });

  it('weights requirements proportionately according to weight field', () => {
    const data = {
      id: 'pc-1',
      product: {
        name: 'Steel Bars',
        business: {
          gstStatus: 'Active',
          iecStatus: 'Active',
        },
      },
      country: { id: 'c-1', name: 'United States', isoCode: 'US' },
      requirements: [
        { id: 'req-heavy', type: 'document', priority: 'critical', status: 'verified', weight: 80, title: 'Bill of Lading' },
        { id: 'req-light', type: 'document', priority: 'low', status: 'missing', weight: 20, title: 'Container Photo' },
      ],
      packagingItems: [],
    };

    const result = calculateReadinessFromData(data as any);
    // Heavy requirement verified: 80 out of 100 weight = 80% doc score
    expect(result.categoryScores.documents.score).toBe(80);
    expect(result.categoryScores.documents.earnedPoints).toBe(80);
    expect(result.categoryScores.documents.totalPoints).toBe(100);
  });

  it('correctly flags rejected documents as top-urgency blockers with re-upload guidance', () => {
    const data = {
      id: 'pc-1',
      product: {
        name: 'Textiles',
        business: {
          gstStatus: 'Active',
          iecStatus: 'Active',
        },
      },
      country: { id: 'c-1', name: 'United Kingdom', isoCode: 'GB' },
      requirements: [
        {
          id: 'req-rej',
          type: 'document',
          priority: 'critical',
          status: 'rejected',
          weight: 20,
          title: 'Commercial Invoice',
          reason: 'Missing HS 8-digit subheading breakdown and currency declaration',
        },
      ],
      packagingItems: [],
    };

    const result = calculateReadinessFromData(data as any);
    const rejectedBlocker = result.blockers.find((b) => b.isRejected);
    expect(rejectedBlocker).toBeDefined();
    expect(rejectedBlocker?.reason).toContain('Missing HS 8-digit');
    expect(result.nextActions[0].actionText).toContain('Replace Rejected Doc');
  });

  it('grants 100% Export Ready & Green Channel status when all mandatory criteria are verified', () => {
    const data = {
      id: 'pc-1',
      product: {
        name: 'Processed Alphonso Mango Pulp',
        business: {
          gstStatus: 'Active (27AAAAA0000A1Z5)',
          iecStatus: 'Active (0301099882)',
        },
      },
      country: { id: 'c-1', name: 'Netherlands', isoCode: 'NL' },
      requirements: [
        { id: 'req-1', type: 'document', priority: 'critical', status: 'verified', weight: 15, title: 'Certificate of Origin (REX)' },
        { id: 'req-2', type: 'document', priority: 'critical', status: 'verified', weight: 15, title: 'Commercial Invoice' },
        { id: 'req-3', type: 'certification', priority: 'critical', status: 'verified', weight: 20, title: 'Phytosanitary Certificate' },
        { id: 'req-4', type: 'shipment', priority: 'high', status: 'verified', weight: 15, title: 'Freight Cargo Booking' },
      ],
      packagingItems: [
        { id: 'pack-1', title: 'EU Bilingual Food Labels', type: 'labelling', mandatory: true, status: 'completed' },
        { id: 'pack-2', title: 'ISPM-15 Heat-Treated Pallets', type: 'packaging', mandatory: true, status: 'completed' },
      ],
    };

    const result = calculateReadinessFromData(data as any);
    expect(result.totalScore).toBe(100);
    expect(result.readinessState).toBe('Export Ready');
    expect(result.isExportReady).toBe(true);
    expect(result.greenChannelActive).toBe(true);
    expect(result.blockers.length).toBe(0);
  });
});
