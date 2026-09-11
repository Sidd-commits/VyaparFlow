import { prisma } from '@/lib/prisma';

export async function ensureMSMEBusiness(userId: string, userName: string, userEmail: string) {
  // Check if business already exists
  let business = await prisma.business.findFirst({
    where: { ownerUserId: userId },
    include: {
      products: {
        include: {
          destinations: {
            include: { country: true, requirements: true },
          },
        },
      },
      shipments: true,
    },
  });

  const cleanName = userName || userEmail.split('@')[0] || 'Bharat';
  const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

  if (!business) {
    business = await prisma.business.create({
      data: {
        ownerUserId: userId,
        legalName: `${formattedName} Agro Processing Pvt Ltd`,
        displayName: `${formattedName} Quality Agro Exporters`,
        businessType: 'Processed Foods & Agro Products MSME Exporter',
        location: 'Plot 14, Export Processing Zone',
        city: 'Mumbai',
        state: 'Maharashtra',
        gstStatus: 'Active (27AAACP1234F1Z5)',
        iecStatus: 'Active (0301099882)',
        profileCompletion: 85,
      },
      include: {
        products: {
          include: {
            destinations: {
              include: { country: true, requirements: true },
            },
          },
        },
        shipments: true,
      },
    });
  }

  // Ensure ProductCategory and Country exist
  let category = await prisma.productCategory.findFirst({
    where: { name: { contains: 'Food' } },
  });
  if (!category) {
    category = await prisma.productCategory.create({
      data: {
        name: 'Food & Processed Foods',
        description: 'Processed agricultural food items, mango pulp, spices, and packaged edibles.',
      },
    });
  }

  let country = await prisma.country.findFirst({
    where: { isoCode: 'AE' },
  });
  if (!country) {
    country = await prisma.country.create({
      data: {
        name: 'United Arab Emirates',
        isoCode: 'AE',
      },
    });
  }

  // Ensure Product exists
  let product = business.products[0];
  if (!product) {
    product = await prisma.product.create({
      data: {
        businessId: business.id,
        categoryId: category.id,
        name: 'Processed Food Products (Ready-to-Eat / Canned Mango Pulp)',
        hsCode: '2008.99.11',
        unit: 'KG',
        defaultValue: 1500000,
      },
      include: {
        destinations: {
          include: { country: true, requirements: true },
        },
      },
    });
  }

  // Ensure ProductCountry destination exists
  let destination = product.destinations?.[0];
  if (!destination) {
    destination = await prisma.productCountry.create({
      data: {
        productId: product.id,
        countryId: country.id,
      },
      include: {
        country: true,
        requirements: true,
      },
    });
  }

  // Ensure initial compliance requirements exist
  const existingReqsCount = await prisma.requirement.count({
    where: { productCountryId: destination.id },
  });

  if (existingReqsCount === 0) {
    const defaultRequirements = [
      {
        title: 'GSTIN Registration Certificate',
        type: 'document',
        priority: 'critical',
        status: 'verified',
        weight: 15.0,
        reason: 'Compulsory GST identification number registered on GSTN portal.',
      },
      {
        title: 'DGFT Import Export Code (IEC)',
        type: 'document',
        priority: 'critical',
        status: 'verified',
        weight: 15.0,
        reason: 'Authorized 10-digit DGFT exporter code for customs clearance.',
      },
      {
        title: 'APEDA Registration-cum-Membership Certificate (RCMC)',
        type: 'certification',
        priority: 'critical',
        status: 'verified',
        weight: 20.0,
        reason: 'Mandatory export promotion council registration for agro/food consignments.',
      },
      {
        title: 'Phytosanitary & Food Safety Lab Test Report',
        type: 'certification',
        priority: 'critical',
        status: 'verified',
        weight: 20.0,
        reason: 'Certified NABL laboratory analysis verifying pesticide residue compliance.',
      },
      {
        title: 'Commercial Invoice & Detailed Packing List',
        type: 'document',
        priority: 'high',
        status: 'verified',
        weight: 10.0,
        reason: 'Itemized export invoice with CIF Dubai valuation and container packaging breakdown.',
      },
      {
        title: 'Certificate of Origin (Non-Preferential / CEPA)',
        type: 'document',
        priority: 'high',
        status: 'under_review',
        weight: 10.0,
        reason: 'Chamber of Commerce documentation verifying Indian manufactured origin for duty concession.',
      },
      {
        title: 'Export Marine Cargo Insurance Policy',
        type: 'shipment',
        priority: 'medium',
        status: 'under_review',
        weight: 10.0,
        reason: 'ICC (A) comprehensive all-risk marine cargo transit coverage.',
      },
    ];

    for (const req of defaultRequirements) {
      await prisma.requirement.create({
        data: {
          productCountryId: destination.id,
          title: req.title,
          type: req.type,
          priority: req.priority,
          status: req.status,
          weight: req.weight,
          reason: req.reason,
          completedAt: req.status === 'verified' ? new Date() : null,
        },
      });
    }
  }

  // Ensure Active Shipment exists
  let shipment = await prisma.shipment.findFirst({
    where: { businessId: business.id },
  });

  if (!shipment) {
    const defaultProvider = await prisma.provider.findFirst({
      where: { type: 'FREIGHT' },
    });

    shipment = await prisma.shipment.create({
      data: {
        shipmentNumber: `SHP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        businessId: business.id,
        productId: product.id,
        destinationCountryId: country.id,
        destinationCity: 'Dubai (Jebel Ali Port)',
        value: 1500000,
        currency: 'INR',
        quantity: 5000,
        weight: 5400,
        packages: 250,
        mode: 'Sea (FCL 20ft Reefer Container)',
        status: 'Export Customs',
        eta: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        trackingEvents: {
          create: [
            {
              status: 'Origin Factory Dispatch',
              location: 'MSME Manufacturing Plant & Warehouse',
              note: 'Quality inspection passed. Loaded into refrigerated reefer truck.',
            },
            {
              status: 'Arrived at JNPT Nhava Sheva Port',
              location: 'JNPT Port CFS Yard, Navi Mumbai',
              note: 'Container gated in at terminal. Shipping bill filed on ICEGATE.',
            },
            {
              status: 'Customs Clearance Assessment',
              location: 'Nhava Sheva Customs Maritime Desk',
              note: 'Phytosanitary & APEDA documents under review for Let Export Order (LEO).',
            },
          ],
        },
        ...(defaultProvider
          ? {
              quotes: {
                create: [
                  {
                    providerId: defaultProvider.id,
                    mode: 'Sea Freight',
                    cost: 142000,
                    currency: 'INR',
                    transitMin: 5,
                    transitMax: 7,
                    inclusions: 'Ocean Freight, Port Handling, Reefer Plug-in, B/L Release',
                    exclusions: 'Destination Customs Duties in Dubai',
                    isSelected: true,
                  },
                ],
              },
            }
          : {}),
      },
    });
  }

  return business;
}
