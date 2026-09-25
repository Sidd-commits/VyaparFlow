import { prisma } from '@/lib/prisma';

export async function ensureProviderProfile(
  userId: string,
  userEmail: string,
  userName: string,
  defaultType?: string
) {
  // Check if provider record is already linked to this userId
  let provider = await prisma.provider.findFirst({
    where: { userId },
    include: {
      providerTasks: true,
      quotes: true,
    },
  });

  const emailLower = userEmail.toLowerCase();
  const inferredType =
    defaultType ||
    (emailLower.includes('freight') || emailLower.includes('logistics') || emailLower.includes('cargo')
      ? 'FREIGHT'
      : emailLower.includes('lab') || emailLower.includes('cert') || emailLower.includes('quarantine')
      ? 'CERTIFICATION'
      : emailLower.includes('cha') || emailLower.includes('customs')
      ? 'CUSTOMS_CHA'
      : emailLower.includes('insur')
      ? 'INSURANCE'
      : 'FREIGHT');

  const cleanName = userName || userEmail.split('@')[0] || 'Partner';
  const formattedName =
    cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

  if (!provider) {
    // Check if there's an unlinked provider with matching email or name
    provider = await prisma.provider.findFirst({
      where: {
        OR: [
          { contactEmail: { equals: userEmail, mode: 'insensitive' } },
          { name: { contains: formattedName, mode: 'insensitive' } },
        ],
      },
      include: {
        providerTasks: true,
        quotes: true,
      },
    });

    if (provider) {
      provider = await prisma.provider.update({
        where: { id: provider.id },
        data: { userId },
        include: {
          providerTasks: true,
          quotes: true,
        },
      });
    } else {
      // Create new provider entity
      const companyName =
        inferredType === 'FREIGHT'
          ? `${formattedName} Maritime & Air Logistics`
          : inferredType === 'CERTIFICATION'
          ? `${formattedName} Quality & NABL Testing Labs`
          : inferredType === 'CUSTOMS_CHA'
          ? `${formattedName} Customs House Agency (CHA)`
          : `${formattedName} Marine Cargo Insurance`;

      provider = await prisma.provider.create({
        data: {
          userId,
          name: companyName,
          type: inferredType,
          serviceArea: 'Western Ports, JNPT, Mundra & Global Corridors',
          contactEmail: userEmail,
          active: true,
        },
        include: {
          providerTasks: true,
          quotes: true,
        },
      });
    }
  }

  // Ensure baseline sample provider tasks exist so queue is always rich and interactive
  await seedProviderTasksIfSparse();

  return provider;
}

export async function seedProviderTasksIfSparse() {
  try {
    const taskCount = await prisma.providerTask.count();
    if (taskCount >= 4) return;

    // Find all providers
    const labs = await prisma.provider.findMany({ where: { type: 'CERTIFICATION' } });
    const chas = await prisma.provider.findMany({ where: { type: 'CUSTOMS_CHA' } });
    const freights = await prisma.provider.findMany({ where: { type: 'FREIGHT' } });

    const defaultLab = labs[0] || (await prisma.provider.findFirst({ where: { type: 'CERTIFICATION' } }));
    const defaultCHA = chas[0] || (await prisma.provider.findFirst({ where: { type: 'CUSTOMS_CHA' } }));
    const defaultFreight = freights[0] || (await prisma.provider.findFirst({ where: { type: 'FREIGHT' } }));

    // Find requirements needing review
    const underReviewReqs = await prisma.requirement.findMany({
      where: {
        OR: [
          { status: 'under_review' },
          { status: 'missing' },
          { type: 'certification' },
        ],
      },
      include: {
        productCountry: {
          include: {
            product: { include: { business: true } },
            country: true,
          },
        },
        documents: true,
      },
      take: 6,
    });

    const shipments = await prisma.shipment.findMany({
      include: { business: true, product: true, destinationCountry: true },
      take: 3,
    });

    // 1. Assign Lab / Certification Tasks
    for (const req of underReviewReqs) {
      if (defaultLab && req.type === 'certification') {
        const existing = await prisma.providerTask.findFirst({
          where: { requirementId: req.id, providerId: defaultLab.id },
        });

        if (!existing) {
          const pt = await prisma.providerTask.create({
            data: {
              providerId: defaultLab.id,
              requirementId: req.id,
              type: 'CERTIFICATION',
              status: req.status === 'verified' ? 'completed' : 'in_progress',
              notes: `NABL laboratory audit & compliance verification required for ${req.title}.`,
              assignedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          });

          await prisma.certificationRequest.create({
            data: {
              requirementId: req.id,
              providerTaskId: pt.id,
              status: req.status === 'verified' ? 'completed' : 'in_progress',
            },
          }).catch(() => {});
        }
      }

      // 2. Assign CHA Tasks for Documents
      if (defaultCHA && (req.type === 'document' || req.title.toLowerCase().includes('origin') || req.title.toLowerCase().includes('invoice'))) {
        const existing = await prisma.providerTask.findFirst({
          where: { requirementId: req.id, providerId: defaultCHA.id },
        });

        if (!existing) {
          await prisma.providerTask.create({
            data: {
              providerId: defaultCHA.id,
              requirementId: req.id,
              type: 'CUSTOMS_CHA',
              status: req.status === 'verified' ? 'completed' : 'in_progress',
              notes: `Customs Brokerage verification & Chamber of Commerce stamp audit for ${req.title}.`,
              assignedAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
            },
          });
        }
      }
    }

    // 3. Assign Freight Logistics Tasks for Shipments
    if (defaultFreight && shipments.length > 0) {
      for (const shp of shipments) {
        const existing = await prisma.providerTask.findFirst({
          where: { shipmentId: shp.id, providerId: defaultFreight.id },
        });

        if (!existing) {
          await prisma.providerTask.create({
            data: {
              providerId: defaultFreight.id,
              shipmentId: shp.id,
              type: 'FREIGHT',
              status: shp.status === 'Delivered' ? 'completed' : 'in_progress',
              notes: `Freight booking & multimodal dispatch coordination for ${shp.product.name} (${shp.quantity} MT) to ${shp.destinationCity}.`,
              assignedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
            },
          });
        }
      }
    }
  } catch (err) {
    console.error('Error in seedProviderTasksIfSparse:', err);
  }
}
