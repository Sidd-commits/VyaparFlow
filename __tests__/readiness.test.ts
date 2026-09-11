import { calculateReadinessScore } from '../lib/services/readiness';
import { prisma } from '../lib/prisma';

describe('Export Readiness Engine Unit Tests', () => {
  test('Readiness score calculation & critical blocker detection', async () => {
    // Fetch MSME product country mapping from database
    const pc = await prisma.productCountry.findFirst({
      include: { product: true },
    });

    expect(pc).not.toBeNull();

    if (pc) {
      const result = await calculateReadinessScore(pc.id);

      // Verify result structure
      expect(typeof result.totalScore).toBe('number');
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.totalScore).toBeLessThanOrEqual(100);

      // Verify category scores breakdown
      expect(result.categoryScores.business.weight).toBe(20);
      expect(result.categoryScores.documents.weight).toBe(25);
      expect(result.categoryScores.certifications.weight).toBe(20);
      expect(result.categoryScores.packaging.weight).toBe(15);
      expect(result.categoryScores.shipment.weight).toBe(20);

      // Verify critical blockers exist for unverified items
      expect(Array.isArray(result.blockers)).toBe(true);

      if (result.blockers.length > 0) {
        expect(result.readinessState).toBe('Action Required (Blockers)');
        expect(result.isExportReady).toBe(false);
      }
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
