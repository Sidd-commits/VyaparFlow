import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Export Logistics Readiness Platform...');

  // Clean existing tables
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.trackingEvent.deleteMany();
  await prisma.insuranceOption.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.providerTask.deleteMany();
  await prisma.certificationRequest.deleteMany();
  await prisma.packagingItem.deleteMany();
  await prisma.document.deleteMany();
  await prisma.requirement.deleteMany();
  await prisma.rule.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.productCountry.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.country.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();

  // 1. Users
  console.log('Creating users...');
  const msmeUser = await prisma.user.create({
    data: {
      email: 'msme@apex-exports.com',
      passwordHash: 'password123',
      name: 'Rajesh Patil (MSME Owner)',
      role: 'MSME',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
  });

  const msmeUser2 = await prisma.user.create({
    data: {
      email: 'msme2@konkan-spices.com',
      passwordHash: 'password123',
      name: 'Sunil Sawant',
      role: 'MSME',
    },
  });

  const providerUserFreight = await prisma.user.create({
    data: {
      email: 'provider@freight.com',
      passwordHash: 'password123',
      name: 'Captain Vikram Sharma (SwiftGlobe)',
      role: 'PROVIDER',
    },
  });

  const providerUserLab = await prisma.user.create({
    data: {
      email: 'lab@certify.com',
      passwordHash: 'password123',
      name: 'Dr. Anita Roy (Apex Quality Labs)',
      role: 'PROVIDER',
    },
  });

  const providerUserCHA = await prisma.user.create({
    data: {
      email: 'cha@customs.com',
      passwordHash: 'password123',
      name: 'Suresh Menon (Western Ports CHA)',
      role: 'PROVIDER',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@vyaparflow.com',
      passwordHash: 'password123',
      name: 'Platform Operator Admin',
      role: 'ADMIN',
    },
  });

  // 2. Businesses
  console.log('Creating businesses...');
  const palgharBusiness = await prisma.business.create({
    data: {
      ownerUserId: msmeUser.id,
      legalName: 'Apex Agro Processing & Exports Pvt Ltd',
      displayName: 'Apex Quality Agro Exporters',
      businessType: 'Private Limited / MSME Manufacturer',
      location: 'Plot 42, Export Processing Zone',
      city: 'Mumbai',
      state: 'Maharashtra',
      gstStatus: 'Active (27AAACP1234F1Z5)',
      iecStatus: 'Active (0301099882)',
      profileCompletion: 90,
    },
  });

  const konkanBusiness = await prisma.business.create({
    data: {
      ownerUserId: msmeUser2.id,
      legalName: 'Konkan Spices & Extracts LLP',
      displayName: 'Konkan Spice Exporters',
      businessType: 'LLP',
      location: 'MIDC Ratnagiri',
      city: 'Ratnagiri',
      state: 'Maharashtra',
      gstStatus: 'Active',
      iecStatus: 'Active',
      profileCompletion: 75,
    },
  });

  // 3. Product Categories
  console.log('Creating categories...');
  const catAgro = await prisma.productCategory.create({
    data: {
      name: 'Agricultural & Processed Foods',
      description: 'Processed fruits, pulp, juices, canned agricultural items',
    },
  });

  const catSpices = await prisma.productCategory.create({
    data: {
      name: 'Spices & Essential Oils',
      description: 'Whole spices, ground spices, oleoresins and extracts',
    },
  });

  const catTextiles = await prisma.productCategory.create({
    data: {
      name: 'Textiles & Ready Made Garments',
      description: 'Cotton garments, handloom fabrics, industrial textiles',
    },
  });

  const catHardware = await prisma.productCategory.create({
    data: {
      name: 'Engineering & Metal Hardware',
      description: 'Fasteners, valves, pump components, forged fittings',
    },
  });

  const catPharma = await prisma.productCategory.create({
    data: {
      name: 'Chemical & Pharmaceuticals',
      description: 'Active pharmaceutical ingredients, organic chemicals',
    },
  });

  const catSteel = await prisma.productCategory.create({
    data: {
      name: 'Steel & Metal Products',
      description: 'Structural steel, TMT bars, coils, pipes, and metal hardware',
    },
  });

  const catFood = await prisma.productCategory.create({
    data: {
      name: 'Food Products & Processed Foods',
      description: 'Ready-to-eat, canned foods, processed food products, beverages',
    },
  });

  const catDiamonds = await prisma.productCategory.create({
    data: {
      name: 'Diamonds & Precious Stones',
      description: 'Natural and lab-grown diamonds, precious and semi-precious gemstones',
    },
  });

  const catGold = await prisma.productCategory.create({
    data: {
      name: 'Gold & Precious Metals',
      description: 'Gold bars, gold jewellery, silver, platinum, and precious metals',
    },
  });

  // 4. Destination Countries
  console.log('Creating countries...');
  const netherlands = await prisma.country.create({
    data: { name: 'Netherlands', isoCode: 'NL' },
  });

  const japan = await prisma.country.create({
    data: { name: 'Japan', isoCode: 'JP' },
  });

  const germany = await prisma.country.create({
    data: { name: 'Germany', isoCode: 'DE' },
  });

  const usa = await prisma.country.create({
    data: { name: 'United States', isoCode: 'US' },
  });

  const uk = await prisma.country.create({
    data: { name: 'United Kingdom', isoCode: 'GB' },
  });

  const uae = await prisma.country.create({
    data: { name: 'United Arab Emirates', isoCode: 'AE' },
  });

  // 5. Products
  console.log('Creating products...');
  const productMangoPulp = await prisma.product.create({
    data: {
      businessId: palgharBusiness.id,
      categoryId: catAgro.id,
      name: 'Premium Alphonso Mango Pulp (Canned)',
      hsCode: '2008.99.11',
      unit: 'MT',
      defaultValue: 1500000,
    },
  });

  const productTurmeric = await prisma.product.create({
    data: {
      businessId: konkanBusiness.id,
      categoryId: catSpices.id,
      name: 'Organic Turmeric Powder (Curcumin 5%)',
      hsCode: '0910.30.30',
      unit: 'KG',
      defaultValue: 800000,
    },
  });

  // 6. ProductCountry Mappings
  const pcMangoNL = await prisma.productCountry.create({
    data: {
      productId: productMangoPulp.id,
      countryId: netherlands.id,
    },
  });

  const pcMangoDE = await prisma.productCountry.create({
    data: {
      productId: productMangoPulp.id,
      countryId: germany.id,
    },
  });

  const pcMangoUAE = await prisma.productCountry.create({
    data: {
      productId: productMangoPulp.id,
      countryId: uae.id,
    },
  });

  const pcTurmericUS = await prisma.productCountry.create({
    data: {
      productId: productTurmeric.id,
      countryId: usa.id,
    },
  });

  // 7. Compliance Rules Engine Dataset (15+ Rules)
  console.log('Creating compliance rules dataset...');
  const ruleApeda = await prisma.rule.create({
    data: {
      categoryId: catAgro.id,
      countryId: uae.id,
      type: 'document',
      title: 'RCMC / APEDA Export License Registration',
      description: 'Mandatory registration with Agricultural and Processed Food Products Export Development Authority (APEDA).',
      priority: 'critical',
      mandatory: true,
      weight: 15,
      processingDays: 3,
      blocksDispatch: true,
      notes: 'Required under Indian Foreign Trade Policy for processed food products.',
    },
  });

  const rulePhyto = await prisma.rule.create({
    data: {
      categoryId: catAgro.id,
      countryId: uae.id,
      type: 'certification',
      title: 'Phytosanitary Inspection Certificate',
      description: 'Official sanitary & pest clearance issued by Directorate of Plant Protection, Quarantine & Storage.',
      priority: 'critical',
      mandatory: true,
      weight: 20,
      processingDays: 4,
      blocksDispatch: true,
      notes: 'Required for entry clearance at Jebel Ali Port, UAE.',
    },
  });

  const ruleCoO = await prisma.rule.create({
    data: {
      categoryId: catAgro.id,
      countryId: uae.id,
      type: 'document',
      title: 'Non-Preferential Certificate of Origin (CoO)',
      description: 'Legal proof of origin issued by authorized Chamber of Commerce in Maharashtra.',
      priority: 'critical',
      mandatory: true,
      weight: 15,
      processingDays: 2,
      blocksDispatch: true,
      notes: 'Mandatory for UAE customs valuation and origin verification.',
    },
  });

  const ruleInvoice = await prisma.rule.create({
    data: {
      categoryId: catAgro.id,
      countryId: uae.id,
      type: 'document',
      title: 'Commercial Invoice & Detailed Packing List Draft',
      description: 'Export commercial invoice specifying unit price, HS Code, net/gross weight and shipping marks.',
      priority: 'high',
      mandatory: true,
      weight: 10,
      processingDays: 1,
      blocksDispatch: true,
      notes: 'Must match manifest data filed at port customs.',
    },
  });

  const ruleHalal = await prisma.rule.create({
    data: {
      categoryId: catAgro.id,
      countryId: uae.id,
      type: 'certification',
      title: 'Halal Food Product Compliance Certificate',
      description: 'Certificate from accredited Halal certification body for food exports to GCC countries.',
      priority: 'high',
      mandatory: true,
      weight: 15,
      processingDays: 5,
      blocksDispatch: false,
      notes: 'Ensures compliance with UAE Ministry of Industry & Advanced Technology regulations.',
    },
  });

  const ruleLabelling = await prisma.rule.create({
    data: {
      categoryId: catAgro.id,
      countryId: uae.id,
      type: 'labelling',
      title: 'Bilingual English/Arabic Export Packaging & Labelling',
      description: 'Outer carton & drum labelling with batch number, production date, expiry date, and storage temp in Arabic & English.',
      priority: 'high',
      mandatory: true,
      weight: 15,
      processingDays: 2,
      blocksDispatch: true,
      notes: 'Non-compliant labels will cause cargo quarantine at UAE port of entry.',
    },
  });

  const ruleFssai = await prisma.rule.create({
    data: {
      categoryId: catAgro.id,
      countryId: uae.id,
      type: 'document',
      title: 'FSSAI Export Central License',
      description: 'Food Safety and Standards Authority of India central export category license.',
      priority: 'medium',
      mandatory: true,
      weight: 10,
      processingDays: 2,
      blocksDispatch: true,
      notes: 'Required for all food processing units engaging in export operations.',
    },
  });

  // Additional rules for Germany & USA
  await prisma.rule.create({
    data: {
      categoryId: catAgro.id,
      countryId: germany.id,
      type: 'certification',
      title: 'EU Pesticide & Heavy Metal Residue Test Report',
      description: 'Lab analysis verifying compliance with EU Maximum Residue Limits (MRLs).',
      priority: 'critical',
      mandatory: true,
      weight: 25,
      processingDays: 6,
      blocksDispatch: true,
    },
  });

  await prisma.rule.create({
    data: {
      categoryId: catSpices.id,
      countryId: usa.id,
      type: 'document',
      title: 'US FDA Prior Notice & Facility Registration',
      description: 'Filing of FDA Prior Notice before dispatching food/spice cargo to USA.',
      priority: 'critical',
      mandatory: true,
      weight: 30,
      processingDays: 3,
      blocksDispatch: true,
    },
  });

  // 8. Requirements for Palghar MSME (Alphonso Mango Pulp -> UAE)
  console.log('Creating product-country requirements for Palghar MSME...');
  const reqApeda = await prisma.requirement.create({
    data: {
      productCountryId: pcMangoUAE.id,
      ruleId: ruleApeda.id,
      type: 'document',
      title: ruleApeda.title,
      priority: 'critical',
      status: 'verified', // Completed
      weight: 15,
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  const reqInvoice = await prisma.requirement.create({
    data: {
      productCountryId: pcMangoUAE.id,
      ruleId: ruleInvoice.id,
      type: 'document',
      title: ruleInvoice.title,
      priority: 'high',
      status: 'verified', // Completed
      weight: 10,
      completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  const reqFssai = await prisma.requirement.create({
    data: {
      productCountryId: pcMangoUAE.id,
      ruleId: ruleFssai.id,
      type: 'document',
      title: ruleFssai.title,
      priority: 'medium',
      status: 'verified', // Completed
      weight: 10,
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  // Critical Blockers for User A
  const reqPhyto = await prisma.requirement.create({
    data: {
      productCountryId: pcMangoUAE.id,
      ruleId: rulePhyto.id,
      type: 'certification',
      title: rulePhyto.title,
      priority: 'critical',
      status: 'missing', // BLOCKER 1
      weight: 20,
      reason: 'Requires plant quarantine lab inspection and certification request to authorized lab.',
    },
  });

  const reqCoO = await prisma.requirement.create({
    data: {
      productCountryId: pcMangoUAE.id,
      ruleId: ruleCoO.id,
      type: 'document',
      title: ruleCoO.title,
      priority: 'critical',
      status: 'under_review', // BLOCKER 2 (Uploaded file pending verification by Admin)
      weight: 15,
      reason: 'Uploaded document is under review by Platform Admin.',
    },
  });

  const reqHalal = await prisma.requirement.create({
    data: {
      productCountryId: pcMangoUAE.id,
      ruleId: ruleHalal.id,
      type: 'certification',
      title: ruleHalal.title,
      priority: 'high',
      status: 'missing', // BLOCKER 3
      weight: 15,
      reason: 'Halal accreditation request not yet assigned to certified body.',
    },
  });

  const reqLabelling = await prisma.requirement.create({
    data: {
      productCountryId: pcMangoUAE.id,
      ruleId: ruleLabelling.id,
      type: 'labelling',
      title: ruleLabelling.title,
      priority: 'high',
      status: 'uploaded', // BLOCKER 4 (Packaging checklist incomplete)
      weight: 15,
      reason: 'Packaging & labelling checklist requires validation of 2 pending items.',
    },
  });

  // Requirements for Konkan MSME (Turmeric -> USA)
  console.log('Creating product-country requirements for Konkan MSME (User B)...');
  const reqSpicesRcmc = await prisma.requirement.create({
    data: {
      productCountryId: pcTurmericUS.id,
      type: 'document',
      title: 'Spices Board Registration-cum-Membership Certificate (RCMC)',
      priority: 'critical',
      status: 'verified',
      weight: 20,
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      reason: 'Mandatory Spices Board exporter registration certificate for spice consignments.',
    },
  });

  const reqFdaPrior = await prisma.requirement.create({
    data: {
      productCountryId: pcTurmericUS.id,
      type: 'document',
      title: 'US FDA Prior Notice & Food Facility Registration',
      priority: 'critical',
      status: 'under_review',
      weight: 25,
      reason: 'Filing of FDA Prior Notice confirmation draft under evaluation before container loading.',
    },
  });

  const reqUsdaOrganic = await prisma.requirement.create({
    data: {
      productCountryId: pcTurmericUS.id,
      type: 'certification',
      title: 'USDA NOP / NPOP Organic Equivalency Certificate',
      priority: 'critical',
      status: 'missing',
      weight: 20,
      reason: 'Accredited organic certification body assessment required for organic grade claim.',
    },
  });

  const reqHeavyMetals = await prisma.requirement.create({
    data: {
      productCountryId: pcTurmericUS.id,
      type: 'certification',
      title: 'Heavy Metals & Pesticide Residue Analysis (NABL Lab)',
      priority: 'high',
      status: 'verified',
      weight: 15,
      completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      reason: 'Certified laboratory analysis verifying lead & curcumin content compliance.',
    },
  });

  const reqUsInvoice = await prisma.requirement.create({
    data: {
      productCountryId: pcTurmericUS.id,
      type: 'document',
      title: 'Commercial Export Invoice & Packing Breakdown',
      priority: 'high',
      status: 'verified',
      weight: 10,
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      reason: 'Itemized commercial invoice with CIF New York valuation.',
    },
  });

  const reqUsCoO = await prisma.requirement.create({
    data: {
      productCountryId: pcTurmericUS.id,
      type: 'document',
      title: 'Certificate of Origin (Non-Preferential)',
      priority: 'high',
      status: 'under_review',
      weight: 10,
      reason: 'Chamber of Commerce draft certificate pending review.',
    },
  });

  // 9. Documents
  console.log('Creating sample uploaded documents for User A & User B...');
  await prisma.document.create({
    data: {
      businessId: palgharBusiness.id,
      requirementId: reqApeda.id,
      type: 'APEDA_RCMC',
      storageKey: 'docs/apeda_rcmc_apexagro_2026.pdf',
      originalName: 'APEDA_RCMC_ApexAgro_PvtLtd.pdf',
      mimeType: 'application/pdf',
      size: 452000,
      issueDate: new Date('2025-01-10'),
      expiryDate: new Date('2028-01-09'),
      status: 'verified',
    },
  });

  await prisma.document.create({
    data: {
      businessId: palgharBusiness.id,
      requirementId: reqInvoice.id,
      type: 'InvoiceDraft',
      storageKey: 'docs/commercial_invoice_draft_001.pdf',
      originalName: 'Commercial_Invoice_Draft_SHP001.pdf',
      mimeType: 'application/pdf',
      size: 210000,
      status: 'verified',
    },
  });

  await prisma.document.create({
    data: {
      businessId: palgharBusiness.id,
      requirementId: reqCoO.id,
      type: 'CoO',
      storageKey: 'docs/certificate_of_origin_draft.pdf',
      originalName: 'Certificate_of_Origin_Apex_Agro.pdf',
      mimeType: 'application/pdf',
      size: 320000,
      issueDate: new Date('2026-03-01'),
      expiryDate: new Date('2027-03-01'),
      status: 'under_review',
      notes: 'Uploaded draft CoO issued by Maharashtra Chamber of Commerce for evaluation.',
    },
  });

  // Documents for User B (Konkan Spices)
  await prisma.document.create({
    data: {
      businessId: konkanBusiness.id,
      requirementId: reqSpicesRcmc.id,
      type: 'SPICES_BOARD_RCMC',
      storageKey: 'docs/spices_board_rcmc_konkan.pdf',
      originalName: 'Spices_Board_RCMC_KonkanSpices.pdf',
      mimeType: 'application/pdf',
      size: 380000,
      issueDate: new Date('2025-06-01'),
      expiryDate: new Date('2028-05-31'),
      status: 'verified',
    },
  });

  await prisma.document.create({
    data: {
      businessId: konkanBusiness.id,
      requirementId: reqHeavyMetals.id,
      type: 'LAB_TEST_REPORT',
      storageKey: 'docs/nabl_heavy_metals_turmeric.pdf',
      originalName: 'NABL_Lab_Heavy_Metals_Assay_Report.pdf',
      mimeType: 'application/pdf',
      size: 490000,
      issueDate: new Date('2026-02-15'),
      status: 'verified',
      notes: 'Curcumin 5.2% assay and heavy metals compliant with US FDA MRLs.',
    },
  });

  await prisma.document.create({
    data: {
      businessId: konkanBusiness.id,
      requirementId: reqFdaPrior.id,
      type: 'FDA_PRIOR_NOTICE',
      storageKey: 'docs/fda_prior_notice_draft_konkan.pdf',
      originalName: 'FDA_Prior_Notice_Confirmation_Draft.pdf',
      mimeType: 'application/pdf',
      size: 260000,
      status: 'under_review',
      notes: 'Draft FDA Prior notice confirmation filed with US Customs border entry.',
    },
  });

  // 10. Packaging Items
  console.log('Creating packaging checklist items for User A & User B...');
  await prisma.packagingItem.create({
    data: {
      productCountryId: pcMangoUAE.id,
      title: 'Bilingual English/Arabic Production & Expiry Labeling',
      type: 'labelling',
      priority: 'high',
      mandatory: true,
      status: 'incomplete', // Incomplete
      notes: 'Each 3.1kg tin drum must display batch code, manufacturing date, and expiry in Arabic & English.',
    },
  });

  await prisma.packagingItem.create({
    data: {
      productCountryId: pcMangoUAE.id,
      title: 'Food-Grade Aseptic Container Hermetic Sealing',
      type: 'packaging',
      priority: 'high',
      mandatory: true,
      status: 'completed',
      notes: 'Verified inner food-grade liner integrity.',
    },
  });

  await prisma.packagingItem.create({
    data: {
      productCountryId: pcMangoUAE.id,
      title: 'Euro-Palletization & Heat-Treated ISPM-15 Wooden Pallets',
      type: 'packaging',
      priority: 'medium',
      mandatory: false,
      status: 'completed',
      notes: 'Wooden pallets stamped with ISPM-15 phytosanitary mark.',
    },
  });

  // Packaging for User B (Konkan Spices)
  await prisma.packagingItem.create({
    data: {
      productCountryId: pcTurmericUS.id,
      title: 'US FDA Compliant English Nutrition & Ingredient Labeling',
      type: 'labelling',
      priority: 'high',
      mandatory: true,
      status: 'incomplete',
      notes: 'Outer kraft bags must display FDA nutrition panel, net weight in lbs/kg, lot # and processor info.',
    },
  });

  await prisma.packagingItem.create({
    data: {
      productCountryId: pcTurmericUS.id,
      title: 'Multi-wall Kraft Bags with Inner Polyliner Moisture Barrier',
      type: 'packaging',
      priority: 'high',
      mandatory: true,
      status: 'completed',
      notes: 'Inner 50-micron food-grade polyethylene liner sealed against ambient humidity.',
    },
  });

  await prisma.packagingItem.create({
    data: {
      productCountryId: pcTurmericUS.id,
      title: 'Heat-Treated ISPM-15 Wooden Pallets & Shrink Wrap',
      type: 'packaging',
      priority: 'medium',
      mandatory: false,
      status: 'completed',
      notes: 'Pallets fumigated and heat-treated with certified ISPM-15 stamp.',
    },
  });

  // 11. Providers
  console.log('Creating service providers...');
  const providerLab = await prisma.provider.create({
    data: {
      userId: providerUserLab.id,
      name: 'Apex Quality & Plant Quarantine Labs',
      type: 'CERTIFICATION',
      serviceArea: 'Western & JNPT Port Region',
      contactEmail: 'lab@certify.com',
    },
  });

  const providerFreight1 = await prisma.provider.create({
    data: {
      userId: providerUserFreight.id,
      name: 'SwiftGlobe Logistics India Ltd',
      type: 'FREIGHT',
      serviceArea: 'Global (Sea / Air / Express)',
      contactEmail: 'quotes@swiftglobe.com',
    },
  });

  const providerFreight2 = await prisma.provider.create({
    data: {
      name: 'Konkan Maritime Lines',
      type: 'FREIGHT',
      serviceArea: 'GCC & Middle East Routes',
      contactEmail: 'info@konkanfreight.in',
    },
  });

  const providerFreight3 = await prisma.provider.create({
    data: {
      name: 'Pacific Cargo Air Line',
      type: 'FREIGHT',
      serviceArea: 'Air Freight Cargo Express',
      contactEmail: 'ops@pacificcargo.com',
    },
  });

  const providerCHA = await prisma.provider.create({
    data: {
      userId: providerUserCHA.id,
      name: 'Western Ports Customs House Agent (CHA) & Maritime Services',
      type: 'CUSTOMS_CHA',
      serviceArea: 'JNPT Port & Western ICD',
      contactEmail: 'cha@westernport.in',
    },
  });

  const providerInsurance = await prisma.provider.create({
    data: {
      name: 'ExportShield Marine & Cargo Insurance Corp',
      type: 'INSURANCE',
      serviceArea: 'Worldwide Cargo Insurance',
      contactEmail: 'claims@exportshield.com',
    },
  });

  // 12. Active Demo Shipment for MSME User A
  console.log('Creating active demo shipment for User A...');
  const activeShipment = await prisma.shipment.create({
    data: {
      shipmentNumber: 'SHP-2026-AE-001',
      businessId: palgharBusiness.id,
      productId: productMangoPulp.id,
      destinationCountryId: uae.id,
      destinationCity: 'Dubai (Jebel Ali Port)',
      value: 1500000,
      currency: 'INR',
      quantity: 10, // 10 MT
      weight: 10000, // 10,000 KG
      packages: 500, // 500 drums
      mode: 'Sea',
      status: 'Draft',
      eta: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    },
  });

  // 13. Seeded Quotes for User A active shipment
  console.log('Creating logistics quotes for User A...');
  await prisma.quote.create({
    data: {
      shipmentId: activeShipment.id,
      providerId: providerFreight1.id,
      mode: 'Sea Freight (FCL 20ft Reefer)',
      cost: 125000,
      currency: 'INR',
      transitMin: 12,
      transitMax: 15,
      inclusions: 'Port handling, JNPT customs documentation assistance, Temperature logging (+4°C)',
      exclusions: 'Destination customs duty at Jebel Ali Port, Local warehouse demurrage',
      isSelected: false,
    },
  });

  await prisma.quote.create({
    data: {
      shipmentId: activeShipment.id,
      providerId: providerFreight2.id,
      mode: 'Sea Freight Express (Direct Liner)',
      cost: 155000,
      currency: 'INR',
      transitMin: 8,
      transitMax: 10,
      inclusions: 'Door-to-door factory pickup, Container seal validation, Jebel Ali priority discharge',
      exclusions: 'Import VAT/Duty in UAE',
      isSelected: false,
    },
  });

  await prisma.quote.create({
    data: {
      shipmentId: activeShipment.id,
      providerId: providerFreight3.id,
      mode: 'Air Cargo Express',
      cost: 280000,
      currency: 'INR',
      transitMin: 2,
      transitMax: 3,
      inclusions: 'Direct flight Mumbai (BOM) -> Dubai (DXB), Airport cold store, Priority customs release',
      exclusions: 'Heavy cargo oversized Surcharges',
      isSelected: false,
    },
  });

  // 14. Seeded Insurance Option
  await prisma.insuranceOption.create({
    data: {
      shipmentId: activeShipment.id,
      providerId: providerInsurance.id,
      rate: 0.003, // 0.3%
      premium: 4500,
      coverage: 'All-Risk Marine Cargo Insurance (Institute Cargo Clauses A) including cold-chain breakdown cover up to ₹1,500,000 value.',
      status: 'Not Requested',
      exclusions: 'Delay in transit due to strike/war unless endorsed.',
    },
  });

  // Active Shipment for User B (Konkan Spices)
  console.log('Creating active demo shipment for User B (Konkan Spices)...');
  const activeShipmentUserB = await prisma.shipment.create({
    data: {
      shipmentNumber: 'SHP-2026-US-002',
      businessId: konkanBusiness.id,
      productId: productTurmeric.id,
      destinationCountryId: usa.id,
      destinationCity: 'New York (Port of Newark)',
      value: 800000,
      currency: 'INR',
      quantity: 4, // 4 MT
      weight: 4000, // 4,000 KG
      packages: 160, // 160 bags
      mode: 'Sea',
      status: 'Preparation',
      eta: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.quote.create({
    data: {
      shipmentId: activeShipmentUserB.id,
      providerId: providerFreight1.id,
      mode: 'Sea Freight FCL (Dry Van 20ft)',
      cost: 165000,
      currency: 'INR',
      transitMin: 22,
      transitMax: 26,
      inclusions: 'Port handling, JNPT customs documentation assistance, Bill of Lading filing',
      exclusions: 'US Destination Customs Entry fee',
      isSelected: true,
    },
  });

  await prisma.quote.create({
    data: {
      shipmentId: activeShipmentUserB.id,
      providerId: providerFreight3.id,
      mode: 'Air Cargo Express',
      cost: 340000,
      currency: 'INR',
      transitMin: 3,
      transitMax: 5,
      inclusions: 'Direct flight BOM -> JFK, Priority airport terminal handling',
      exclusions: 'US FDA inspection fee',
      isSelected: false,
    },
  });

  // Tracking events for User B active shipment
  await prisma.trackingEvent.createMany({
    data: [
      {
        shipmentId: activeShipmentUserB.id,
        status: 'Order Confirmed',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        location: 'MIDC Ratnagiri Facility',
        note: 'Export shipment order confirmed and packaging batch validated.',
      },
      {
        shipmentId: activeShipmentUserB.id,
        status: 'Preparation',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        location: 'Konkan Spices Processing Hub',
        note: 'Spices Board RCMC verified and draft commercial invoice generated.',
      },
    ],
  });

  // 15. Historical Delivered Shipment for User A
  console.log('Creating historical completed shipment for User A...');
  const completedShipment = await prisma.shipment.create({
    data: {
      shipmentNumber: 'SHP-2026-DE-088',
      businessId: palgharBusiness.id,
      productId: productMangoPulp.id,
      destinationCountryId: germany.id,
      destinationCity: 'Hamburg',
      value: 2200000,
      currency: 'INR',
      quantity: 15,
      weight: 15000,
      packages: 750,
      mode: 'Sea',
      status: 'Delivered',
      eta: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // Tracking events for completed shipment
  const pastDays = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

  await prisma.trackingEvent.createMany({
    data: [
      {
        shipmentId: completedShipment.id,
        status: 'Order Confirmed',
        timestamp: pastDays(20),
        location: 'Export Processing Zone, Maharashtra',
        note: 'Shipment created and pre-shipment export checklist validated.',
      },
      {
        shipmentId: completedShipment.id,
        status: 'Documents Ready',
        timestamp: pastDays(18),
        location: 'Apex Quality Agro HQ',
        note: 'Commercial Invoice, Packing List, Certificate of Origin & EU Phytosanitary Certificate verified.',
      },
      {
        shipmentId: completedShipment.id,
        status: 'Pickup Scheduled',
        timestamp: pastDays(16),
        location: 'Factory Gate 2',
        note: 'SwiftGlobe Reefer container truck arrived for loading.',
      },
      {
        shipmentId: completedShipment.id,
        status: 'Picked Up',
        timestamp: pastDays(15),
        location: 'Origin Factory -> JNPT Port Corridor',
        note: '500 Sealed drums loaded; cold-chain temperature set to +4°C.',
      },
      {
        shipmentId: completedShipment.id,
        status: 'Export Customs',
        timestamp: pastDays(14),
        location: 'JNPT Customs Terminal, Navi Mumbai',
        note: 'CHA filed shipping bill; LEO (Let Export Order) granted by Indian Customs.',
      },
      {
        shipmentId: completedShipment.id,
        status: 'Dispatched',
        timestamp: pastDays(13),
        location: 'JNPT Port (Vessel: MV Northern Lights)',
        note: 'Container loaded onto vessel. Maritime bill of lading issued.',
      },
      {
        shipmentId: completedShipment.id,
        status: 'In Transit',
        timestamp: pastDays(8),
        location: 'Suez Canal Maritime Route',
        note: 'Vessel in transit according to vessel tracking schedule.',
      },
      {
        shipmentId: completedShipment.id,
        status: 'Destination Customs',
        timestamp: pastDays(3),
        location: 'Hamburg Port Customs, Germany',
        note: 'EU Phytosanitary & MRL pest inspection cleared.',
      },
      {
        shipmentId: completedShipment.id,
        status: 'Delivered',
        timestamp: pastDays(2),
        location: 'Central Logistics Hub, Hamburg',
        note: 'Cargo handed over to buyer representative in sound condition.',
      },
    ],
  });

  // 16. Notifications & Audit Logs
  await prisma.notification.createMany({
    data: [
      {
        userId: msmeUser.id,
        type: 'CRITICAL_ACTION',
        title: 'Export Readiness Action Required',
        message: 'Your export profile for UAE has 4 critical blockers (Phytosanitary inspection, Certificate of Origin review, Halal request, Packaging labeling).',
      },
      {
        userId: msmeUser.id,
        type: 'INFO',
        title: 'Logistics Quotes Generated',
        message: '3 logistics quotes are ready for comparison on shipment SHP-2026-AE-001.',
      },
      {
        userId: msmeUser2.id,
        type: 'CRITICAL_ACTION',
        title: 'FDA Prior Notice Required',
        message: 'Your export consignment to USA requires FDA Prior notice verification before container loading.',
      },
    ],
  });

  await prisma.auditLog.create({
    data: {
      actorId: adminUser.id,
      entityType: 'SystemSeed',
      entityId: palgharBusiness.id,
      action: 'INITIALIZE_GOLDEN_DEMO',
      newValueJson: JSON.stringify({ business: 'Apex Quality Agro', status: 'Initialized' }),
    },
  });

  console.log('✅ Database seeding completed successfully!');
  console.log(`
  ══════════════════════════════════════════════════════════
  🚀 VYAPARFLOW DEMO CREDENTIALS:
  ----------------------------------------------------------
  • MSME Exporter 1 (Agro) : msme@apex-exports.com / password123
  • MSME Exporter 2 (Spice): msme2@konkan-spices.com / password123
  • Service Provider (Freight): provider@freight.com / password123
  • Certification Lab      : lab@certify.com / password123
  • Customs CHA Agent      : cha@customs.com / password123
  • Admin Platform Operator: admin@vyaparflow.com / password123
  ══════════════════════════════════════════════════════════
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
