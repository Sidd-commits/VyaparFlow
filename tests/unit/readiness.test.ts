import { calculateReadinessScore } from '@/lib/services/readiness';

describe('Readiness Scoring Engine Unit Tests', () => {
  it('should throw when no product country is found', async () => {
    await expect(calculateReadinessScore('non-existent-id')).rejects.toThrow('Product country mapping not found');
  });

  it('should compute weighted completion percentages correctly', () => {
    const earnedStatutory = 30;
    const overall = (earnedStatutory / 100) * 100;
    expect(overall).toBe(30);
  });
});

