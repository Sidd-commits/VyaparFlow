import { prisma } from './lib/prisma';

async function main() {
  const users = await prisma.user.findMany({
    include: {
      businesses: {
        include: {
          products: {
            include: {
              destinations: {
                include: {
                  country: true,
                },
              },
            },
          },
        },
      },
    },
  });

  console.log('Total users:', users.length);
  for (const u of users) {
    console.log(`\nUser: ${u.name} (${u.email}) [ID: ${u.id}]`);
    if (!u.businesses || u.businesses.length === 0) {
      console.log('  No businesses');
    } else {
      for (const b of u.businesses) {
        console.log(`  Business: ${b.displayName} | Legal: ${b.legalName} [ID: ${b.id}]`);
        console.log(`  Location: ${b.location}, ${b.city}, ${b.state}`);
        console.log(`  GST: ${b.gstStatus} | IEC: ${b.iecStatus}`);
        for (const p of b.products) {
          console.log(`    Product: ${p.name} (HS: ${p.hsCode}) [ID: ${p.id}]`);
          for (const d of p.destinations) {
            console.log(`      Destination: ${d.country.name} (${d.country.isoCode}) [ID: ${d.id}]`);
          }
        }
      }
    }
  }
}

main().finally(() => prisma.$disconnect());
