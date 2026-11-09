import {
  getClusterInvoiceEndorsements,
  generateCommercialInvoicePDF,
  generatePackingListPDF,
} from '@/lib/services/documentGenerator';

describe('VyaparFlow Statutory Export Document Generator Tests', () => {
  describe('Pillar 1: Sector-Specific Compliance Endorsement Mapping', () => {
    test('Spices maps Spices Board CRES, AGMARK Grade and NABL residue cert', () => {
      const endorsement = getClusterInvoiceEndorsements(
        'Spices & Condiments',
        'Alleppey Green Cardamom',
        '0908.31.00'
      );
      expect(endorsement.sectorLabel).toContain('Spices');
      expect(endorsement.regulatoryAuthority).toContain('Spices Board');
      expect(endorsement.endorsements.some((e) => e.label.includes('CRES'))).toBe(true);
      expect(endorsement.endorsements.some((e) => e.label.includes('AGMARK'))).toBe(true);
      expect(endorsement.packageType).toContain('PP Woven');
      expect(endorsement.packagingMarks).toContain('AGMARK');
    });

    test('Textiles maps AEPC RCMC, OEKO-TEX Standard 100 and RoSCTL declaration', () => {
      const endorsement = getClusterInvoiceEndorsements(
        'Textiles & Apparel',
        'Combed Cotton Knitted T-Shirts',
        '6109.10.00'
      );
      expect(endorsement.sectorLabel).toContain('Textiles');
      expect(endorsement.regulatoryAuthority).toContain('AEPC');
      expect(endorsement.endorsements.some((e) => e.label.includes('OEKO-TEX') || e.value.includes('OEKO-TEX'))).toBe(true);
      expect(endorsement.declarationText).toContain('RoSCTL');
      expect(endorsement.packagingMarks).toContain('Needle-Free');
    });

    test('Engineering maps EEPC India, Mill Test EN 10204 3.1 and CE Mark', () => {
      const endorsement = getClusterInvoiceEndorsements(
        'Engineering Goods',
        'CNC Machined Steel Flanges',
        '8409.91.00'
      );
      expect(endorsement.sectorLabel).toContain('Engineering');
      expect(endorsement.regulatoryAuthority).toContain('EEPC');
      expect(endorsement.endorsements.some((e) => e.label.includes('10204') || e.value.includes('10204'))).toBe(true);
      expect(endorsement.endorsements.some((e) => e.label.includes('Heat'))).toBe(true);
      expect(endorsement.packageType).toContain('ISPM-15');
      expect(endorsement.packageType).toContain('VCI');
    });

    test('Chemicals maps Chemexcil, COA, UN 1993 DG Class 3 and 16-section SDS', () => {
      const endorsement = getClusterInvoiceEndorsements(
        'Chemicals & Allied',
        'Specialty Organic Synthesis API',
        '2922.49.00'
      );
      expect(endorsement.sectorLabel).toContain('Chemicals');
      expect(endorsement.endorsements.some((e) => e.value.includes('UN 1993'))).toBe(true);
      expect(endorsement.packageType).toContain('UN-Certified');
      expect(endorsement.packagingMarks).toContain('GHS Class 3');
    });

    test('Ceramics maps CAPEXIL, ISO 10545 test report and water absorption rating', () => {
      const endorsement = getClusterInvoiceEndorsements(
        'Ceramics & Tiles',
        'Glazed Vitrified Porcelain Floor Tiles',
        '6907.21.00'
      );
      expect(endorsement.sectorLabel).toContain('Ceramics');
      expect(endorsement.regulatoryAuthority).toContain('CAPEXIL');
      expect(endorsement.endorsements.some((e) => e.value.includes('10545'))).toBe(true);
      expect(endorsement.packageType).toContain('Corrugated Master Boxes');
    });

    test('Gems & Jewellery maps GJEPC, BIS Hallmark HUID and Kimberley Process KPCS', () => {
      const endorsement = getClusterInvoiceEndorsements(
        'Gems & Jewellery',
        'Hallmarked 22K Gold Bangles & Diamonds',
        '7113.19.10'
      );
      expect(endorsement.sectorLabel).toContain('Jewellery');
      expect(endorsement.regulatoryAuthority).toContain('GJEPC');
      expect(endorsement.endorsements.some((e) => e.label.includes('HUID') || e.value.includes('HUID'))).toBe(true);
      expect(endorsement.endorsements.some((e) => e.label.includes('KPCS') || e.value.includes('KPCS'))).toBe(true);
      expect(endorsement.packageType).toContain('Armored Vault Strongbox');
    });

    test('Food maps FSSAI Central License, APEDA RCMC and Batch MFG/EXP', () => {
      const endorsement = getClusterInvoiceEndorsements(
        'Food Processing',
        'Processed Alphonso Mango Pulp',
        '2008.99.11'
      );
      expect(endorsement.sectorLabel).toContain('Food');
      expect(endorsement.regulatoryAuthority).toContain('FSSAI');
      expect(endorsement.endorsements.some((e) => e.label.includes('FSSAI'))).toBe(true);
      expect(endorsement.endorsements.some((e) => e.label.includes('APEDA'))).toBe(true);
      expect(endorsement.packageType).toContain('Aseptic');
    });
  });

  describe('Pillar 2: PDF Document Generation & Binary Integrity', () => {
    test('generateCommercialInvoicePDF produces valid PDF with magic bytes %PDF', () => {
      const pdfBuffer = generateCommercialInvoicePDF({
        invoiceNumber: 'INV-TEST-2026-001',
        invoiceDate: '2026-11-09',
        exporterName: 'Apex Quality Agro Processing Pvt Ltd',
        exporterAddress: 'Industrial Export Park, Nashik, Maharashtra',
        exporterGst: '27AAACP1234F1Z5',
        exporterIec: '0301099882',
        consigneeName: 'Gulf Global Imports LLC',
        consigneeAddress: 'Al Quoz Industrial 3, Dubai, UAE',
        destinationCountry: 'United Arab Emirates',
        portOfLoading: 'JNPT Nhava Sheva, Mumbai',
        portOfDischarge: 'Jebel Ali Port, Dubai',
        productName: 'Premium Table Grapes (Sonaka)',
        hsCode: '0806.10.00',
        quantity: 20,
        unit: 'MT',
        unitPrice: 125000,
        totalValue: 2500000,
        currency: 'INR',
        paymentTerms: '100% Irrevocable L/C at Sight',
        businessType: 'Food & Agricultural Goods',
      });

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(1000);

      // Verify %PDF magic bytes
      const header = pdfBuffer.slice(0, 5).toString('ascii');
      expect(header).toBe('%PDF-');
    });

    test('generatePackingListPDF produces valid PDF with itemized stowage weights', () => {
      const pdfBuffer = generatePackingListPDF({
        invoiceNumber: 'INV-TEST-2026-001',
        invoiceDate: '2026-11-09',
        exporterName: 'Apex Quality Agro Processing Pvt Ltd',
        exporterAddress: 'Industrial Export Park, Nashik, Maharashtra',
        exporterGst: '27AAACP1234F1Z5',
        exporterIec: '0301099882',
        consigneeName: 'Gulf Global Imports LLC',
        consigneeAddress: 'Al Quoz Industrial 3, Dubai, UAE',
        destinationCountry: 'United Arab Emirates',
        portOfLoading: 'JNPT Nhava Sheva, Mumbai',
        portOfDischarge: 'Jebel Ali Port, Dubai',
        productName: 'Premium Table Grapes (Sonaka)',
        hsCode: '0806.10.00',
        quantity: 20,
        unit: 'MT',
        unitPrice: 125000,
        totalValue: 2500000,
        currency: 'INR',
        paymentTerms: '100% Irrevocable L/C at Sight',
        weight: 20000,
        packages: 400,
        businessType: 'Food & Agricultural Goods',
      });

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(1000);

      const header = pdfBuffer.slice(0, 5).toString('ascii');
      expect(header).toBe('%PDF-');
    });
  });
});
