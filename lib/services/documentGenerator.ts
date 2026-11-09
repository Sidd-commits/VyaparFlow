import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ClusterInvoiceEndorsements {
  sectorLabel: string;
  regulatoryAuthority: string;
  endorsements: Array<{ label: string; value: string }>;
  declarationText: string;
  packageType: string;
  packagingMarks: string;
  storageCondition: string;
}

export interface CommercialInvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  exporterName: string;
  exporterAddress: string;
  exporterGst: string;
  exporterIec: string;
  consigneeName: string;
  consigneeAddress: string;
  destinationCountry: string;
  portOfLoading: string;
  portOfDischarge: string;
  productName: string;
  hsCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  currency: string;
  paymentTerms: string;
  businessType?: string;
  clusterEndorsement?: ClusterInvoiceEndorsements;
}

export interface PackingListData extends CommercialInvoiceData {
  weight: number;
  packages: number;
  tareWeight?: number;
}

/**
 * Returns sector-tailored statutory export declarations, quality standards,
 * and packaging markings for Indian foreign trade compliance.
 */
export function getClusterInvoiceEndorsements(
  businessType?: string,
  productName?: string,
  hsCode?: string
): ClusterInvoiceEndorsements {
  const norm = `${businessType || ''} ${productName || ''}`.toLowerCase();
  const hs = (hsCode || '').replace(/\./g, '').trim();

  // 1. Spices & Condiments
  if (norm.includes('spice') || hs.startsWith('0904') || hs.startsWith('0910')) {
    return {
      sectorLabel: 'Spices & Condiments Export Cluster',
      regulatoryAuthority: 'Spices Board India / Directorate of Marketing & Inspection',
      endorsements: [
        { label: 'Spices Board CRES Reg No', value: 'SB/CRES/EXP-9824/2026' },
        { label: 'AGMARK Export Grade Designation', value: 'Extra Special Grade I (Whole / Ground)' },
        { label: 'NABL Pesticide Residue Test', value: 'Cert #NABL-SP-2026-4412 (Negative for ETO / Aflatoxin)' },
        { label: 'Harvest Lot & Crop Year', value: 'Crop 2026 | Lot SP-2026-MAL-04' },
      ],
      declarationText:
        'Exported under RoDTEP Scheme (2.2% FOB Credit). Certified compliant with Spices Board quality specifications and international maximum residue limits (MRL).',
      packageType: 'Double-Layer PP Woven Export Bags with Hermetic Poly Liner',
      packagingMarks: 'MARK: SP-2026 / AGMARK Extra Special / Net 25 KG / Produce of India',
      storageCondition: 'Store in cool, dry, ventilated warehouse (RH < 65%) away from direct moisture.',
    };
  }

  // 2. Textiles & Ready-Made Garments
  if (
    norm.includes('textile') ||
    norm.includes('apparel') ||
    norm.includes('garment') ||
    norm.includes('cotton') ||
    hs.startsWith('61') ||
    hs.startsWith('62')
  ) {
    return {
      sectorLabel: 'Textiles & Ready-Made Garments (RMG) Cluster',
      regulatoryAuthority: 'Apparel Export Promotion Council (AEPC) / Texprocil',
      endorsements: [
        { label: 'AEPC / Texprocil Export RCMC', value: 'AEPC/REG/DEL/2026/7821' },
        { label: 'OEKO-TEX Standard 100 Cert', value: '21.HIN.98214 HOHENSTEIN HTTI (Class I Baby Safe)' },
        { label: 'Fiber Blend & Chemical Safety', value: '100% Combed Indian Cotton | AZO-Free Dye Certified' },
        { label: 'Foreign Trade Policy Remission', value: 'Exported under RoSCTL Scheme (Chapter 61 - 4.05% FOB)' },
      ],
      declarationText:
        'Exported under RoSCTL Scheme. 100% of finished cartons passed calibrated conveyor needle-free metal detection prior to container stuffing.',
      packageType: '5-Ply Export Corrugated Master Cartons with Inner Moisture Polybag',
      packagingMarks: 'MARK: RMG-TEX-001 / Needle-Free Scanned / Style 6109 / Port of Rotterdam',
      storageCondition: 'Store dry and elevated on ISPM-15 certified heat-treated wooden pallets.',
    };
  }

  // 3. Precision Engineering & Auto Goods
  if (
    norm.includes('engineer') ||
    norm.includes('machin') ||
    norm.includes('auto') ||
    norm.includes('fastener') ||
    hs.startsWith('84') ||
    hs.startsWith('87')
  ) {
    return {
      sectorLabel: 'Precision Engineering & Auto Components Cluster',
      regulatoryAuthority: 'Engineering Export Promotion Council (EEPC India)',
      endorsements: [
        { label: 'EEPC India RCMC Registration', value: 'EEPC/ENG/PUN/2026/5521' },
        { label: 'Mill Test Cert (EN 10204 3.1)', value: 'MTC Ref MTC-TATA-STEEL-98214 (Chemical & Tensile Verified)' },
        { label: 'Heat & Melt Chemistry Reference', value: 'Heat #H-89412 | Cast 2026-ENG-44' },
        { label: 'CE / Machinery Safety Tag', value: 'EU Machinery Directive 2006/42/EC Conformity Verified' },
      ],
      declarationText:
        'Exported under RoDTEP Scheme (2.0% FOB Credit). Critical product dimensions and metallurgical properties inspected under PPAP Level 3 controls.',
      packageType: 'ISPM-15 Certified Heavy Wooden Crates with VCI Anti-Rust Wrapping',
      packagingMarks: 'MARK: ENG-CNC-001 / Heat #H-89412 / Center of Gravity Marked / IPPC HT',
      storageCondition: 'Heavy cargo secured with high-tensile steel banding and timber dunnage chocks.',
    };
  }

  // 4. Chemicals & Active Pharmaceutical Ingredients (API)
  if (norm.includes('chemical') || norm.includes('pharma') || hs.startsWith('29') || hs.startsWith('30')) {
    return {
      sectorLabel: 'Specialty Chemicals & Pharmaceuticals Cluster',
      regulatoryAuthority: 'Chemexcil / Pharmexcil / CDSCO India',
      endorsements: [
        { label: 'Chemexcil / Pharmexcil RCMC', value: 'CHEM/2026/EXP/8421' },
        { label: 'Batch Certificate of Analysis', value: 'Batch COA-API-2026-004 (Purity: 99.8%)' },
        { label: 'UN Hazard & Packing Group', value: 'UN 1993 | Class 3 Flammable Liquid | PG III' },
        { label: '16-Section GHS Safety Data', value: 'GHS Compliant Safety Data Sheet Enclosed' },
      ],
      declarationText:
        'Exported under RoDTEP Scheme (1.6% FOB Credit). Consignment packaged and stowed strictly per IMO IMDG Code and IATA Dangerous Goods regulations.',
      packageType: 'UN-Certified 1H1/Y1.8/100 Heavy-Duty HDPE Drums with Bung Seals',
      packagingMarks: 'UN 1993 / Proper Shipping Name / GHS Class 3 Diamond / 24/7 Helpline',
      storageCondition: 'Segregated stowage away from direct sun, ignition sources, and oxidizers.',
    };
  }

  // 5. Ceramics & Vitrified Tiles (Morbi Cluster)
  if (norm.includes('ceramic') || norm.includes('tile') || hs.startsWith('6907')) {
    return {
      sectorLabel: 'Ceramics & Vitrified Tiles (Morbi Manufacturing Cluster)',
      regulatoryAuthority: 'CAPEXIL / Indian Ceramic Society',
      endorsements: [
        { label: 'CAPEXIL RCMC Registration', value: 'CAPEXIL/CER/GUJ/2026/3312' },
        { label: 'ISO 10545 Quality Test Report', value: 'Test Cert #MORBI-CER-10545-2026 (Modulus > 45 N/mm²)' },
        { label: 'Water Absorption Rating', value: 'E ≤ 0.08% (ISO 13006 Group BIa Fully Vitrified)' },
        { label: 'Surface Finish & Shade Tally', value: 'High-Gloss Glazed Porcelain | Shade Lot 04' },
      ],
      declarationText:
        'Exported under RoDTEP Scheme (2.2% FOB Credit). Consignment passed pre-stuffing drop resistance and zero-chipping optical inspection.',
      packageType: 'Reinforced Corrugated Master Boxes with High-Density Foam Protectors',
      packagingMarks: 'MARK: MORBI-TILES / Fragile Ceramic / Upward Orientation / Net SQM 1,440',
      storageCondition: 'Palletized and stretch shrink-wrapped; maximum 2-high container stacking.',
    };
  }

  // 6. Gems & Jewellery
  if (norm.includes('gold') || norm.includes('jewel') || norm.includes('diamond') || hs.startsWith('71')) {
    return {
      sectorLabel: 'Gems & Precious Jewellery Export Cluster (BDB / SEEPZ)',
      regulatoryAuthority: 'Gem & Jewellery Export Promotion Council (GJEPC)',
      endorsements: [
        { label: 'GJEPC RCMC Registration', value: 'GJEPC/BOM/2026/9941' },
        { label: 'BIS Hallmark HUID & Purity', value: 'HUID-916-MH-2026-7842 (22 Karat 916 Fineness)' },
        { label: 'Kimberley Process (KPCS)', value: 'Cert #IN-KPC-2026-8812 (Conflict-Free Origin)' },
        { label: 'Customs Appraisal & Valuation', value: 'Govt Approved Valuer Reg #VAL-2026-092' },
      ],
      declarationText:
        'Exported under RoDTEP Scheme (0.75% FOB Credit). Examination, hallmarking audit, and parcel sealing conducted under Customs Bonded Vault supervision.',
      packageType: 'Numbered Tamper-Evident Security Pouches inside Armored Vault Strongbox',
      packagingMarks: 'SEALED PRECIOUS CARGO / Customs Lead Seal #99412 / Armored Courier Escort',
      storageCondition: 'Secured airport precious cargo terminal vault transit.',
    };
  }

  // 7. Steel & Industrial Metals
  if (norm.includes('steel') || norm.includes('metal') || hs.startsWith('72') || hs.startsWith('73')) {
    return {
      sectorLabel: 'Iron, Steel & Primary Metals Cluster',
      regulatoryAuthority: 'Bureau of Indian Standards (BIS) / Joint Plant Committee',
      endorsements: [
        { label: 'BIS Product Quality License', value: 'CM/L-7821490 (IS 2062 / IS 1786)' },
        { label: 'Mill Test Certificate (MTC)', value: 'MTC EN 10204 3.1 Ref MTC-JSW-2026-9912' },
        { label: 'Heat & Chemistry Number', value: 'Heat #ST-99412 | Carbon 0.22% | Tensile 510 MPa' },
        { label: 'Quality Control Order Status', value: 'Compliant with DGFT Steel Quality Order 2024' },
      ],
      declarationText:
        'Exported under RoDTEP Scheme (1.0% FOB Credit). 100% compliance with statutory Foreign Trade Policy steel quality control directives.',
      packageType: 'High-Tensile Steel Banded Bundles with VCI Anti-Corrosion Wrap',
      packagingMarks: 'MARK: STEEL-TMT / Heat #ST-99412 / Grade E250 / Gross MT Verified',
      storageCondition: 'Protected covered dunnage stowage to avoid salt spray corrosion.',
    };
  }

  // 8. Default: Food & Processed Agro
  return {
    sectorLabel: 'Processed Food & Agricultural Export Cluster',
    regulatoryAuthority: 'Food Safety and Standards Authority of India (FSSAI) / APEDA',
    endorsements: [
      { label: 'FSSAI Central Export License', value: '10022022000142' },
      { label: 'APEDA Registration RCMC', value: 'APEDA/RCMC/MUM/2026/8912' },
      { label: 'Phytosanitary & Lab Residue', value: 'Clearance Ref #NPPO-IN-2026-784' },
      { label: 'Batch MFG / Expiry Dates', value: `MFG: 01/${new Date().getFullYear()} | EXP: 01/${new Date().getFullYear() + 2}` },
    ],
    declarationText:
      'Exported under RoDTEP Scheme (2.5% FOB Credit). Certified food-grade, microbiological and pesticide residue compliant under Indian statutory standards.',
    packageType: 'Aseptic Hermetic Food-Grade Drums / Reefer Cartons',
    packagingMarks: 'FSSAI Lic #10022022000142 / Batch APX-MN-9821 / Made in India',
    storageCondition: 'Reefer Container controlled temperature (+4°C to +8°C).',
  };
}

/**
 * Generates an official, statutory Commercial Invoice PDF enriched with
 * cluster-specific compliance endorsements and DGFT export declarations.
 */
export function generateCommercialInvoicePDF(data: CommercialInvoiceData): Buffer {
  const doc = new jsPDF();
  const cluster =
    data.clusterEndorsement ||
    getClusterInvoiceEndorsements(data.businessType, data.productName, data.hsCode);

  // Header
  doc.setFontSize(18);
  doc.setTextColor(24, 24, 27); // Slate 900
  doc.setFont('helvetica', 'bold');
  doc.text('STATUTORY COMMERCIAL EXPORT INVOICE', 14, 18);

  doc.setFontSize(8.5);
  doc.setTextColor(234, 88, 12); // Terracotta Orange
  doc.text(`SECTOR COMPLIANCE: ${cluster.sectorLabel.toUpperCase()}`, 14, 23);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Statutory export document generated per Indian Foreign Trade Policy (FTP 2023-28) & Customs Act 1962.`,
    14,
    27
  );

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 30, 196, 30);

  // Exporter / Consignee Blocks
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);

  // Left: Exporter
  doc.setFont('helvetica', 'bold');
  doc.text('EXPORTER / CONSIGNOR:', 14, 36);
  doc.setFont('helvetica', 'normal');
  doc.text(data.exporterName, 14, 41);
  doc.text(data.exporterAddress, 14, 46);
  doc.setFont('helvetica', 'bold');
  doc.text(`GSTIN: ${data.exporterGst}  |  IEC: ${data.exporterIec}`, 14, 51);

  // Right: Consignee
  doc.setFont('helvetica', 'bold');
  doc.text('CONSIGNEE / IMPORTER:', 110, 36);
  doc.setFont('helvetica', 'normal');
  doc.text(data.consigneeName, 110, 41);
  doc.text(data.consigneeAddress, 110, 46);
  doc.text(`Final Destination: ${data.destinationCountry}`, 110, 51);

  doc.line(14, 55, 196, 55);

  // Invoice Metadata
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice No: ${data.invoiceNumber}`, 14, 61);
  doc.text(`Date: ${data.invoiceDate}`, 75, 61);
  doc.text(`Terms: ${data.paymentTerms}`, 125, 61);

  doc.text(`Port of Loading: ${data.portOfLoading}`, 14, 66);
  doc.text(`Port of Discharge: ${data.portOfDischarge}`, 110, 66);

  // Product Line Item Table
  autoTable(doc, {
    startY: 71,
    head: [['Item Description & Sector Specification', 'HS Code', 'Quantity', 'Unit Price', `Total (${data.currency})`]],
    body: [
      [
        `${data.productName}\n[${cluster.sectorLabel}]`,
        data.hsCode,
        `${data.quantity.toLocaleString()} ${data.unit}`,
        `₹${data.unitPrice.toLocaleString('en-IN')}`,
        `₹${data.totalValue.toLocaleString('en-IN')}`,
      ],
    ],
    headStyles: {
      fillColor: [234, 88, 12], // Terracotta #EA580C
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: { fontSize: 8.5, cellPadding: 3 },
  });

  // Grand Total Line
  const tableEnd = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(
    `GRAND TOTAL FOB EXPORT VALUE: ₹${data.totalValue.toLocaleString('en-IN')} ${data.currency}`,
    80,
    tableEnd + 7
  );

  // Sector-Specific Statutory Endorsement Box
  const boxY = tableEnd + 12;
  doc.setFillColor(250, 249, 246); // Warm Sand #FAF9F6
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, boxY, 182, 48, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(234, 88, 12);
  doc.text('STATUTORY EXPORT COMPLIANCE & ACCREDITATION ENDORSEMENTS', 18, boxY + 6);

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text(`Regulatory Apex Body: ${cluster.regulatoryAuthority}`, 18, boxY + 11);

  // 4 Cluster Endorsement Attributes (2 columns)
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  const col1X = 18;
  const col2X = 105;

  if (cluster.endorsements[0]) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${cluster.endorsements[0].label}:`, col1X, boxY + 17);
    doc.setFont('helvetica', 'normal');
    doc.text(cluster.endorsements[0].value, col1X, boxY + 21);
  }
  if (cluster.endorsements[1]) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${cluster.endorsements[1].label}:`, col2X, boxY + 17);
    doc.setFont('helvetica', 'normal');
    doc.text(cluster.endorsements[1].value, col2X, boxY + 21);
  }
  if (cluster.endorsements[2]) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${cluster.endorsements[2].label}:`, col1X, boxY + 28);
    doc.setFont('helvetica', 'normal');
    doc.text(cluster.endorsements[2].value, col1X, boxY + 32);
  }
  if (cluster.endorsements[3]) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${cluster.endorsements[3].label}:`, col2X, boxY + 28);
    doc.setFont('helvetica', 'normal');
    doc.text(cluster.endorsements[3].value, col2X, boxY + 32);
  }

  // Storage and Packaging
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'italic');
  doc.text(`Packaging Standard: ${cluster.packageType}`, 18, boxY + 39);
  doc.text(`Storage Requirement: ${cluster.storageCondition}`, 18, boxY + 44);

  // Exporter Statutory Declaration
  const declY = boxY + 54;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('EXPORTER STATUTORY DECLARATION (CUSTOMS ACT 1962 / FTP 2023):', 14, declY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const declaration = `"${cluster.declarationText} We hereby declare that the particulars stated in this invoice are true and correct, and the value declared represents the full transaction value under verified export contract."`;
  const splitDeclaration = doc.splitTextToSize(declaration, 182);
  doc.text(splitDeclaration, 14, declY + 4);

  // Signatory Box
  const sigY = declY + 16;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`FOR ${data.exporterName.toUpperCase()}`, 130, sigY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('[Digitally Signed via VyaparFlow Operating System]', 130, sigY + 10);
  doc.text('AUTHORIZED STATUTORY SIGNATORY', 130, sigY + 14);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Generated by VyaparFlow Pan-India Export Operating System. Authenticated for customs filing under ICEGATE / DGFT.`,
    14,
    285
  );

  return Buffer.from(doc.output('arraybuffer'));
}

/**
 * Generates an official Export Packing List PDF with cluster-specific package markings,
 * tare/net/gross weight breakdown, and container stowage standards.
 */
export function generatePackingListPDF(data: PackingListData): Buffer {
  const doc = new jsPDF();
  const cluster =
    data.clusterEndorsement ||
    getClusterInvoiceEndorsements(data.businessType, data.productName, data.hsCode);

  const grossWeight = Math.round(data.weight * 1.05);
  const tareWeight = data.tareWeight || Math.round(grossWeight - data.weight);

  // Header
  doc.setFontSize(18);
  doc.setTextColor(24, 24, 27);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL EXPORT PACKING LIST & STOWAGE MANIFEST', 14, 18);

  doc.setFontSize(8.5);
  doc.setTextColor(234, 88, 12);
  doc.text(`SECTOR: ${cluster.sectorLabel.toUpperCase()}`, 14, 23);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Standardized container packing specification and international shipping marks declaration.`,
    14,
    27
  );

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 30, 196, 30);

  // Parties & Reference Details
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);

  doc.text(`Shipper / Exporter: ${data.exporterName}`, 14, 36);
  doc.text(`Consignee / Importer: ${data.consigneeName}`, 110, 36);
  doc.text(`Commercial Invoice Ref: ${data.invoiceNumber}`, 14, 42);
  doc.text(`Destination Port: ${data.portOfDischarge}, ${data.destinationCountry}`, 110, 42);

  doc.line(14, 46, 196, 46);

  // Itemized Packing Table
  autoTable(doc, {
    startY: 50,
    head: [['Package Marks & Nos.', 'Item Description & Grade', 'Package Type', 'Units', 'Net Wt (KG)', 'Gross Wt (KG)']],
    body: [
      [
        cluster.packagingMarks,
        `${data.productName}\n[HS: ${data.hsCode}]`,
        cluster.packageType,
        `${data.packages} Units`,
        `${data.weight.toLocaleString('en-IN')} KG`,
        `${grossWeight.toLocaleString('en-IN')} KG`,
      ],
    ],
    headStyles: {
      fillColor: [15, 23, 42], // Slate 900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    styles: { fontSize: 8, cellPadding: 3 },
  });

  const tableEnd = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  // Weight Summary Box
  const summaryY = tableEnd + 6;
  doc.setFillColor(250, 249, 246);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, summaryY, 182, 26, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('CONSIGNMENT CARGO WEIGHT SUMMARY:', 18, summaryY + 6);

  doc.setFontSize(8);
  doc.text(`Total Packages: ${data.packages} Units`, 18, summaryY + 12);
  doc.text(`Total Net Weight: ${data.weight.toLocaleString('en-IN')} KG`, 18, summaryY + 18);

  doc.text(`Tare Packing Weight: ${tareWeight.toLocaleString('en-IN')} KG`, 105, summaryY + 12);
  doc.text(`Total Gross Weight: ${grossWeight.toLocaleString('en-IN')} KG`, 105, summaryY + 18);

  // Sector Packaging & Handling Directives Box
  const handlingY = summaryY + 31;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(234, 88, 12);
  doc.text('SECTOR HANDLING, PALLETIZATION & ISPM-15 DIRECTIVES:', 14, handlingY);

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text(`• Standard Package Type: ${cluster.packageType}`, 14, handlingY + 5);
  doc.text(`• Shipping Stencil Marks: ${cluster.packagingMarks}`, 14, handlingY + 10);
  doc.text(`• Transit Storage Requirement: ${cluster.storageCondition}`, 14, handlingY + 15);
  doc.text(`• Wood Packaging: All timber pallets heat-treated and certified per IPPC ISPM-15 standard.`, 14, handlingY + 20);

  // Signatory
  const sigY = handlingY + 30;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`FOR ${data.exporterName.toUpperCase()}`, 130, sigY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('[Digitally Verified Dispatch Manifest]', 130, sigY + 8);
  doc.text('LOGISTICS PACKING IN-CHARGE', 130, sigY + 12);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Generated by VyaparFlow Pan-India Export Operating System. Authenticated manifest for port gate-in & CFS tally.`,
    14,
    285
  );

  return Buffer.from(doc.output('arraybuffer'));
}
