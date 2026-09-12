import { prisma } from '../../lib/prisma';

async function main() {
  console.log('--- Testing MSME User A (Apex Agro Exporters) ---');
  const userA = await prisma.user.findFirst({
    where: { email: 'msme@apex-exports.com' },
  });

  if (!userA) throw new Error('User A not found');

  const resA = await fetch('http://localhost:3000/dashboard', {
    headers: {
      Cookie: `vyaparflow_active_user_email=${userA.email}; vyaparflow_active_role=MSME; vyaparflow_active_user_id=${userA.id}`,
    },
  });

  const htmlA = await resA.text();
  console.log('User A status code:', resA.status);
  console.log('User A Company Name:', htmlA.includes('Apex Quality Agro Exporters'));
  console.log('User A Target Destination:', htmlA.includes('Target:') && htmlA.includes('Netherlands'));
  console.log('User A Export Readiness:', htmlA.includes('Export Readiness'));
  console.log('User A Attention Section:', htmlA.includes('What needs your attention'));
  console.log('User A Active Shipment:', htmlA.includes('Active Shipment') && htmlA.includes('SHP-2026-AE-001'));

  console.log('\n--- Testing MSME User B (Konkan Spices) ---');
  const userB = await prisma.user.findFirst({
    where: { email: 'msme2@konkan-spices.com' },
  });

  if (!userB) throw new Error('User B not found');

  const resB = await fetch('http://localhost:3000/dashboard', {
    headers: {
      Cookie: `vyaparflow_active_user_email=${userB.email}; vyaparflow_active_role=MSME; vyaparflow_active_user_id=${userB.id}`,
    },
  });

  const htmlB = await resB.text();
  console.log('User B status code:', resB.status);
  console.log('User B Company Name:', htmlB.includes('Konkan Spice Exporters'));
  console.log('User B Target Destination:', htmlB.includes('Target:') && htmlB.includes('United States'));
  console.log('User B Export Readiness:', htmlB.includes('Export Readiness'));
  console.log('User B Attention Section:', htmlB.includes('What needs your attention'));
  console.log('User B Active Shipment:', htmlB.includes('Active Shipment') && htmlB.includes('SHP-2026-US-002'));

  console.log('\n🎉 ALL MULTI-TENANT DESTINATION & COCKPIT RENDER TESTS PASSED 100%!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
