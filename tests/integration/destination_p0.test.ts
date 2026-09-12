import assert from 'assert';
import { prisma } from '../../lib/prisma';
import { syncBusinessRequirements, getTariffIntelligence } from '../../lib/services/applicability';
import { calculateReadinessScore } from '../../lib/services/readiness';

export async function runDestinationP0Test() {
  console.log('================================================================');
  console.log('🧪 RUNNING INTEGRATION TEST: P0 DESTINATION DATA CONNECTIVITY');
  console.log('================================================================');

  const timestamp = Date.now();
  const emailA = `netherlands.exporter.${timestamp}@agriflow.nl`;
  const emailB = `japan.exporter.${timestamp}@agriflow.jp`;

  // 1. Create User A with Netherlands (NL)
  const userA = await prisma.user.create({
    data: {
      email: emailA,
      name: 'Roop Agro Processing',
      passwordHash: 'secret123',
      role: 'MSME',
    },
  });

  let countryNL = await prisma.country.findFirst({ where: { isoCode: 'NL' } });
  if (!countryNL) {
    countryNL = await prisma.country.create({
      data: { name: 'Netherlands', isoCode: 'NL', active: true },
    });
  }

  const bizA = await prisma.business.create({
    data: {
      ownerUserId: userA.id,
      displayName: 'Netherlands Test Exports',
      legalName: 'Roop Agro Processing Pvt Ltd',
      businessType: 'Food & Agricultural Goods (Processed Foods, Spices, Grains)',
      location: 'Plot 42, Export Processing Zone',
      city: 'Mumbai',
      state: 'Maharashtra',
      gstStatus: 'Active (27AAACP1234F1Z5)',
      iecStatus: 'Active (0301099882)',
      profileCompletion: 85,
    },
  });

  let catFood = await prisma.productCategory.findFirst({ where: { name: { contains: 'Food' } } });
  if (!catFood) {
    catFood = await prisma.productCategory.create({ data: { name: 'Food & Processed Agri' } });
  }

  const prodA = await prisma.product.create({
    data: {
      businessId: bizA.id,
      categoryId: catFood.id,
      name: 'Processed Food Products (Ready-to-Eat / Canned Mango Pulp)',
      hsCode: '2008.99.11',
      unit: 'KG',
      defaultValue: 1500000,
    },
  });

  const pcA = await prisma.productCountry.create({
    data: {
      productId: prodA.id,
      countryId: countryNL.id,
    },
  });

  await syncBusinessRequirements(bizA.id);
  const readinessA = await calculateReadinessScore(pcA.id);
  const reqsA = await prisma.requirement.findMany({ where: { productCountryId: pcA.id } });
  assert(reqsA.length > 0, 'User A must have requirements');

  const tariffA = getTariffIntelligence(prodA.hsCode, prodA.name, 'NL', 'Netherlands');
  assert(tariffA.corridorName.includes('Netherlands'), 'Tariff must be Netherlands');
  assert(!tariffA.corridorName.includes('United Arab Emirates'), 'Tariff must NOT be UAE');

  console.log('✅ User A Netherlands corridor connectivity verified.');

  // 2. Create User B with Japan (JP)
  const userB = await prisma.user.create({
    data: {
      email: emailB,
      name: 'Kenji Agro Exports',
      passwordHash: 'secret123',
      role: 'MSME',
    },
  });

  let countryJP = await prisma.country.findFirst({ where: { isoCode: 'JP' } });
  if (!countryJP) {
    countryJP = await prisma.country.create({
      data: { name: 'Japan', isoCode: 'JP', active: true },
    });
  }

  const bizB = await prisma.business.create({
    data: {
      ownerUserId: userB.id,
      displayName: 'Kenji Premium Mango Exports',
      legalName: 'Kenji Agro Processing India Pvt Ltd',
      businessType: 'Food & Agricultural Goods (Processed Foods, Spices, Grains)',
      location: 'MIDC Industrial Area',
      city: 'Pune',
      state: 'Maharashtra',
      gstStatus: 'Active (27AAACP1234F1Z5)',
      iecStatus: 'Active (0301099882)',
      profileCompletion: 90,
    },
  });

  const prodB = await prisma.product.create({
    data: {
      businessId: bizB.id,
      categoryId: catFood.id,
      name: 'Processed Food Products (Ready-to-Eat / Canned Mango Pulp)',
      hsCode: '2008.99.11',
      unit: 'KG',
      defaultValue: 1800000,
    },
  });

  const pcB = await prisma.productCountry.create({
    data: {
      productId: prodB.id,
      countryId: countryJP.id,
    },
  });

  await syncBusinessRequirements(bizB.id);
  const tariffB = getTariffIntelligence(prodB.hsCode, prodB.name, 'JP', 'Japan');
  assert(tariffB.corridorName.includes('Japan'), 'Tariff must be Japan');
  assert(tariffB.tradeAgreement.includes('IJCEPA') || tariffB.tradeAgreement.includes('Japan'), 'Tariff agreement must be Japan');

  console.log('✅ User B Japan corridor connectivity verified.');
  console.log('✅ ALL DESTINATION P0 INTEGRATION TESTS PASSED!');
}

if (require.main === module) {
  runDestinationP0Test().catch((err) => {
    console.error('TEST FAILED:', err);
    process.exit(1);
  });
}
