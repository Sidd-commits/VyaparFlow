/**
 * Business Type Configuration
 *
 * Defines per-business-type certificates, documents, packaging items,
 * and default product details that are generated during MSME registration.
 */

export const BUSINESS_TYPES = [
  'Food',
  'Agricultural Goods',
  'Spices',
  'Textiles',
  'Engineering',
  'Chemicals',
  'Ceramics',
  'Gems & Jewellery',
  'Steel',
  'Diamonds',
  'Gold',
] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];

export interface BusinessTypeRequirement {
  type: 'document' | 'certification';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  weight: number;
  blocksDispatch: boolean;
}

export interface BusinessTypePackagingItem {
  title: string;
  type: 'packaging' | 'labelling';
  priority: 'high' | 'medium' | 'low';
  mandatory: boolean;
  initialStatus: 'completed' | 'incomplete';
  notes: string;
}

export interface BusinessTypeShipmentReq {
  type: 'shipment' | 'labelling';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium';
  weight: number;
  initialStatus: 'verified' | 'missing';
}

export interface BusinessTypeConfig {
  label: string;
  businessTypeLabel: string;
  categoryMatch: string; // pattern to match ProductCategory.name
  defaultProduct: {
    name: string;
    hsCode: string;
    unit: string;
    defaultValue: number;
  };
  requirements: BusinessTypeRequirement[];
  packagingItems: BusinessTypePackagingItem[];
  shipmentPrereqs: BusinessTypeShipmentReq[];
}

export const BUSINESS_TYPE_CONFIGS: Record<BusinessType, BusinessTypeConfig> = {
  Steel: {
    label: 'Steel',
    businessTypeLabel: 'Steel MSME Exporter',
    categoryMatch: 'Steel',
    defaultProduct: {
      name: 'Structural Steel Products (TMT Bars / Coils)',
      hsCode: '7213.10.00',
      unit: 'MT',
      defaultValue: 2500000,
    },
    requirements: [
      {
        type: 'certification',
        title: 'BIS Certification (Bureau of Indian Standards)',
        description: 'Mandatory BIS product certification for steel exports confirming IS standards compliance.',
        priority: 'critical',
        weight: 20,
        blocksDispatch: true,
      },
      {
        type: 'certification',
        title: 'Mill Test Certificate (MTC / EN 10204 3.1)',
        description: 'Chemical composition and mechanical properties test report from steel mill.',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
      },
      {
        type: 'document',
        title: 'Certificate of Origin (CoO)',
        description: 'Non-preferential certificate issued by Chamber of Commerce for steel products.',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
      },
      {
        type: 'document',
        title: 'Commercial Invoice & Packing List',
        description: 'Detailed export invoice with HS code, unit weight, grade specification, and shipping marks.',
        priority: 'high',
        weight: 10,
        blocksDispatch: true,
      },
      {
        type: 'document',
        title: 'Shipping Bill & Bill of Lading',
        description: 'Customs export declaration and carrier bill for ocean freight of steel cargo.',
        priority: 'high',
        weight: 10,
        blocksDispatch: true,
      },
      {
        type: 'certification',
        title: 'Third-Party Inspection Certificate (SGS / Bureau Veritas)',
        description: 'Independent quality and quantity inspection report from accredited surveyor.',
        priority: 'medium',
        weight: 10,
        blocksDispatch: false,
      },
    ],
    packagingItems: [
      {
        title: 'Anti-Rust Coating & VCI Wrapping for Steel Products',
        type: 'packaging',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Volatile corrosion inhibitor (VCI) wrapping applied to prevent rust during ocean transit.',
      },
      {
        title: 'Bundle Strapping & Steel Banding (ISO 4171)',
        type: 'packaging',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Steel coils/bars bundled and banded per ISO 4171 for safe transport.',
      },
      {
        title: 'Heat Number & Grade Marking Labels',
        type: 'labelling',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Each bundle must display heat number, grade, and manufacturer stamp.',
      },
      {
        title: 'Container Dunnage & Load Securing Plan',
        type: 'packaging',
        priority: 'medium',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Wooden dunnage and lashing plan for container load stability.',
      },
      {
        title: 'Weight Verification & Tally Sheet',
        type: 'labelling',
        priority: 'medium',
        mandatory: false,
        initialStatus: 'incomplete',
        notes: 'Cross-verify actual weight against invoice and bill of lading declared weight.',
      },
    ],
    shipmentPrereqs: [
      {
        type: 'shipment',
        title: 'Export Quality Control Order Compliance',
        description: 'Steel products must comply with DGFT Quality Control Orders before export.',
        priority: 'critical',
        weight: 15,
        initialStatus: 'missing',
      },
      {
        type: 'shipment',
        title: 'Pre-Shipment Inspection Clearance',
        description: 'Container loading supervision and pre-shipment survey by accredited inspector.',
        priority: 'high',
        weight: 10,
        initialStatus: 'missing',
      },
    ],
  },

  Food: {
    label: 'Food',
    businessTypeLabel: 'Food Processing MSME Exporter',
    categoryMatch: 'Food',
    defaultProduct: {
      name: 'Processed Food Products (Ready-to-Eat / Canned)',
      hsCode: '2008.99.11',
      unit: 'MT',
      defaultValue: 1200000,
    },
    requirements: [
      {
        type: 'document',
        title: 'FSSAI Central Export License',
        description: 'Food Safety and Standards Authority of India central license for food export operations.',
        priority: 'critical',
        weight: 20,
        blocksDispatch: true,
      },
      {
        type: 'certification',
        title: 'Phytosanitary Inspection Certificate',
        description: 'Plant quarantine clearance from Directorate of Plant Protection for food cargo.',
        priority: 'critical',
        weight: 20,
        blocksDispatch: true,
      },
      {
        type: 'certification',
        title: 'Halal Food Compliance Certificate',
        description: 'Certificate from accredited Halal certification body for food exports to GCC/Islamic countries.',
        priority: 'high',
        weight: 15,
        blocksDispatch: false,
      },
      {
        type: 'document',
        title: 'APEDA/RCMC Export Registration',
        description: 'Registration-Cum-Membership Certificate from APEDA for processed food exports.',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
      },
      {
        type: 'certification',
        title: 'Health & Hygiene Certificate',
        description: 'Health certificate issued by authorized medical officer for food safety.',
        priority: 'high',
        weight: 10,
        blocksDispatch: false,
      },
      {
        type: 'document',
        title: 'Commercial Invoice & Packing List',
        description: 'Export invoice specifying unit price, HS Code, batch number, manufacturing and expiry dates.',
        priority: 'high',
        weight: 10,
        blocksDispatch: true,
      },
    ],
    packagingItems: [
      {
        title: 'Food-Grade Aseptic Container Hermetic Sealing',
        type: 'packaging',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Inner food-grade liner integrity verified for sealed containers.',
      },
      {
        title: 'Bilingual English/Arabic Nutrition & Expiry Labelling',
        type: 'labelling',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Each container must display ingredients, nutrition info, batch code, MFG/EXP in English & Arabic.',
      },
      {
        title: 'Cold Chain Temperature Logger Placement',
        type: 'packaging',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Temperature data logger required inside each reefer container for perishable goods.',
      },
      {
        title: 'ISPM-15 Heat-Treated Wooden Pallets',
        type: 'packaging',
        priority: 'medium',
        mandatory: false,
        initialStatus: 'incomplete',
        notes: 'Wooden pallets must bear ISPM-15 phytosanitary treatment stamp.',
      },
    ],
    shipmentPrereqs: [
      {
        type: 'shipment',
        title: 'Cold Chain Logistics Arrangement',
        description: 'Reefer container booking and cold chain continuity verification for perishable food.',
        priority: 'critical',
        weight: 15,
        initialStatus: 'missing',
      },
      {
        type: 'shipment',
        title: 'Port Health Officer Clearance',
        description: 'Health inspection clearance at port of export for food cargo.',
        priority: 'high',
        weight: 10,
        initialStatus: 'missing',
      },
    ],
  },

  'Agricultural Goods': {
    label: 'Agricultural Goods',
    businessTypeLabel: 'Agricultural MSME Exporter',
    categoryMatch: 'Agricultural',
    defaultProduct: {
      name: 'Premium Agricultural Produce (Grains / Pulses / Spices)',
      hsCode: '0713.20.00',
      unit: 'MT',
      defaultValue: 900000,
    },
    requirements: [
      {
        type: 'document',
        title: 'APEDA Registration Certificate (RCMC)',
        description: 'Mandatory APEDA registration for export of agricultural and processed food products.',
        priority: 'critical',
        weight: 20,
        blocksDispatch: true,
      },
      {
        type: 'certification',
        title: 'Phytosanitary Certificate',
        description: 'Plant quarantine inspection certificate from Directorate of Plant Protection.',
        priority: 'critical',
        weight: 20,
        blocksDispatch: true,
      },
      {
        type: 'certification',
        title: 'Fumigation Certificate (Methyl Bromide / Phosphine)',
        description: 'Pest treatment certificate confirming fumigation of agricultural cargo.',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
      },
      {
        type: 'document',
        title: 'Certificate of Origin (CoO)',
        description: 'Non-preferential certificate of origin from authorized Chamber of Commerce.',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
      },
      {
        type: 'certification',
        title: 'Plant Quarantine Clearance Certificate',
        description: 'Clearance from plant quarantine station at port of export.',
        priority: 'high',
        weight: 10,
        blocksDispatch: true,
      },
      {
        type: 'document',
        title: 'Commercial Invoice & Weight Certificate',
        description: 'Export invoice with quantity, grade, and certified weight from approved weighbridge.',
        priority: 'high',
        weight: 10,
        blocksDispatch: true,
      },
    ],
    packagingItems: [
      {
        title: 'Jute / PP Woven Bag Stitching & Moisture Barrier',
        type: 'packaging',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Bags sealed with moisture-proof inner liner for grain/pulse protection.',
      },
      {
        title: 'Lot Number & Grade Marking on Bags',
        type: 'labelling',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Each bag must show lot number, grade, net weight, and exporter details.',
      },
      {
        title: 'Container Ventilation & Desiccant Placement',
        type: 'packaging',
        priority: 'medium',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Desiccant bags placed inside container to prevent moisture damage during transit.',
      },
    ],
    shipmentPrereqs: [
      {
        type: 'shipment',
        title: 'Warehouse Fumigation Pre-Loading Certificate',
        description: 'Fumigation of warehouse and loading area before container stuffing.',
        priority: 'critical',
        weight: 15,
        initialStatus: 'missing',
      },
      {
        type: 'shipment',
        title: 'Sampling & Quality Check by AGMARK Inspector',
        description: 'Pre-shipment quality and grading inspection by authorized AGMARK inspector.',
        priority: 'high',
        weight: 10,
        initialStatus: 'missing',
      },
    ],
  },

  Spices: {
    label: 'Spices',
    businessTypeLabel: 'Spices & Condiments MSME Exporter',
    categoryMatch: 'Spice',
    defaultProduct: {
      name: 'Premium Malabar Black Pepper & Alleppey Turmeric',
      hsCode: '0904.11.20',
      unit: 'KG',
      defaultValue: 1500000,
    },
    requirements: [
      {
        type: 'certification',
        title: 'Spices Board Registration Certificate (CRES)',
        description: 'Certificate of Registration as Exporter of Spices issued by Spices Board India.',
        priority: 'critical',
        weight: 20,
        blocksDispatch: true,
      },
      {
        type: 'certification',
        title: 'AGMARK Quality Grading Certificate',
        description: 'Mandatory export grade designation mark for Indian whole and ground spices.',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
      },
      {
        type: 'certification',
        title: 'Aflatoxin & Pesticide Residue Lab Test Report (NABL)',
        description: 'NABL-accredited test certificate confirming compliance with MRL limits.',
        priority: 'critical',
        weight: 20,
        blocksDispatch: true,
      },
      {
        type: 'certification',
        title: 'Fumigation & Phytosanitary Certificate',
        description: 'Plant quarantine clearance and pest disinfection certificate for spice consignment.',
        priority: 'high',
        weight: 15,
        blocksDispatch: true,
      },
      {
        type: 'document',
        title: 'Certificate of Origin (Preferential / Non-Preferential)',
        description: 'Authorized origin certificate for destination customs tariff preference.',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
      },
      {
        type: 'document',
        title: 'Commercial Invoice & Detailed Weight List',
        description: 'Export commercial invoice with moisture content, HS code, and net weight.',
        priority: 'high',
        weight: 15,
        blocksDispatch: true,
      },
    ],
    packagingItems: [
      {
        title: 'Double-Layer Polypropylene (PP) Woven Bags with Inner Liner',
        type: 'packaging',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Moisture-barrier food-grade inner poly liner preventing spice dampness during ocean transit.',
      },
      {
        title: 'AGMARK Grade, Lot Number & Expiry Date Stenciling',
        type: 'labelling',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Each export bag stenciled with AGMARK grade, crop year, batch lot, and origin details.',
      },
      {
        title: 'Container Desiccant Pole Placement & Relative Humidity Strips',
        type: 'packaging',
        priority: 'medium',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'High-absorption calcium chloride desiccant poles placed in 20ft container corners.',
      },
      {
        title: 'ISPM-15 Heat-Treated Wooden Palletization',
        type: 'packaging',
        priority: 'medium',
        mandatory: false,
        initialStatus: 'incomplete',
        notes: 'Pallets stamped with IPPC logo, country code, and HT treatment code.',
      },
    ],
    shipmentPrereqs: [
      {
        type: 'shipment',
        title: 'Spices Board Pre-Shipment Sample Drawing & Clearance',
        description: 'Quality sampling conducted at CFS before container stuffing clearance.',
        priority: 'critical',
        weight: 15,
        initialStatus: 'missing',
      },
      {
        type: 'shipment',
        title: 'Steam Sterilization / ETO Treatment Verification',
        description: 'Microbial treatment audit ensuring salmonella and microbial safety.',
        priority: 'high',
        weight: 10,
        initialStatus: 'missing',
      },
    ],
  },

  Textiles: {
    label: 'Textiles',
    businessTypeLabel: 'Textiles & Apparel MSME Exporter',
    categoryMatch: 'Textile',
    defaultProduct: {
      name: 'Combed Cotton Knitted Garments & Woven Fabrics',
      hsCode: '6109.10.00',
      unit: 'PCS',
      defaultValue: 2000000,
    },
    requirements: [
      {
        type: 'certification',
        title: 'AEPC / Texprocil Export Promotion Council RCMC',
        description: 'Statutory registration with Apparel Export Promotion Council or Texprocil.',
        priority: 'critical',
        weight: 20,
        blocksDispatch: true,
      },
      {
        type: 'certification',
        title: 'OEKO-TEX Standard 100 & AZO-Free Dye Lab Report',
        description: 'Accredited laboratory test certifying absence of restricted aromatic amines and harmful chemicals.',
        priority: 'critical',
        weight: 20,
        blocksDispatch: true,
      },
      {
        type: 'certification',
        title: 'GOTS Organic / Fiber Composition Certificate',
        description: 'Global Organic Textile Standard certification or verified fiber blend composition test.',
        priority: 'high',
        weight: 15,
        blocksDispatch: false,
      },
      {
        type: 'document',
        title: 'Certificate of Origin (EU REX / UK DCTS / Preferential)',
        description: 'Self-certification statement under EU REX or Chamber COO for duty-free entry.',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
      },
      {
        type: 'document',
        title: 'Commercial Invoice & Itemized Packing List',
        description: 'Garment breakdown with piece counts, style codes, carton numbers, and gross weight.',
        priority: 'high',
        weight: 15,
        blocksDispatch: true,
      },
      {
        type: 'document',
        title: 'Shipping Bill & Bill of Lading',
        description: 'Customs declaration under RoDTEP/RoSCTL export incentive schemes.',
        priority: 'high',
        weight: 15,
        blocksDispatch: true,
      },
    ],
    packagingItems: [
      {
        title: 'Moisture-Proof Polybag Inner Packaging & Silica Gel Sachets',
        type: 'packaging',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Individual garment polybags sealed with moisture-absorbing food-safe silica gel in carton.',
      },
      {
        title: 'International Garment Care, Wash & Fiber Content Labelling',
        type: 'labelling',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Labels displaying international wash symbols, fiber %, country of origin (Made in India).',
      },
      {
        title: 'Master Shipping Marks & GS1 Barcodes on 5-Ply Corrugated Cartons',
        type: 'labelling',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Outer master cartons clearly displaying destination port, gross weight, dimensions, and GS1 barcode.',
      },
      {
        title: 'Metal Detection & Needle-Free Clearance Stamp',
        type: 'packaging',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: '100% of finished cartons passed through calibrated conveyor metal detector.',
      },
    ],
    shipmentPrereqs: [
      {
        type: 'shipment',
        title: 'Final Random Inspection (FRI) AQL 2.5 Audit',
        description: 'Quality audit per ISO 2859-1 standards before shipment release from factory.',
        priority: 'critical',
        weight: 15,
        initialStatus: 'missing',
      },
      {
        type: 'shipment',
        title: 'RoSCTL / RoDTEP Scheme Export Filing Verification',
        description: 'Customs shipping bill endorsement for rebate of state and central taxes.',
        priority: 'high',
        weight: 10,
        initialStatus: 'missing',
      },
    ],
  },

  Engineering: {
    label: 'Engineering',
    businessTypeLabel: 'Engineering & Industrial Goods MSME Exporter',
    categoryMatch: 'Engineering',
    defaultProduct: {
      name: 'Precision CNC Machined Auto Components & Fasteners',
      hsCode: '8409.91.00',
      unit: 'PCS',
      defaultValue: 3500000,
    },
    requirements: [
      {
        type: 'certification',
        title: 'EEPC India Registration-cum-Membership Certificate (RCMC)',
        description: 'Mandatory Engineering Export Promotion Council membership for engineering goods exports.',
        priority: 'critical',
        weight: 20,
        blocksDispatch: true,
      },
      {
        type: 'certification',
        title: 'Mill Test Certificate (MTC EN 10204 3.1 / Spectro Analysis)',
        description: 'Chemical composition, tensile strength, and metallurgical hardness test certificate.',
        priority: 'critical',
        weight: 20,
        blocksDispatch: true,
      },
      {
        type: 'certification',
        title: 'CE Conformity Declaration & Safety Assessment',
        description: 'Conformity statement with EU Machinery Directive (2006/42/EC) and Low Voltage Directive.',
        priority: 'high',
        weight: 15,
        blocksDispatch: false,
      },
      {
        type: 'certification',
        title: 'Production Part Approval Process (PPAP Level 3 Report)',
        description: 'Dimensional verification report, control plan, and gage R&R for automotive parts.',
        priority: 'high',
        weight: 15,
        blocksDispatch: false,
      },
      {
        type: 'document',
        title: 'Certificate of Origin (CEPA / ECTA / Non-Preferential)',
        description: 'Origin certificate issued by authorized engineering chamber for preferential customs duty.',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
      },
      {
        type: 'document',
        title: 'Commercial Invoice & Detailed Technical Packing List',
        description: 'Invoice with heat numbers, drawing revision codes, net/gross weights, and HS codes.',
        priority: 'high',
        weight: 15,
        blocksDispatch: true,
      },
    ],
    packagingItems: [
      {
        title: 'Volatile Corrosion Inhibitor (VCI) Bags & Anti-Rust Film Wrapping',
        type: 'packaging',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Machined metal parts treated with rust preventive oil and sealed inside multi-layer VCI film.',
      },
      {
        title: 'ISPM-15 Certified Heavy-Duty Wooden Crates with Heat Treatment Stamp',
        type: 'packaging',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Solid wood crating bearing visible IPPC ISPM-15 heat-treated stamp for customs clearance.',
      },
      {
        title: 'Part Number, Heat Code & CE Compliance Stenciling',
        type: 'labelling',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Weather-proof stenciled labelling indicating part number, PO number, and CE mark.',
      },
      {
        title: 'Heavy Cargo Lashing, Chocking & Center-of-Gravity Plan',
        type: 'packaging',
        priority: 'medium',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Heavy components secured with steel strapping and timber chocks inside container.',
      },
    ],
    shipmentPrereqs: [
      {
        type: 'shipment',
        title: 'Pre-Shipment Dimensional & CMM Inspection Clearance',
        description: 'Coordinate Measuring Machine report verifying critical product tolerances.',
        priority: 'critical',
        weight: 15,
        initialStatus: 'missing',
      },
      {
        type: 'shipment',
        title: 'Verified Gross Mass (VGM - SOLAS) Container Certificate',
        description: 'Certified container weighing certificate required under maritime SOLAS regulations.',
        priority: 'high',
        weight: 10,
        initialStatus: 'missing',
      },
    ],
  },

  Chemicals: {
    label: 'Chemicals',
    businessTypeLabel: 'Chemicals & Pharmaceuticals MSME Exporter',
    categoryMatch: 'Chemical',
    defaultProduct: {
      name: 'Specialty Fine Chemicals & Active Pharma Ingredients (API)',
      hsCode: '2922.49.00',
      unit: 'KG',
      defaultValue: 4500000,
    },
    requirements: [
      {
        type: 'certification',
        title: 'Chemexcil / Pharmexcil Registration Certificate (RCMC)',
        description: 'Mandatory export promotion council registration for chemical and pharmaceutical exports.',
        priority: 'critical',
        weight: 20,
        blocksDispatch: true,
      },
      {
        type: 'certification',
        title: 'Batch Certificate of Analysis (COA) & Assay Report',
        description: 'Quality laboratory assay report verifying chemical purity, moisture, and impurity limits.',
        priority: 'critical',
        weight: 20,
        blocksDispatch: true,
      },
      {
        type: 'certification',
        title: '16-Section GHS Safety Data Sheet (SDS / MSDS)',
        description: 'Globally Harmonized System safety data sheet in destination language.',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
      },
      {
        type: 'certification',
        title: 'IMO / IATA Dangerous Goods (DG) or Non-DG Declaration',
        description: 'Certified hazardous material classification document for maritime and air carriage.',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
      },
      {
        type: 'document',
        title: 'Certificate of Origin (CoO)',
        description: 'Authorized origin certificate verifying Indian synthesis / formulation value addition.',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
      },
      {
        type: 'document',
        title: 'Commercial Invoice & Batch-Numbered Packing List',
        description: 'Commercial invoice specifying CAS number, batch numbers, UN code, and packing groups.',
        priority: 'high',
        weight: 15,
        blocksDispatch: true,
      },
    ],
    packagingItems: [
      {
        title: 'UN-Certified Packaging (HDPE Drums / Steel Drums / IBC Containers)',
        type: 'packaging',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Drums bearing embossed UN specification code for dangerous or non-dangerous cargo.',
      },
      {
        title: 'GHS Hazard Warning Diamond Labels & 24/7 Emergency Placards',
        type: 'labelling',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Labels displaying UN number, Proper Shipping Name (PSN), and emergency response phone number.',
      },
      {
        title: 'Tamper-Evident Anti-Leak Bung Sealing & Torque Verification',
        type: 'packaging',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Drum closures torqued to manufacturer specification with crimped aluminum tamper caps.',
      },
      {
        title: 'Secondary Spill Containment Pallets & Chemical Neutralizer Kits',
        type: 'packaging',
        priority: 'medium',
        mandatory: false,
        initialStatus: 'incomplete',
        notes: 'Spill containment bunds and absorbent pads positioned for hazardous liquid transit.',
      },
    ],
    shipmentPrereqs: [
      {
        type: 'shipment',
        title: 'Port Fire & Hazardous Material (HAZMAT) Terminal Clearance',
        description: 'Port authority approval for container gate-in and hazardous cargo stowage.',
        priority: 'critical',
        weight: 15,
        initialStatus: 'missing',
      },
      {
        type: 'shipment',
        title: 'Shipping Line Dangerous Goods Booking Acceptance',
        description: 'Carrier DGD approval confirmation before container loading aboard vessel.',
        priority: 'high',
        weight: 10,
        initialStatus: 'missing',
      },
    ],
  },

  Ceramics: {
    label: 'Ceramics',
    businessTypeLabel: 'Ceramics & Sanitaryware MSME Exporter',
    categoryMatch: 'Ceramic',
    defaultProduct: {
      name: 'Glazed Porcelain & Vitrified Floor Tiles (Morbi Cluster)',
      hsCode: '6907.21.00',
      unit: 'SQM',
      defaultValue: 1800000,
    },
    requirements: [
      {
        type: 'certification',
        title: 'CAPEXIL Registration-cum-Membership Certificate (RCMC)',
        description: 'Chemicals and Allied Products Export Promotion Council registration for ceramic products.',
        priority: 'critical',
        weight: 20,
        blocksDispatch: true,
      },
      {
        type: 'certification',
        title: 'ISO 10545 Mechanical Strength & Water Absorption Test Report',
        description: 'Laboratory physical testing verifying modulus of rupture, breaking strength, and water absorption <0.5%.',
        priority: 'critical',
        weight: 20,
        blocksDispatch: true,
      },
      {
        type: 'document',
        title: 'Certificate of Origin (CEPA / Non-Preferential)',
        description: 'Origin certificate issued by authorized Chamber for Gulf and international ports.',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
      },
      {
        type: 'document',
        title: 'Commercial Invoice & Detailed Box Packing List',
        description: 'Export invoice declaring coverage area in SQM, tile dimensions, shade number, and carton tally.',
        priority: 'high',
        weight: 15,
        blocksDispatch: true,
      },
      {
        type: 'document',
        title: 'Shipping Bill & Bill of Lading',
        description: 'Customs declaration under duty drawback and container ocean carriage document.',
        priority: 'high',
        weight: 15,
        blocksDispatch: true,
      },
    ],
    packagingItems: [
      {
        title: 'Corrugated Carton Packaging with High-Density Foam Corner Protectors',
        type: 'packaging',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Individual tiles packed with paper interleaving and shock-resistant reinforced cardboard edges.',
      },
      {
        title: 'ISPM-15 Heat-Treated Heavy Pallets with Plastic Stretch Shrink-Wrap',
        type: 'packaging',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Heavy-duty euro/standard pallets wrapped with 23-micron stretch film and horizontal polyester banding.',
      },
      {
        title: 'Fragile Handle-with-Care & Upward Orientation Arrow Markings',
        type: 'labelling',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Each pallet labelled with international fragile symbols, max stacking height, and net weight.',
      },
      {
        title: 'Inflatable Container Dunnage Airbags & Wooden Bulkhead Bracing',
        type: 'packaging',
        priority: 'medium',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Dunnage airbags inserted between pallet rows to prevent cargo shifting during heavy sea swell.',
      },
    ],
    shipmentPrereqs: [
      {
        type: 'shipment',
        title: 'Pre-Stuffing Drop Test & Carton Crush Resistance Audit',
        description: 'Factory QA check confirming zero edge chipped tiles prior to container loading.',
        priority: 'critical',
        weight: 15,
        initialStatus: 'missing',
      },
      {
        type: 'shipment',
        title: 'Port Weighbridge Tare & Gross Weight Verification',
        description: 'Accredited weight tally slip verifying container axle load limits at port gate.',
        priority: 'high',
        weight: 10,
        initialStatus: 'missing',
      },
    ],
  },

  'Gems & Jewellery': {
    label: 'Gems & Jewellery',
    businessTypeLabel: 'Gems & Jewellery MSME Exporter',
    categoryMatch: 'Jewel',
    defaultProduct: {
      name: 'Hallmarked Gold Jewellery & Certified Diamond Articles',
      hsCode: '7113.19.10',
      unit: 'GM',
      defaultValue: 6000000,
    },
    requirements: [
      {
        type: 'certification',
        title: 'GJEPC Registration-cum-Membership Certificate (RCMC)',
        description: 'Gem & Jewellery Export Promotion Council registration for precious metals and jewellery exports.',
        priority: 'critical',
        weight: 20,
        blocksDispatch: true,
      },
      {
        type: 'certification',
        title: 'BIS Hallmark Certificate & Gold Purity Assaying Report',
        description: 'Bureau of Indian Standards hallmarking with 6-digit HUID for gold purity verification.',
        priority: 'critical',
        weight: 20,
        blocksDispatch: true,
      },
      {
        type: 'certification',
        title: 'Kimberley Process Certificate (KPCS) for Diamonds',
        description: 'Conflict-free certification issued by authorized body for natural and lab-grown stones.',
        priority: 'high',
        weight: 15,
        blocksDispatch: true,
      },
      {
        type: 'document',
        title: 'Customs Valuation & Government Approved Valuer Certificate',
        description: 'Formal gemological appraisal declaring precious metal weight, stone purity, and value.',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
      },
      {
        type: 'document',
        title: 'Certificate of Origin (CEPA / ECTA / CoO)',
        description: 'Certificate of origin under India-UAE CEPA or Chamber for duty-free jewelry clearance.',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
      },
      {
        type: 'document',
        title: 'Commercial Invoice & Sealed Parcel Tally',
        description: 'Export invoice itemizing gross weight, net metal weight, stone weight in carats, and making charges.',
        priority: 'high',
        weight: 15,
        blocksDispatch: true,
      },
    ],
    packagingItems: [
      {
        title: 'Tamper-Evident Numbered Security Pouch & Parcel Sealing',
        type: 'packaging',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Precious articles packed in serialized tamper-evident security bags with void tape seals.',
      },
      {
        title: 'Hallmark HUID, Caratage & Gross/Net Weight Verification Tags',
        type: 'labelling',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Each individual jewelry item tagged with 6-digit HUID, 22K/18K purity, and weight breakdown.',
      },
      {
        title: 'High-Security Steel Strongbox / Vault Container for Air Cargo',
        type: 'packaging',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Armored vault-grade container with dual key/electronic seal for air transit from Mumbai/Surat.',
      },
      {
        title: 'Sealed Cargo Insurance Declared Value & Customs Lock Label',
        type: 'labelling',
        priority: 'medium',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Customs lead seal and insurer declared transit value tag attached to master strongbox.',
      },
    ],
    shipmentPrereqs: [
      {
        type: 'shipment',
        title: 'Customs Bonded Precious Cargo Vault Clearance (BVC / Bharat Diamond Bourse)',
        description: 'Export examination and sealing by Appraising Officer at designated precious cargo terminal.',
        priority: 'critical',
        weight: 15,
        initialStatus: 'missing',
      },
      {
        type: 'shipment',
        title: 'Armed Security Transit & Air Cargo Gate Escort',
        description: 'Dedicated armored vehicle transit with armed security escort from vault to tarmac.',
        priority: 'high',
        weight: 10,
        initialStatus: 'missing',
      },
    ],
  },

  Diamonds: {
    label: 'Diamonds',
    businessTypeLabel: 'Diamond & Precious Stones MSME Exporter',
    categoryMatch: 'Diamond',
    defaultProduct: {
      name: 'Cut & Polished Diamonds (Natural / Lab-Grown)',
      hsCode: '7102.39.00',
      unit: 'CT',
      defaultValue: 5000000,
    },
    requirements: [
      {
        type: 'certification',
        title: 'Kimberley Process Certificate (KPC)',
        description: 'Mandatory Kimberley Process certification for rough and polished diamond exports.',
        priority: 'critical',
        weight: 25,
        blocksDispatch: true,
      },
      {
        type: 'certification',
        title: 'GIA / IGI Diamond Grading Report',
        description: 'Gemological grading report from GIA or IGI for each diamond lot (4Cs verification).',
        priority: 'critical',
        weight: 20,
        blocksDispatch: true,
      },
      {
        type: 'document',
        title: 'Certificate of Origin (CoO)',
        description: 'Certificate of origin issued by GJEPC (Gem & Jewellery Export Promotion Council).',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
      },
      {
        type: 'document',
        title: 'Customs Valuation Certificate',
        description: 'Government-approved valuation of diamond consignment for customs declaration.',
        priority: 'high',
        weight: 10,
        blocksDispatch: true,
      },
      {
        type: 'document',
        title: 'GJEPC Membership & Export Authorization',
        description: 'Active membership of Gem & Jewellery Export Promotion Council for diamond export license.',
        priority: 'high',
        weight: 10,
        blocksDispatch: false,
      },
    ],
    packagingItems: [
      {
        title: 'Tamper-Proof Sealed Diamond Parcel Packaging',
        type: 'packaging',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Diamonds packed in tamper-evident sealed parcels with unique serial numbers.',
      },
      {
        title: 'Individual Stone Identification & Barcode Labels',
        type: 'labelling',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Each parcel labelled with carat weight, clarity, cut, color grade, and barcode.',
      },
      {
        title: 'High-Security Vault Packaging for Air Transit',
        type: 'packaging',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Secure vault-grade container for high-value diamond air cargo.',
      },
      {
        title: 'Insurance Documentation & Declared Value Tag',
        type: 'labelling',
        priority: 'medium',
        mandatory: false,
        initialStatus: 'incomplete',
        notes: 'Declared value tag attached to each parcel for cargo insurance purposes.',
      },
    ],
    shipmentPrereqs: [
      {
        type: 'shipment',
        title: 'Customs Bonded Warehouse Clearance',
        description: 'Export clearance from customs bonded warehouse at designated diamond trading zone.',
        priority: 'critical',
        weight: 15,
        initialStatus: 'missing',
      },
      {
        type: 'shipment',
        title: 'Armed Security Escort Arrangement',
        description: 'Secure transit with armed escort from vault to airport for high-value diamond shipments.',
        priority: 'high',
        weight: 10,
        initialStatus: 'missing',
      },
    ],
  },

  Gold: {
    label: 'Gold',
    businessTypeLabel: 'Gold & Precious Metals MSME Exporter',
    categoryMatch: 'Gold',
    defaultProduct: {
      name: 'Gold Bars & Jewellery (Hallmarked 22K / 24K)',
      hsCode: '7108.13.00',
      unit: 'GM',
      defaultValue: 8000000,
    },
    requirements: [
      {
        type: 'certification',
        title: 'BIS Hallmark Certificate',
        description: 'Bureau of Indian Standards hallmarking for gold purity (22K/24K) verification.',
        priority: 'critical',
        weight: 20,
        blocksDispatch: true,
      },
      {
        type: 'certification',
        title: 'Assay Report (Gold Purity Test)',
        description: 'Independent assay laboratory report confirming gold fineness and purity.',
        priority: 'critical',
        weight: 20,
        blocksDispatch: true,
      },
      {
        type: 'document',
        title: 'Certificate of Origin (CoO)',
        description: 'Certificate of origin issued by authorized Chamber of Commerce or GJEPC.',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
      },
      {
        type: 'document',
        title: 'RBI Authorization for Gold Export',
        description: 'Reserve Bank of India authorization/no-objection for export of gold and precious metals.',
        priority: 'critical',
        weight: 15,
        blocksDispatch: true,
      },
      {
        type: 'document',
        title: 'Customs Declaration & Valuation Certificate',
        description: 'Customs export declaration with certified valuation for gold consignment.',
        priority: 'high',
        weight: 10,
        blocksDispatch: true,
      },
    ],
    packagingItems: [
      {
        title: 'Tamper-Proof Sealed Gold Bar Packaging',
        type: 'packaging',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Gold bars sealed in tamper-evident packaging with unique serial identifiers.',
      },
      {
        title: 'Hallmark & Purity Stamp Verification Labels',
        type: 'labelling',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Each item labelled with BIS hallmark, purity (KT), weight (grams), and assay certificate number.',
      },
      {
        title: 'High-Security Vault Container for Air Transit',
        type: 'packaging',
        priority: 'high',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Armored vault-grade container required for high-value gold air cargo.',
      },
      {
        title: 'Insurance Declared Value & Customs Seal',
        type: 'labelling',
        priority: 'medium',
        mandatory: true,
        initialStatus: 'incomplete',
        notes: 'Customs seal and declared value label applied to each secure parcel.',
      },
    ],
    shipmentPrereqs: [
      {
        type: 'shipment',
        title: 'RBI Export Compliance Clearance',
        description: 'RBI compliance clearance for gold export under FEMA regulations.',
        priority: 'critical',
        weight: 15,
        initialStatus: 'missing',
      },
      {
        type: 'shipment',
        title: 'Armed Security & Vault-to-Airport Logistics',
        description: 'Secure armed transit from vault facility to airport cargo terminal.',
        priority: 'high',
        weight: 10,
        initialStatus: 'missing',
      },
    ],
  },
};

/**
 * GSTIN format: 2 digits (state) + 5 alpha (PAN) + 4 digits + 1 alpha + 1 alphanumeric + Z + 1 alphanumeric
 * Example: 27AAACP1234F1Z5
 */
export const GSTIN_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/;

/**
 * IEC Code format: exactly 10 digits
 * Example: 0301099882
 */
export const IEC_REGEX = /^\d{10}$/;

export function validateGSTIN(gstin: string): { valid: boolean; error?: string } {
  const cleaned = gstin.trim().toUpperCase();
  if (!cleaned) return { valid: false, error: 'GSTIN is required.' };
  if (cleaned.length !== 15) return { valid: false, error: 'GSTIN must be exactly 15 characters.' };
  if (!GSTIN_REGEX.test(cleaned)) {
    return {
      valid: false,
      error: 'Invalid GSTIN format. Expected: 2 digits + 5 letters (PAN) + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric (e.g. 27AAACP1234F1Z5).',
    };
  }
  return { valid: true };
}

export function validateIEC(iec: string): { valid: boolean; error?: string } {
  const cleaned = iec.trim();
  if (!cleaned) return { valid: false, error: 'IEC Code is required.' };
  if (cleaned.length !== 10) return { valid: false, error: 'IEC Code must be exactly 10 digits.' };
  if (!IEC_REGEX.test(cleaned)) {
    return { valid: false, error: 'Invalid IEC format. Must be exactly 10 digits (e.g. 0301099882).' };
  }
  return { valid: true };
}
