import { prisma } from '../../lib/prisma';

export async function inspectDatabase() {
  console.log('=== VYAPARFLOW DATABASE INSPECTOR ===\n');

  const users = await prisma.user.findMany({
    include: {
      businesses: {
        include: {
          products: {
            include: {
              destinations: {
                include: { country: true },
              },
            },
          },
        },
      },
      providers: true,
    },
  });

  console.log(`Total Users in DB: ${users.length}\n`);

  for (const u of users) {
    console.log(`[USER] ${u.name} <${u.email}> (${u.role}) ID: ${u.id}`);
    for (const b of u.businesses) {
      console.log(`  └─ [BUSINESS] ${b.displayName} | Legal: ${b.legalName} (${b.businessType})`);
      console.log(`     Location: ${b.city}, ${b.state} | GST: ${b.gstStatus} | IEC: ${b.iecStatus}`);
      for (const p of b.products) {
        const dests = p.destinations.map((d) => `${d.country?.name} (${d.country?.isoCode})`).join(', ');
        console.log(`     └─ [PRODUCT] ${p.name} (HS: ${p.hsCode}) → Target Corridors: [${dests || 'None'}]`);
      }
    }
  }

  console.log('\n=== END INSPECTION ===');
}

if (require.main === module) {
  inspectDatabase().finally(() => prisma.$disconnect());
}
