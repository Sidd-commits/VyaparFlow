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

  const cleanName = userName || userEmail.split('@')[0] || 'Exporter';
  const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

  if (!business) {
    business = await prisma.business.create({
      data: {
        ownerUserId: userId,
        legalName: `${formattedName} Exports Pvt Ltd`,
        displayName: `${formattedName} Exports`,
        businessType: 'MSME Exporter',
        location: '',
        city: 'Mumbai',
        state: 'Maharashtra',
        gstStatus: 'Pending Onboarding',
        iecStatus: 'Pending Onboarding',
        profileCompletion: 20,
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

  return business;
}

