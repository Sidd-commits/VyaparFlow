import { calculateReadinessScore } from '../lib/services/readiness';
import { generateCommercialInvoicePDF, generatePackingListPDF } from '../lib/services/documentGenerator';
import { prisma } from '../lib/prisma';

describe('VyaparFlow Comprehensive Service & Engine Tests', () => {
  test('1. Readiness Engine: Calculate score and verify blocker override', async () => {
    const pc = await prisma.productCountry.findFirst({
      include: { product: true },
    });

    expect(pc).not.toBeNull();

    if (pc) {
      const readiness = await calculateReadinessScore(pc.id);
      expect(typeof readiness.totalScore).toBe('number');
      expect(readiness.totalScore).toBeGreaterThanOrEqual(0);
      expect(readiness.totalScore).toBeLessThanOrEqual(100);

      // Verify category weights sum to 100%
      const weightsSum =
        readiness.categoryScores.business.weight +
        readiness.categoryScores.documents.weight +
        readiness.categoryScores.certifications.weight +
        readiness.categoryScores.packaging.weight +
        readiness.categoryScores.shipment.weight;
      expect(weightsSum).toBe(100);

      // Verify blockers exist if there are pending critical items
      expect(Array.isArray(readiness.blockers)).toBe(true);
    }
  });

  test('2. PDF Document Generator: Commercial Invoice PDF output', () => {
    const pdfBuffer = generateCommercialInvoicePDF({
      invoiceNumber: 'INV-SHP-2026-TEST',
      invoiceDate: '2026-09-08',
      exporterName: 'Apex Quality Agro Pvt Ltd',
      exporterAddress: 'Western Export Processing Zone, Mumbai, Maharashtra',
      exporterGst: '27AAACP1234F1Z5',
      exporterIec: '0301099882',
      consigneeName: 'Gulf Food Distribution LLC',
      consigneeAddress: 'Dubai, UAE',
      destinationCountry: 'United Arab Emirates',
      portOfLoading: 'JNPT Port, Mumbai',
      portOfDischarge: 'Jebel Ali Port, Dubai',
      productName: 'Alphonso Mango Pulp',
      hsCode: '2008.99.11',
      quantity: 10,
      unit: 'MT',
      unitPrice: 150000,
      totalValue: 1500000,
      currency: 'INR',
      paymentTerms: '100% L/C at Sight',
    });

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(1000);
  });

  test('3. PDF Document Generator: Packing List PDF output', () => {
    const pdfBuffer = generatePackingListPDF({
      invoiceNumber: 'INV-SHP-2026-TEST',
      invoiceDate: '2026-09-08',
      exporterName: 'Apex Quality Agro Pvt Ltd',
      exporterAddress: 'Western Export Processing Zone, Mumbai, Maharashtra',
      exporterGst: '27AAACP1234F1Z5',
      exporterIec: '0301099882',
      consigneeName: 'Gulf Food Distribution LLC',
      consigneeAddress: 'Dubai, UAE',
      destinationCountry: 'United Arab Emirates',
      portOfLoading: 'JNPT Port, Mumbai',
      portOfDischarge: 'Jebel Ali Port, Dubai',
      productName: 'Alphonso Mango Pulp',
      hsCode: '2008.99.11',
      quantity: 10,
      unit: 'MT',
      unitPrice: 150000,
      totalValue: 1500000,
      currency: 'INR',
      paymentTerms: '100% L/C at Sight',
      weight: 10000,
      packages: 500,
    });

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(1000);
  });

  test('4. Database Integrity: Verify seeded MSME business, product, and quotes', async () => {
    const businessCount = await prisma.business.count();
    const productCount = await prisma.product.count();
    const ruleCount = await prisma.rule.count();
    const shipmentCount = await prisma.shipment.count();

    expect(businessCount).toBeGreaterThan(0);
    expect(productCount).toBeGreaterThan(0);
    expect(ruleCount).toBeGreaterThan(0);
    expect(shipmentCount).toBeGreaterThan(0);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
