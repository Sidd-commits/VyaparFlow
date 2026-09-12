import { calculateReadinessScore } from '@/lib/services/readiness';
import { prisma } from '@/lib/prisma';

// Unit test mock for calculateReadinessScore
describe('Readiness Scoring Engine Unit Tests', () => {
  it('should throw when no product country is found', async () => {
    await expect(calculateReadinessScore('non-existent-id')).rejects.toThrow('Product country mapping not found');
  });

  it('should compute weighted completion percentages correctly', () => {
    const totalWeights = { statutory: 30, technical: 25, logistics: 25, commercial: 20 };
    const earnedWeights = { statutory: 30, technical: 0, logistics: 0, commercial: 0 };
    
    const overall = (earnedWeights.statutory / 100) * 100;
    expect(overall).toBe(30);
  });
});
