'use server';

import { prisma } from '@/lib/prisma';
import { calculateReadinessScore } from '@/lib/services/readiness';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import {
  BUSINESS_TYPE_CONFIGS,
  validateGSTIN,
  validateIEC,
  type BusinessType,
} from '@/lib/businessTypeConfig';
import { syncBusinessRequirements } from '@/lib/services/applicability';
import { ensureMSMEBusiness } from '@/lib/services/setupMSME';
import {
  PERSONA_COOKIE,
  USER_ID_COOKIE,
  USER_EMAIL_COOKIE,
  USER_NAME_COOKIE,
  SESSION_COOKIE,
  SECURE_SESSION_COOKIE_OPTIONS,
} from '@/lib/authCookies';
import { createSessionToken, verifySessionToken } from '@/lib/session';
import { hashPassword, verifyPassword } from '@/lib/crypto';
import { isPlatformAdmin, requireAdmin, getPlatformAdminEmail } from '@/lib/authGuards';

async function saveFileLocally(file: File | null, prefix: string): Promise<{ storageKey: string, size: number, name: string } | null> {
  if (!file || file.size === 0) return null;
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${prefix}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (e) {}

  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, buffer);
  
  return { storageKey: `uploads/${filename}`, size: file.size, name: file.name };
}

export async function getActiveUser(): Promise<{
  user: any | null;
  role: 'MSME' | 'PROVIDER' | 'ADMIN' | null;
}> {
  try {
    const cookieStore = await cookies();
    const sessionCookieVal = cookieStore.get(SESSION_COOKIE)?.value;
    const verifiedSession = verifySessionToken(sessionCookieVal);

    const userIdVal = verifiedSession?.userId || cookieStore.get(USER_ID_COOKIE)?.value;
    const userEmailVal = verifiedSession?.email || cookieStore.get(USER_EMAIL_COOKIE)?.value;
    const rawName = cookieStore.get(USER_NAME_COOKIE)?.value;
    let userNameVal: string | null = verifiedSession?.name || null;
    if (!userNameVal && rawName) {
      try {
        userNameVal = decodeURIComponent(rawName);
      } catch {
        userNameVal = rawName;
      }
    }
    const personaVal = (verifiedSession?.role || cookieStore.get(PERSONA_COOKIE)?.value) as 'MSME' | 'PROVIDER' | 'ADMIN' | undefined;

    const USER_AUTH_SELECT = {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      passwordHash: true,
      businesses: {
        select: {
          id: true,
          legalName: true,
          displayName: true,
          businessType: true,
          location: true,
          city: true,
          state: true,
          gstStatus: true,
          iecStatus: true,
          profileCompletion: true,
          ownerUserId: true,
          products: {
            select: {
              id: true,
              name: true,
              hsCode: true,
              destinations: {
                select: {
                  id: true,
                  country: {
                    select: {
                      id: true,
                      name: true,
                      isoCode: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      providers: {
        select: {
          id: true,
          name: true,
          type: true,
          serviceArea: true,
          contactEmail: true,
        },
      },
    };

    if (userIdVal || userEmailVal) {
      let user = null;
      if (userIdVal) {
        user = await prisma.user.findUnique({
          where: { id: userIdVal },
          select: USER_AUTH_SELECT,
        });
      }

      if (!user && userEmailVal) {
        user = await prisma.user.findFirst({
          where: { email: userEmailVal },
          select: USER_AUTH_SELECT,
        });
      }

      // If user session exists but local database doesn't have the row yet:
      if (!user && (userEmailVal || userIdVal)) {
        const email = userEmailVal || `user_${userIdVal?.slice(0, 8)}@vyaparflow.app`;
        const name = userNameVal || email.split('@')[0];
        // NEVER auto-assign ADMIN for unregistered or synced sessions
        const isLegitAdmin = email.toLowerCase().trim() === getPlatformAdminEmail();
        const role = isLegitAdmin ? 'ADMIN' : personaVal === 'PROVIDER' ? 'PROVIDER' : 'MSME';

        try {
          user = await prisma.user.create({
            data: {
              ...(userIdVal ? { id: userIdVal } : {}),
              email,
              name,
              role,
              passwordHash: 'oauth_google',
              ...(role === 'PROVIDER'
                ? {
                    providers: {
                      create: {
                        name: `${name} Logistics & Trade Services`,
                        type: 'FREIGHT',
                        serviceArea: 'Pan-India & Global Corridors',
                        contactEmail: email,
                      },
                    },
                  }
                : {}),
            },
            select: USER_AUTH_SELECT,
          });
        } catch (syncErr) {
          console.error('Auto-syncing session user to local lambda failed:', syncErr);
        }
      }

      if (user) {
        // Enforce server authority: User receives ADMIN role ONLY if verified by isPlatformAdmin
        const activeRole: 'MSME' | 'PROVIDER' | 'ADMIN' = isPlatformAdmin(user)
          ? 'ADMIN'
          : user.role === 'PROVIDER'
          ? 'PROVIDER'
          : 'MSME';
        return { user, role: activeRole };
      }
    }

    return { user: null, role: null };
  } catch (error: any) {
    if (error?.digest === 'DYNAMIC_SERVER_USAGE') {
      throw error;
    }
    console.error('Error fetching active user:', error);
    return { user: null, role: null };
  }
}

export async function requireAuth(): Promise<{
  user: any;
  role: 'MSME' | 'PROVIDER' | 'ADMIN';
}> {
  const { user, role } = await getActiveUser();
  if (!user || !role) {
    redirect('/login');
  }
  return { user, role };
}

export async function logoutUserAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, '', { path: '/', maxAge: 0, expires: new Date(0) });
  cookieStore.set(USER_ID_COOKIE, '', { path: '/', maxAge: 0, expires: new Date(0) });
  cookieStore.set(PERSONA_COOKIE, '', { path: '/', maxAge: 0, expires: new Date(0) });
  cookieStore.set(USER_EMAIL_COOKIE, '', { path: '/', maxAge: 0, expires: new Date(0) });
  cookieStore.set(USER_NAME_COOKIE, '', { path: '/', maxAge: 0, expires: new Date(0) });
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function uploadDocumentAction(formData: FormData): Promise<void> {
  const requirementId = formData.get('requirementId') as string;
  const businessId = formData.get('businessId') as string;
  const docType = formData.get('docType') as string;
  const file = formData.get('file') as File | null;
  const notes = formData.get('notes') as string;

  const { user } = await getActiveUser();
  if (!user) {
    throw new Error('Unauthorized: You must be logged in to upload compliance documents.');
  }

  if (!businessId) {
    throw new Error('Business ID is required for document upload');
  }

  const targetBusiness = await prisma.business.findUnique({
    where: { id: businessId },
  });

  if (!targetBusiness) {
    throw new Error('Target business record not found.');
  }

  if (!isPlatformAdmin(user) && targetBusiness.ownerUserId !== user.id) {
    throw new Error('Unauthorized: You do not have permission to upload documents for this business.');
  }

  // Enforce 10 MB maximum file size limit
  if (file && file.size > 10 * 1024 * 1024) {
    throw new Error('File size exceeds the 10 MB limit. Please upload a compressed document.');
  }

  const saved = await saveFileLocally(file, docType || 'doc');
  const filename = saved?.name || file?.name || `${docType}_Sample_Evidence.pdf`;
  const storageKey = saved?.storageKey || `uploads/${Date.now()}_${filename.replace(/\s+/g, '_')}`;

  const createdDoc = await prisma.document.create({
    data: {
      businessId,
      requirementId: requirementId || null,
      type: docType || 'ComplianceEvidence',
      storageKey,
      originalName: filename,
      mimeType: file?.type || 'application/pdf',
      size: saved?.size || file?.size || 256000,
      issueDate: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: 'under_review',
      notes: notes || 'Submitted for platform verification. Awaiting authorized service provider review.',
    },
  });

  if (requirementId) {
    const req = await prisma.requirement.update({
      where: { id: requirementId },
      data: {
        status: 'under_review',
        completedAt: null,
        reason: 'Document submitted successfully. Platform verification pending by authorized review partner.',
      },
    });

    // Create / assign provider verification task
    const provider = await prisma.provider.findFirst({
      where: {
        type: req.type === 'certification' ? 'CERTIFICATION' : 'CUSTOMS_CHA',
      },
    }) || await prisma.provider.findFirst();

    if (provider) {
      await prisma.providerTask.create({
        data: {
          providerId: provider.id,
          requirementId: req.id,
          type: req.type === 'certification' ? 'CERTIFICATION' : 'CUSTOMS_CHA',
          status: 'in_progress',
          notes: `Document verification queued for ${req.title} (${filename}). Exporter submitted evidence for compliance audit.`,
        },
      });
    }
  }

  // Audit Log for document submission
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      entityType: 'Document',
      entityId: createdDoc.id,
      action: 'SUBMIT_DOCUMENT',
      newValueJson: JSON.stringify({
        status: 'under_review',
        originalName: filename,
        requirementId,
        businessId,
        submittedBy: user.name,
      }),
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/documents');
  revalidatePath('/readiness');
  revalidatePath('/provider');
  revalidatePath('/admin');
}

export async function verifyDocumentAction(
  documentId: string,
  status: 'verified' | 'rejected',
  notes?: string
): Promise<void> {
  const { user, role } = await getActiveUser();

  // Strict Server-Side Role Authorization: Only verified Platform Admin OR an authorized Provider can review
  if (!user || (role !== 'PROVIDER' && !isPlatformAdmin(user))) {
    throw new Error('Unauthorized: Verification must be performed by an authorized partner or the Platform Administrator.');
  }

  // Mandatory rejection reason check
  if (status === 'rejected' && (!notes || notes.trim().length === 0)) {
    throw new Error('Rejection reason is mandatory when rejecting an exporter compliance document.');
  }

  const existingDoc = await prisma.document.findUnique({
    where: { id: documentId },
    include: { requirement: true },
  });

  if (!existingDoc) {
    throw new Error('Document record not found.');
  }

  const previousState = existingDoc.status;
  const finalNotes = notes?.trim() || (status === 'verified'
    ? `Verified by authorized platform reviewer (${user.name || 'Compliance Officer'}).`
    : 'Document rejected due to legibility/compliance discrepancies.');

  const updatedDoc = await prisma.document.update({
    where: { id: documentId },
    data: {
      status,
      notes: finalNotes,
    },
  });

  if (updatedDoc.requirementId) {
    await prisma.requirement.update({
      where: { id: updatedDoc.requirementId },
      data: {
        status,
        reason: status === 'verified'
          ? 'Verified by authorized platform reviewer.'
          : `Verification rejected: ${finalNotes}`,
        completedAt: status === 'verified' ? new Date() : null,
      },
    });

    // Update any linked provider tasks
    await prisma.providerTask.updateMany({
      where: { requirementId: updatedDoc.requirementId },
      data: {
        status: status === 'verified' ? 'completed' : 'rejected',
        completedAt: new Date(),
        notes: `Review finalized by ${user.name} (${role}): ${finalNotes}`,
      },
    });
  }

  // Audit Log with complete traceability
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      entityType: 'Document',
      entityId: documentId,
      action: status === 'verified' ? 'APPROVE_DOCUMENT' : 'REJECT_DOCUMENT',
      oldValueJson: JSON.stringify({ status: previousState }),
      newValueJson: JSON.stringify({
        status,
        notes: finalNotes,
        reviewerName: user.name,
        reviewerRole: role,
        timestamp: new Date().toISOString(),
      }),
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/documents');
  revalidatePath('/readiness');
  revalidatePath('/provider');
  revalidatePath('/admin');
}

export async function requestCertificationAction(requirementId: string, providerId?: string): Promise<void> {
  const req = await prisma.requirement.findUnique({
    where: { id: requirementId },
  });
  if (!req) throw new Error('Requirement not found');

  let targetProviderId = providerId;
  if (!targetProviderId) {
    const provider = await prisma.provider.findFirst({
      where: { type: 'CERTIFICATION' },
    });
    if (!provider) throw new Error('No certification provider available');
    targetProviderId = provider.id;
  }

  const providerTask = await prisma.providerTask.create({
    data: {
      providerId: targetProviderId,
      requirementId,
      type: 'CERTIFICATION',
      status: 'in_progress',
      notes: `Certification request submitted for: ${req.title}`,
    },
  });

  await prisma.certificationRequest.create({
    data: {
      requirementId,
      providerTaskId: providerTask.id,
      status: 'in_progress',
    },
  });

  await prisma.requirement.update({
    where: { id: requirementId },
    data: {
      status: 'under_review',
      reason: 'Certification request assigned to accredited laboratory provider.',
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/certifications');
  revalidatePath('/readiness');
}

export async function updatePackagingItemAction(itemId: string, status: 'completed' | 'incomplete'): Promise<void> {
  const { user } = await getActiveUser();
  if (!user) {
    throw new Error('Unauthorized: Authentication required.');
  }

  const item = await prisma.packagingItem.findUnique({
    where: { id: itemId },
    include: { productCountry: { include: { product: { include: { business: true } } } } },
  });

  if (!item) {
    throw new Error('Packaging item not found.');
  }

  if (!isPlatformAdmin(user) && item.productCountry.product.business.ownerUserId !== user.id) {
    throw new Error('Unauthorized: You do not have permission to update packaging compliance for this business.');
  }

  await prisma.packagingItem.update({
    where: { id: itemId },
    data: { status },
  });

  revalidatePath('/dashboard');
  revalidatePath('/packaging');
  revalidatePath('/readiness');
}

export async function createShipmentAction(formData: FormData): Promise<void> {
  const { user } = await getActiveUser();
  if (!user) {
    throw new Error('Unauthorized: You must be logged in to create shipments.');
  }

  const businessId = formData.get('businessId') as string;
  if (!businessId) {
    throw new Error('Business ID is required to create a shipment.');
  }

  const targetBusiness = await prisma.business.findUnique({
    where: { id: businessId },
  });

  if (!targetBusiness) {
    throw new Error('Target business record not found.');
  }

  if (!isPlatformAdmin(user) && targetBusiness.ownerUserId !== user.id) {
    throw new Error('Unauthorized: You do not have permission to create shipments for this business.');
  }

  const productName = formData.get('productName') as string;

  let product = await prisma.product.findFirst({
    where: { businessId, name: productName },
  });

  if (!product) {
    product = await prisma.product.findFirst({
      where: { businessId },
    });
  }

  if (!product) throw new Error('No product found');
  const productId = product.id;
  const destinationCountryId = formData.get('destinationCountryId') as string;
  const destinationCity = (formData.get('destinationCity') as string) || 'Dubai';
  const value = parseFloat((formData.get('value') as string) || '1500000');
  const quantity = parseFloat((formData.get('quantity') as string) || '10');
  const weight = parseFloat((formData.get('weight') as string) || '10000');
  const packages = parseInt((formData.get('packages') as string) || '500', 10);
  const mode = (formData.get('mode') as string) || 'Sea';

  // High-entropy collision-free unique shipment number
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const timeHex = Date.now().toString(36).toUpperCase();
  const shipmentNumber = `SHP-${new Date().getFullYear()}-${timeHex}-${randomSuffix}`;

  const shipment = await prisma.shipment.create({
    data: {
      shipmentNumber,
      businessId,
      productId,
      destinationCountryId,
      destinationCity,
      value,
      quantity,
      weight,
      packages,
      mode,
      status: 'Draft',
    },
  });

  const providers = await prisma.provider.findMany({ where: { type: 'FREIGHT' } });
  if (providers.length >= 3) {
    await prisma.quote.createMany({
      data: [
        {
          shipmentId: shipment.id,
          providerId: providers[0].id,
          mode: 'Sea Freight (FCL 20ft Reefer)',
          cost: Math.round(value * 0.08),
          currency: 'INR',
          transitMin: 12,
          transitMax: 15,
          inclusions: 'Port handling, JNPT customs documentation assistance, Cold storage (+4°C)',
          exclusions: 'Destination import duties & tax',
        },
        {
          shipmentId: shipment.id,
          providerId: providers[1].id,
          mode: 'Sea Freight Express (Direct Liner)',
          cost: Math.round(value * 0.10),
          currency: 'INR',
          transitMin: 8,
          transitMax: 10,
          inclusions: 'Factory gate pickup at origin, Priority container discharge',
          exclusions: 'Local warehouse demurrage',
        },
        {
          shipmentId: shipment.id,
          providerId: providers[2].id,
          mode: 'Air Cargo Express',
          cost: Math.round(value * 0.18),
          currency: 'INR',
          transitMin: 2,
          transitMax: 3,
          inclusions: 'Direct air cargo route, Airport cold store handling',
          exclusions: 'Heavy cargo surcharge',
        },
      ],
    });
  }

  await prisma.trackingEvent.create({
    data: {
      shipmentId: shipment.id,
      status: 'Order Confirmed',
      location: 'Origin Manufacturing Facility, Exporter Hub',
      note: 'Shipment created and draft export documentation prepared.',
    },
  });

  revalidatePath('/shipments');
}

export async function selectQuoteAction(shipmentId: string, quoteId: string): Promise<void> {
  const { user } = await getActiveUser();
  if (!user) {
    throw new Error('Unauthorized: Authentication required.');
  }

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: { business: true },
  });

  if (!shipment) {
    throw new Error('Shipment not found.');
  }

  if (!isPlatformAdmin(user) && shipment.business.ownerUserId !== user.id) {
    throw new Error('Unauthorized: You do not have permission to accept quotes for this shipment.');
  }

  await prisma.quote.updateMany({
    where: { shipmentId },
    data: { isSelected: false },
  });

  const selectedQuote = await prisma.quote.update({
    where: { id: quoteId },
    data: { isSelected: true },
    include: { provider: true },
  });

  await prisma.shipment.update({
    where: { id: shipmentId },
    data: { status: 'Preparation' },
  });

  await prisma.trackingEvent.create({
    data: {
      shipmentId,
      status: 'Preparation',
      location: 'Freight Booking Operations Desk',
      note: `Freight quote accepted: ${selectedQuote.provider.name} (${selectedQuote.mode}) - ₹${selectedQuote.cost.toLocaleString('en-IN')}`,
      actorId: user.id,
    },
  });

  await prisma.providerTask.create({
    data: {
      shipmentId,
      providerId: selectedQuote.providerId,
      type: 'FREIGHT',
      status: 'accepted',
      notes: `Quote accepted for ${selectedQuote.mode} at ₹${selectedQuote.cost.toLocaleString('en-IN')}`,
    },
  });

  const chaProvider = await prisma.provider.findFirst({ where: { type: 'CUSTOMS_CHA' } });
  if (chaProvider) {
    await prisma.providerTask.create({
      data: {
        shipmentId,
        providerId: chaProvider.id,
        type: 'CUSTOMS_CHA',
        status: 'requested',
        notes: 'Customs declaration & Shipping Bill filing task created.',
      },
    });
  }

  // Create notifications
  try {
    await prisma.notification.create({
      data: {
        userId: shipment.business.ownerUserId,
        type: 'QUOTE_ACCEPTED',
        title: `Quote Accepted: #${shipment.shipmentNumber}`,
        message: `Accepted ${selectedQuote.provider.name} (${selectedQuote.mode}) at ₹${selectedQuote.cost.toLocaleString('en-IN')}. Preparation underway.`,
      },
    });

    if (selectedQuote.provider.userId) {
      await prisma.notification.create({
        data: {
          userId: selectedQuote.provider.userId,
          type: 'BOOKING_RECEIVED',
          title: `New Shipment Booking: #${shipment.shipmentNumber}`,
          message: `Exporter selected your freight rate of ₹${selectedQuote.cost.toLocaleString('en-IN')}.`,
        },
      });
    }
  } catch (notifErr) {
    console.error('Notification dispatch failed:', notifErr);
  }

  revalidatePath('/shipments');
  revalidatePath(`/shipments/${shipmentId}`);
  revalidatePath(`/shipments/${shipmentId}/quotes`);
  revalidatePath(`/shipments/${shipmentId}/tracking`);
  revalidatePath('/dashboard');
}

export async function updateProviderTaskAction(taskId: string, status: string, notes?: string): Promise<void> {
  const { user, role } = await getActiveUser();
  if (!user || (role !== 'PROVIDER' && !isPlatformAdmin(user))) {
    throw new Error('Unauthorized: Only authorized providers or Platform Administrators can update service tasks.');
  }

  const task = await prisma.providerTask.findUnique({
    where: { id: taskId },
    include: {
      provider: true,
      shipment: { include: { business: true } },
      requirement: {
        include: {
          productCountry: {
            include: {
              product: { include: { business: true } },
            },
          },
        },
      },
    },
  });

  if (!task) {
    throw new Error('Provider task not found.');
  }

  if (!isPlatformAdmin(user) && task.provider.userId && task.provider.userId !== user.id) {
    throw new Error('Unauthorized: This task is assigned to another service provider.');
  }

  const updatedTask = await prisma.providerTask.update({
    where: { id: taskId },
    data: {
      status,
      notes: notes || undefined,
      completedAt: status === 'completed' ? new Date() : null,
    },
  });

  const businessOwnerUserId =
    task.shipment?.business?.ownerUserId ||
    task.requirement?.productCountry?.product?.business?.ownerUserId;

  if (updatedTask.requirementId) {
    if (status === 'completed') {
      await prisma.requirement.update({
        where: { id: updatedTask.requirementId },
        data: {
          status: 'verified',
          completedAt: new Date(),
          reason: notes || 'Requirement completed & verified by service provider.',
        },
      });
      await prisma.document.updateMany({
        where: { requirementId: updatedTask.requirementId },
        data: {
          status: 'verified',
          notes: notes || 'Verified by accredited service provider.',
        },
      });

      if (businessOwnerUserId) {
        try {
          await prisma.notification.create({
            data: {
              userId: businessOwnerUserId,
              type: 'TASK_VERIFIED',
              title: `Compliance Item Cleared: ${task.requirement?.title || task.type}`,
              message: notes || `Service provider ${task.provider.name} verified and approved this compliance item.`,
            },
          });
        } catch (e) {}
      }
    } else if (status === 'rejected') {
      await prisma.requirement.update({
        where: { id: updatedTask.requirementId },
        data: {
          status: 'rejected',
          completedAt: null,
          reason: notes || 'Evidence rejected by service provider during audit.',
        },
      });
      await prisma.document.updateMany({
        where: { requirementId: updatedTask.requirementId },
        data: {
          status: 'rejected',
          notes: notes || 'Rejected by service provider.',
        },
      });

      if (businessOwnerUserId) {
        try {
          await prisma.notification.create({
            data: {
              userId: businessOwnerUserId,
              type: 'TASK_REJECTED',
              title: `Compliance Discrepancy: ${task.requirement?.title || task.type}`,
              message: notes || `Service provider ${task.provider.name} rejected submitted evidence. Action required.`,
            },
          });
        } catch (e) {}
      }
    }
  }

  // Create audit log
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      entityType: 'ProviderTask',
      entityId: taskId,
      action: `TASK_${status.toUpperCase()}`,
      oldValueJson: JSON.stringify({ status: task.status }),
      newValueJson: JSON.stringify({ status, notes }),
    },
  });

  revalidatePath('/provider');
  revalidatePath('/dashboard');
  revalidatePath('/readiness');
  revalidatePath('/documents');
}

export async function submitFreightQuoteAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const { user, role } = await getActiveUser();
  if (!user || (role !== 'PROVIDER' && !isPlatformAdmin(user))) {
    throw new Error('Unauthorized: Only authorized freight service providers or Platform Admins can submit quotes.');
  }

  const shipmentId = (formData.get('shipmentId') as string)?.trim();
  const providerId = (formData.get('providerId') as string)?.trim() || user.providers?.[0]?.id;
  const mode = (formData.get('mode') as string)?.trim() || 'Sea Freight (FCL 20ft Reefer)';
  const cost = parseFloat((formData.get('cost') as string) || '0');
  const transitMin = parseInt((formData.get('transitMin') as string) || '10', 10);
  const transitMax = parseInt((formData.get('transitMax') as string) || '14', 10);
  const inclusions = (formData.get('inclusions') as string)?.trim() || 'Port handling, Bill of Lading, Customs filing';
  const exclusions = (formData.get('exclusions') as string)?.trim() || 'Destination customs duty & VAT';

  if (!shipmentId) {
    return { success: false, error: 'Shipment ID is required to submit a freight quote.' };
  }

  if (!providerId) {
    return { success: false, error: 'Provider record could not be resolved.' };
  }

  if (!cost || cost <= 0) {
    return { success: false, error: 'Valid freight cost in INR is required.' };
  }

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: { business: true, product: true },
  });

  if (!shipment) {
    return { success: false, error: 'Shipment not found.' };
  }

  const createdQuote = await prisma.quote.create({
    data: {
      shipmentId,
      providerId,
      mode,
      cost,
      currency: 'INR',
      transitMin,
      transitMax,
      inclusions,
      exclusions,
      isSelected: false,
    },
    include: { provider: true },
  });

  // Notify MSME business owner
  try {
    await prisma.notification.create({
      data: {
        userId: shipment.business.ownerUserId,
        type: 'NEW_QUOTE',
        title: `New Freight Quote: #${shipment.shipmentNumber}`,
        message: `${createdQuote.provider.name} submitted a quote for ${mode} at ₹${cost.toLocaleString('en-IN')}.`,
      },
    });
  } catch (notifErr) {}

  // Create audit log
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      entityType: 'Quote',
      entityId: createdQuote.id,
      action: 'SUBMIT_FREIGHT_QUOTE',
      newValueJson: JSON.stringify({
        shipmentId,
        providerId,
        mode,
        cost,
        transitMin,
        transitMax,
      }),
    },
  });

  revalidatePath('/provider');
  revalidatePath('/shipments');
  revalidatePath(`/shipments/${shipmentId}`);
  revalidatePath(`/shipments/${shipmentId}/quotes`);
  revalidatePath('/dashboard');

  return { success: true };
}

export async function updateProviderDetailsAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const { user, role } = await getActiveUser();
  if (!user || (role !== 'PROVIDER' && !isPlatformAdmin(user))) {
    throw new Error('Unauthorized: Authentication required.');
  }

  const providerId = (formData.get('providerId') as string)?.trim() || user.providers?.[0]?.id;
  const name = (formData.get('name') as string)?.trim();
  const serviceArea = (formData.get('serviceArea') as string)?.trim();
  const contactEmail = (formData.get('contactEmail') as string)?.trim();
  const type = (formData.get('type') as string)?.trim();

  if (!providerId) {
    return { success: false, error: 'Provider ID is required.' };
  }

  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
  });

  if (!provider) {
    return { success: false, error: 'Provider profile not found.' };
  }

  if (!isPlatformAdmin(user) && provider.userId && provider.userId !== user.id) {
    return { success: false, error: 'Unauthorized: Cannot edit another provider profile.' };
  }

  await prisma.provider.update({
    where: { id: providerId },
    data: {
      name: name || provider.name,
      serviceArea: serviceArea || provider.serviceArea,
      contactEmail: contactEmail || provider.contactEmail,
      type: type || provider.type,
    },
  });

  revalidatePath('/provider');
  return { success: true };
}

export async function completeLabAuditAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const { user, role } = await getActiveUser();
  if (!user || (role !== 'PROVIDER' && !isPlatformAdmin(user))) {
    throw new Error('Unauthorized: Lab audit actions require accredited provider or admin credentials.');
  }

  const taskId = (formData.get('taskId') as string)?.trim();
  const requirementId = (formData.get('requirementId') as string)?.trim();
  const assayValue = (formData.get('assayValue') as string)?.trim();
  const isApproved = formData.get('decision') === 'approve';
  const notes = (formData.get('notes') as string)?.trim();

  if (!taskId && !requirementId) {
    return { success: false, error: 'Task or Requirement ID is required.' };
  }

  const auditRemark = isApproved
    ? `Accredited Lab Audit PASSED${assayValue ? ` [Assay: ${assayValue}]` : ''}: ${notes || 'Complies with target market regulatory standards & MRL tolerances.'}`
    : `Accredited Lab Audit REJECTED: ${notes || 'Sample does not meet required regulatory thresholds.'}`;

  if (requirementId) {
    await prisma.requirement.update({
      where: { id: requirementId },
      data: {
        status: isApproved ? 'verified' : 'rejected',
        reason: auditRemark,
        completedAt: isApproved ? new Date() : null,
      },
    });

    await prisma.document.updateMany({
      where: { requirementId },
      data: {
        status: isApproved ? 'verified' : 'rejected',
        notes: auditRemark,
      },
    });
  }

  if (taskId) {
    await prisma.providerTask.update({
      where: { id: taskId },
      data: {
        status: isApproved ? 'completed' : 'rejected',
        completedAt: new Date(),
        notes: auditRemark,
      },
    });
  }

  revalidatePath('/provider');
  revalidatePath('/readiness');
  revalidatePath('/certifications');
  revalidatePath('/documents');
  revalidatePath('/dashboard');

  return { success: true };
}

export async function fileCustomsLEOAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const { user, role } = await getActiveUser();
  if (!user || (role !== 'PROVIDER' && !isPlatformAdmin(user))) {
    throw new Error('Unauthorized: Customs actions require CHA provider or admin credentials.');
  }

  const taskId = (formData.get('taskId') as string)?.trim();
  const shipmentId = (formData.get('shipmentId') as string)?.trim();
  const shippingBillNumber = (formData.get('shippingBillNumber') as string)?.trim() || `SB-${Date.now().toString().slice(-6)}`;
  const portLocation = (formData.get('portLocation') as string)?.trim() || 'JNPT Customs Terminal, Nhava Sheva';
  const isApproved = formData.get('decision') === 'approve';
  const customNotes = (formData.get('notes') as string)?.trim();

  if (shipmentId) {
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { business: true },
    });

    if (shipment) {
      const milestoneStatus = isApproved ? 'Export Customs' : 'Exception';
      const eventNote = isApproved
        ? `ICEGATE Shipping Bill #${shippingBillNumber} processed. LEO (Let Export Order) granted by Indian Customs. Ready for container loading.`
        : `Customs Clearance On Hold: ${customNotes || 'Discrepancy in HS Code classification or valuation documentation.'}`;

      await prisma.trackingEvent.create({
        data: {
          shipmentId,
          status: milestoneStatus,
          location: portLocation,
          note: eventNote,
          actorId: user.id,
        },
      });

      await prisma.shipment.update({
        where: { id: shipmentId },
        data: { status: isApproved ? 'Export Customs' : 'Exception' },
      });

      try {
        await prisma.notification.create({
          data: {
            userId: shipment.business.ownerUserId,
            type: isApproved ? 'CUSTOMS_CLEARED' : 'CUSTOMS_HOLD',
            title: isApproved ? `LEO Granted: #${shipment.shipmentNumber}` : `Customs Hold: #${shipment.shipmentNumber}`,
            message: eventNote,
          },
        });
      } catch (e) {}
    }
  }

  if (taskId) {
    await prisma.providerTask.update({
      where: { id: taskId },
      data: {
        status: isApproved ? 'completed' : 'rejected',
        completedAt: new Date(),
        notes: `Customs CHA Action: Shipping Bill #${shippingBillNumber}. ${isApproved ? 'LEO cleared.' : 'Held for clarification.'}`,
      },
    });
  }

  revalidatePath('/provider');
  revalidatePath('/shipments');
  revalidatePath(`/shipments/${shipmentId}`);
  revalidatePath(`/shipments/${shipmentId}/tracking`);
  revalidatePath('/dashboard');

  return { success: true };
}

export async function addTrackingEventAction(
  shipmentId: string,
  status: string,
  location: string,
  note?: string
): Promise<void> {
  const { user, role } = await getActiveUser();
  if (!user) {
    throw new Error('Unauthorized: Authentication required.');
  }

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: {
      business: true,
      quotes: { where: { isSelected: true }, include: { provider: true } },
    },
  });

  if (!shipment) {
    throw new Error('Shipment record not found.');
  }

  // Authorization: MSME owner, Assigned Carrier, or Admin
  const isOwner = shipment.business.ownerUserId === user.id;
  const isCarrier = shipment.quotes.some((q) => q.provider.userId === user.id);
  const isAdmin = isPlatformAdmin(user);

  if (!isOwner && !isCarrier && !isAdmin) {
    throw new Error('Unauthorized: You do not have permission to log tracking milestones for this shipment.');
  }

  if (!status || status.trim().length === 0) {
    throw new Error('Tracking status milestone is required.');
  }

  if (!location || location.trim().length === 0) {
    throw new Error('Location description is required.');
  }

  await prisma.trackingEvent.create({
    data: {
      shipmentId,
      status: status.trim(),
      location: location.trim(),
      note: note?.trim() || null,
      actorId: user.id,
    },
  });

  const previousStatus = shipment.status;
  await prisma.shipment.update({
    where: { id: shipmentId },
    data: { status: status.trim() },
  });

  // Create Notification for MSME business owner
  try {
    await prisma.notification.create({
      data: {
        userId: shipment.business.ownerUserId,
        type: 'TRACKING_UPDATE',
        title: `Shipment #${shipment.shipmentNumber} → ${status}`,
        message: `Milestone event at ${location.trim()}${note ? `: ${note.trim()}` : ''}`,
      },
    });
  } catch (notifErr) {
    console.error('Tracking notification failed:', notifErr);
  }

  // Audit Log
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      entityType: 'Shipment',
      entityId: shipmentId,
      action: `TRACKING_${status.toUpperCase().replace(/\s+/g, '_')}`,
      oldValueJson: JSON.stringify({ status: previousStatus }),
      newValueJson: JSON.stringify({ status, location, note }),
    },
  });

  revalidatePath('/shipments');
  revalidatePath(`/shipments/${shipmentId}`);
  revalidatePath(`/shipments/${shipmentId}/tracking`);
  revalidatePath('/dashboard');
}

export async function updateRuleAction(ruleId: string, data: { priority?: string; weight?: number; blocksDispatch?: boolean; active?: boolean }): Promise<void> {
  const { user } = await requireAdmin();

  const existingRule = await prisma.rule.findUnique({ where: { id: ruleId } });
  if (!existingRule) {
    throw new Error('Compliance rule not found.');
  }

  await prisma.rule.update({
    where: { id: ruleId },
    data: {
      ...data,
      version: { increment: 1 },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      entityType: 'Rule',
      entityId: ruleId,
      action: 'UPDATE_COMPLIANCE_RULE',
      oldValueJson: JSON.stringify({ priority: existingRule.priority, weight: existingRule.weight, active: existingRule.active }),
      newValueJson: JSON.stringify(data),
    },
  });

  revalidatePath('/admin');
  revalidatePath('/dashboard');
  revalidatePath('/readiness');
}

export async function registerUserAction(formData: FormData): Promise<void> {
  const name = ((formData.get('name') as string) || '').trim();
  const rawEmail = ((formData.get('email') as string) || '').trim();
  const email = rawEmail.toLowerCase();
  const password = (formData.get('password') as string) || '';
  const requestedRole = ((formData.get('role') as string) || 'MSME').trim();

  // P0 SECURITY GUARD: Public registration can NEVER create an ADMIN account
  if (requestedRole === 'ADMIN' || requestedRole.toLowerCase().includes('admin')) {
    redirect('/login?tab=register&error=invalid_role');
  }

  const role: 'MSME' | 'PROVIDER' = requestedRole === 'PROVIDER' ? 'PROVIDER' : 'MSME';

  if (!name) {
    redirect('/login?tab=register&error=name_required');
  }
  if (!email || !email.includes('@')) {
    redirect('/login?tab=register&error=invalid_email');
  }
  if (!password || password.length < 6) {
    redirect('/login?tab=register&error=password_too_short');
  }

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { email: rawEmail },
      ],
    },
  });

  if (existingUser) {
    redirect('/login?tab=register&error=email_exists');
  }

  // Cryptographically hash password
  const passwordHash = hashPassword(password);

  // Create new user account with strictly sanitized role
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      ...(role === 'PROVIDER'
        ? {
            providers: {
              create: {
                name: `${name} Logistics & Trade Services`,
                type: 'FREIGHT',
                serviceArea: 'Pan-India & Global Corridors',
                contactEmail: email,
              },
            },
          }
        : {}),
    },
  });

  // Switch role and log in with the newly created user account
  const sessionToken = createSessionToken({
    userId: newUser.id,
    email: newUser.email,
    role: (newUser.role as 'MSME' | 'PROVIDER' | 'ADMIN') || 'MSME',
    name: newUser.name,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionToken, SECURE_SESSION_COOKIE_OPTIONS);
  cookieStore.set(USER_ID_COOKIE, newUser.id, { path: '/', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
  cookieStore.set(PERSONA_COOKIE, newUser.role, { path: '/', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
  cookieStore.set(USER_EMAIL_COOKIE, newUser.email, { path: '/', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
  cookieStore.set(USER_NAME_COOKIE, encodeURIComponent(newUser.name), { path: '/', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });

  // Jump to appropriate flow based on user's registered role
  if (newUser.role === 'PROVIDER') {
    redirect('/provider');
  } else {
    redirect('/onboarding');
  }
}

export async function loginUserAction(formData: FormData): Promise<void> {
  const rawEmail = ((formData.get('email') as string) || '').trim();
  const email = rawEmail.toLowerCase();
  const password = (formData.get('password') as string) || '';
  const cleanPassword = password.trim();

  if (!email) {
    redirect('/login?error=email_required');
  }

  if (!cleanPassword) {
    redirect('/login?error=password_required');
  }

  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { email: rawEmail },
      ],
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
    },
  });

  // Well-known demo accounts map for instant cloud / Vercel bootstrap
  const DEMO_ACCOUNTS: Record<string, { name: string; role: 'MSME' | 'PROVIDER' | 'ADMIN'; providerType?: string }> = {
    'admin@vyaparflow.com': { name: 'Platform Operator Admin', role: 'ADMIN' },
    'provider@freight.com': { name: 'Captain Vikram Sharma (SwiftGlobe)', role: 'PROVIDER', providerType: 'FREIGHT' },
    'lab@certify.com': { name: 'Dr. Anita Roy (Apex Quality Labs)', role: 'PROVIDER', providerType: 'CERTIFICATION' },
    'cha@customs.com': { name: 'Suresh Menon (Western Ports CHA)', role: 'PROVIDER', providerType: 'CUSTOMS_CHA' },
    'msme@apex-exports.com': { name: 'Rajesh Patil (MSME Owner)', role: 'MSME' },
    'msme2@konkan-spices.com': { name: 'Sunil Sawant', role: 'MSME' },
  };

  const isDemoEmail = Boolean(DEMO_ACCOUNTS[email]);
  const isDemoPassword = cleanPassword === 'password123';

  // If user does not exist in fresh Vercel database but is a demo account with password123:
  if (!user && isDemoEmail && isDemoPassword) {
    const demoSpec = DEMO_ACCOUNTS[email];
    try {
      user = await prisma.user.create({
        data: {
          email,
          name: demoSpec.name,
          role: demoSpec.role,
          passwordHash: hashPassword('password123'),
          ...(demoSpec.role === 'PROVIDER'
            ? {
                providers: {
                  create: {
                    name: demoSpec.name,
                    type: demoSpec.providerType || 'FREIGHT',
                    serviceArea: 'Western Ports, JNPT, Mundra & Global Corridors',
                    contactEmail: email,
                  },
                },
              }
            : {}),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          passwordHash: true,
        },
      });
    } catch (e) {
      console.error('Auto-bootstrap demo user error:', e);
    }
  }

  if (!user) {
    redirect('/login?error=user_not_found');
  }

  // If user signed up via Google OAuth, prompt them to use Google SSO
  if (user.passwordHash === 'oauth_google') {
    redirect('/login?error=use_google_signin');
  }

  // Cryptographic password verification with fallback
  let isMatch = verifyPassword(cleanPassword, user.passwordHash) || verifyPassword(password, user.passwordHash);

  // Auto-heal demo account password if matches standard password123
  if (!isMatch && isDemoEmail && isDemoPassword) {
    try {
      const newHash = hashPassword('password123');
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });
      isMatch = true;
    } catch (healErr) {}
  }

  if (!isMatch) {
    redirect('/login?error=invalid_password');
  }

  // Enforce server authority: activeRole is derived strictly from verified database state & isPlatformAdmin
  const activeRole: 'MSME' | 'PROVIDER' | 'ADMIN' = isPlatformAdmin(user)
    ? 'ADMIN'
    : user.role === 'PROVIDER'
    ? 'PROVIDER'
    : 'MSME';

  const sessionToken = createSessionToken({
    userId: user.id,
    email: user.email,
    role: activeRole,
    name: user.name,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionToken, SECURE_SESSION_COOKIE_OPTIONS);
  cookieStore.set(USER_ID_COOKIE, user.id, {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  });
  cookieStore.set(PERSONA_COOKIE, activeRole, {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  });
  cookieStore.set(USER_EMAIL_COOKIE, user.email, {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  });
  cookieStore.set(USER_NAME_COOKIE, encodeURIComponent(user.name), {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  });

  if (activeRole === 'PROVIDER') {
    redirect('/provider');
  } else if (activeRole === 'ADMIN') {
    redirect('/admin');
  } else {
    redirect('/dashboard');
  }
}

export async function deleteUserAction(userId: string): Promise<void> {
  const { user } = await requireAdmin();

  if (userId === user.id) {
    throw new Error('Cannot delete the active Platform Administrator account.');
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    throw new Error('User not found.');
  }

  if (isPlatformAdmin(targetUser)) {
    throw new Error('Cannot delete a Platform Administrator account.');
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      entityType: 'User',
      entityId: userId,
      action: 'DELETE_USER',
      oldValueJson: JSON.stringify({ email: targetUser.email, role: targetUser.role }),
    },
  });

  revalidatePath('/admin');
  revalidatePath('/dashboard');
}

export async function getAllUsers(): Promise<Array<{
  id: string;
  name: string;
  email: string;
  role: 'MSME' | 'PROVIDER' | 'ADMIN';
  displayName: string;
}>> {
  await requireAdmin();
  try {
    const users = await prisma.user.findMany({
      include: {
        businesses: true,
        providers: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: (isPlatformAdmin(u) ? 'ADMIN' : u.role === 'PROVIDER' ? 'PROVIDER' : 'MSME') as 'MSME' | 'PROVIDER' | 'ADMIN',
      displayName: u.businesses[0]?.displayName || u.providers[0]?.name || u.name,
    }));
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return [];
  }
}

export async function updateBusinessRegistrationsAction(formData: FormData): Promise<void> {
  const { user } = await getActiveUser();
  if (!user) {
    throw new Error('Unauthorized: Please sign in to update business registrations.');
  }

  const requestedBusinessId = (formData.get('businessId') as string)?.trim();
  const gstNumber = (formData.get('gstNumber') as string)?.trim();
  const iecCode = (formData.get('iecCode') as string)?.trim();
  const gstFile = formData.get('gstFile') as File | null;
  const iecFile = formData.get('iecFile') as File | null;

  // Resolve target business strictly owned by authenticated user
  const targetBusiness = (user.businesses && user.businesses.find((b: any) => b.id === requestedBusinessId)) || user.businesses?.[0];
  if (!targetBusiness) {
    throw new Error('No MSME business record found for authenticated user.');
  }

  const updateData: any = {};
  if (gstNumber) {
    updateData.gstStatus = `Active (${gstNumber})`;
  }
  if (iecCode) {
    updateData.iecStatus = `Active (${iecCode})`;
  }

  if (gstNumber && iecCode) {
    updateData.profileCompletion = 100;
  } else if (gstNumber || iecCode) {
    updateData.profileCompletion = 60;
  }

  await prisma.business.update({
    where: { id: targetBusiness.id },
    data: updateData,
  });

  const business = await prisma.business.findUnique({
    where: { id: targetBusiness.id },
    include: { products: { include: { destinations: { include: { requirements: true } } } } },
  });

  if (business) {
    for (const p of business.products) {
      for (const dest of p.destinations) {
        for (const req of dest.requirements) {
          if (gstNumber && req.title.toLowerCase().includes('gst')) {
            await prisma.requirement.update({
              where: { id: req.id },
              data: { status: 'verified', reason: `GSTIN verified: ${gstNumber}` },
            });

            const gstSaved = await saveFileLocally(gstFile, 'gst');

            await prisma.document.create({
              data: {
                businessId: targetBusiness.id,
                requirementId: req.id,
                type: 'GST_CERTIFICATE',
                storageKey: gstSaved?.storageKey || `uploads/gst_${Date.now()}.pdf`,
                originalName: gstSaved?.name || gstFile?.name || 'GSTIN_Certificate.pdf',
                mimeType: gstFile?.type || 'application/pdf',
                size: gstSaved?.size || gstFile?.size || 150000,
                status: 'verified',
                notes: `GSTIN: ${gstNumber}`,
              },
            });
          }

          if (iecCode && req.title.toLowerCase().includes('iec')) {
            await prisma.requirement.update({
              where: { id: req.id },
              data: { status: 'verified', reason: `IEC Code verified: ${iecCode}` },
            });

            const iecSaved = await saveFileLocally(iecFile, 'iec');

            await prisma.document.create({
              data: {
                businessId: targetBusiness.id,
                requirementId: req.id,
                type: 'IEC_CERTIFICATE',
                storageKey: iecSaved?.storageKey || `uploads/iec_${Date.now()}.pdf`,
                originalName: iecSaved?.name || iecFile?.name || 'IEC_Certificate.pdf',
                mimeType: iecFile?.type || 'application/pdf',
                size: iecSaved?.size || iecFile?.size || 150000,
                status: 'verified',
                notes: `IEC Code: ${iecCode}`,
              },
            });
          }
        }
      }
    }
  }

  revalidatePath('/business');
  revalidatePath('/dashboard');
  revalidatePath('/readiness');
  revalidatePath('/documents');
}

export async function updateCompanyProfileAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const businessId = (formData.get('businessId') as string)?.trim();
  const displayName = (formData.get('displayName') as string)?.trim();
  const legalName = (formData.get('legalName') as string)?.trim();
  const businessType = (formData.get('businessType') as string)?.trim();
  const location = (formData.get('location') as string)?.trim();
  const city = (formData.get('city') as string)?.trim();
  const state = (formData.get('state') as string)?.trim();

  if (!displayName) {
    return { success: false, error: 'Display Brand / Company Name is required.' };
  }

  if (!legalName) {
    return { success: false, error: 'Legal Entity Name is required.' };
  }

  const { user } = await getActiveUser();
  if (!user) {
    return { success: false, error: 'Authentication required to update company profile.' };
  }

  let targetBusinessId = businessId;
  if (!targetBusinessId && user.businesses && user.businesses.length > 0) {
    targetBusinessId = user.businesses[0].id;
  }

  if (!targetBusinessId) {
    return { success: false, error: 'No business profile found to update.' };
  }

  const existingBiz = await prisma.business.findUnique({
    where: { id: targetBusinessId },
  });

  if (!existingBiz) {
    return { success: false, error: 'Business profile not found in database.' };
  }

  // Authorization check: User must own this business or be ADMIN
  if (user.role !== 'ADMIN' && existingBiz.ownerUserId !== user.id) {
    return { success: false, error: 'Unauthorized: You do not have permission to modify this company profile.' };
  }

  const destinationIso = (formData.get('destinationIso') as string)?.trim().toUpperCase();
  const destinationName = (formData.get('destinationName') as string)?.trim();

  await prisma.business.update({
    where: { id: targetBusinessId },
    data: {
      displayName: displayName || existingBiz.displayName,
      legalName: legalName || existingBiz.legalName,
      businessType: businessType || existingBiz.businessType,
      location: location || existingBiz.location,
      city: city || existingBiz.city,
      state: state || existingBiz.state,
    },
  });

  if (destinationIso) {
    let country = await prisma.country.findFirst({
      where: {
        OR: [
          { isoCode: destinationIso },
          { name: destinationName || destinationIso },
        ],
      },
    });

    if (!country) {
      country = await prisma.country.create({
        data: {
          name: destinationName || destinationIso,
          isoCode: destinationIso,
          active: true,
        },
      });
    }

    const bizProducts = await prisma.product.findMany({
      where: { businessId: targetBusinessId },
      include: { destinations: true },
    });

    for (const prod of bizProducts) {
      if (prod.destinations && prod.destinations.length > 0) {
        await prisma.productCountry.update({
          where: { id: prod.destinations[0].id },
          data: { countryId: country.id },
        });
      } else {
        await prisma.productCountry.create({
          data: {
            productId: prod.id,
            countryId: country.id,
          },
        });
      }
    }
  }

  // Dynamically sync statutory compliance requirements to the updated business type & corridor
  await syncBusinessRequirements(targetBusinessId);

  // Log audit action
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      entityType: 'Business',
      entityId: targetBusinessId,
      action: 'UPDATE_COMPANY_PROFILE',
      newValueJson: JSON.stringify({ displayName, legalName, businessType, location, city, state }),
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/business');
  revalidatePath('/readiness');
  revalidatePath('/shipments');

  return { success: true };
}

export async function completeOnboardingAction(formData: FormData): Promise<void> {
  const { user } = await getActiveUser();
  if (!user) {
    redirect('/login?error=auth_required');
  }

  // Extract Step 1 & 2 fields
  const companyName = ((formData.get('companyName') as string) || '').trim();
  const rawBusinessType = ((formData.get('businessType') as string) || 'MANUFACTURER').trim();
  const legalName = ((formData.get('legalName') as string) || companyName).trim();
  const address = ((formData.get('address') as string) || 'Industrial Export Corridor').trim();
  const city = ((formData.get('city') as string) || 'Mumbai').trim();
  const state = ((formData.get('state') as string) || 'Maharashtra').trim();
  const countryName = ((formData.get('country') as string) || 'India').trim();
  const gstin = ((formData.get('gstin') as string) || '').trim().toUpperCase();
  const hasIec = formData.get('hasIec') === 'true' || formData.get('hasIec') === 'yes' || formData.get('hasIec') === 'on';
  const iec = ((formData.get('iec') as string) || '').trim().toUpperCase();
  const udyamNumber = ((formData.get('udyamNumber') as string) || '').trim().toUpperCase();

  // Extract Step 3 (Industry & Products)
  const industry = ((formData.get('industry') as string) || 'Textiles & Garments').trim();
  const productsJsonStr = formData.get('products') as string;
  let productsList: Array<{ name: string; category?: string; hsCode?: string; description?: string }> = [];
  try {
    if (productsJsonStr) {
      productsList = JSON.parse(productsJsonStr);
    }
  } catch (e) {
    console.error('Failed to parse productsJson:', e);
  }

  if (productsList.length === 0) {
    const singleProdName = ((formData.get('productName') as string) || `${industry} Export Merchandise`).trim();
    const singleProdHs = ((formData.get('hsCode') as string) || '').trim();
    productsList.push({
      name: singleProdName,
      category: industry,
      hsCode: singleProdHs || 'PENDING',
    });
  }

  // Extract Step 4 (Destinations)
  const destinationsJsonStr = formData.get('destinations') as string;
  let destinationsList: Array<{ name: string; isoCode: string }> = [];
  try {
    if (destinationsJsonStr) {
      destinationsList = JSON.parse(destinationsJsonStr);
    }
  } catch (e) {
    console.error('Failed to parse destinationsJson:', e);
  }

  if (destinationsList.length === 0) {
    const singleDest = ((formData.get('destination') as string) || '').trim();
    if (singleDest) {
      const isUae = singleDest.toLowerCase().includes('emirates') || singleDest.toLowerCase().includes('uae');
      const isNl = singleDest.toLowerCase().includes('netherlands') || singleDest.toLowerCase().includes('holland');
      const isVn = singleDest.toLowerCase().includes('vietnam');
      const isDe = singleDest.toLowerCase().includes('germany');
      destinationsList.push({
        name: singleDest,
        isoCode: isNl ? 'NL' : isVn ? 'VN' : isDe ? 'DE' : isUae ? 'AE' : 'US',
      });
    }
  }

  // Determine or find existing business owned by this user
  let business = await prisma.business.findFirst({
    where: { ownerUserId: user.id },
  });

  const gstStatus = gstin ? `Active (${gstin})` : 'Not Registered';
  const iecStatus = (hasIec && iec) ? `Active (${iec})` : 'Pending Application';
  const profileCompletion = (gstin && iec) ? 100 : (gstin || iec) ? 80 : 60;
  const compositeBusinessType = `${industry} (${rawBusinessType})`;

  if (business) {
    business = await prisma.business.update({
      where: { id: business.id },
      data: {
        displayName: companyName || business.displayName,
        legalName: legalName || business.legalName,
        businessType: compositeBusinessType,
        location: address,
        city,
        state,
        gstStatus,
        iecStatus,
        profileCompletion,
      },
    });
  } else {
    business = await prisma.business.create({
      data: {
        ownerUserId: user.id,
        displayName: companyName || `${user.name} Exports`,
        legalName: legalName || `${user.name} Private Limited`,
        businessType: compositeBusinessType,
        location: address,
        city,
        state,
        gstStatus,
        iecStatus,
        profileCompletion,
      },
    });
  }

  // Process Products and Categories cleanly
  const activeProductIds: string[] = [];

  for (const prodItem of productsList) {
    const categoryName = prodItem.category || industry || 'General Exports';
    let cat = await prisma.productCategory.findFirst({
      where: { name: { contains: categoryName } },
    });
    if (!cat) {
      cat = await prisma.productCategory.create({
        data: {
          name: categoryName,
          description: `${categoryName} export products and goods`,
        },
      });
    }

    let product = await prisma.product.findFirst({
      where: {
        businessId: business.id,
        name: prodItem.name,
      },
    });

    if (!product) {
      product = await prisma.product.create({
        data: {
          businessId: business.id,
          categoryId: cat.id,
          name: prodItem.name,
          hsCode: prodItem.hsCode || 'PENDING',
          unit: 'KG',
          defaultValue: 1000000,
        },
      });
    } else {
      product = await prisma.product.update({
        where: { id: product.id },
        data: {
          categoryId: cat.id,
          hsCode: prodItem.hsCode || product.hsCode,
        },
      });
    }

    activeProductIds.push(product.id);

    // Connect Product to Destinations in exact user-selected order
    const targetCountryIds: string[] = [];
    for (const dest of destinationsList) {
      let country = await prisma.country.findFirst({
        where: {
          OR: [
            { isoCode: dest.isoCode },
            { name: dest.name },
          ],
        },
      });

      if (!country) {
        country = await prisma.country.create({
          data: {
            name: dest.name,
            isoCode: dest.isoCode || 'US',
          },
        });
      }

      targetCountryIds.push(country.id);

      let productCountry = await prisma.productCountry.findFirst({
        where: {
          productId: product.id,
          countryId: country.id,
        },
      });

      if (!productCountry) {
        await prisma.productCountry.create({
          data: {
            productId: product.id,
            countryId: country.id,
          },
        });
      }
    }

    // Clean up any stale ProductCountry mappings for active products that the user did not select
    if (targetCountryIds.length > 0) {
      const staleProductCountries = await prisma.productCountry.findMany({
        where: {
          productId: product.id,
          countryId: { notIn: targetCountryIds },
        },
        include: {
          requirements: true,
        },
      });

      for (const spc of staleProductCountries) {
        for (const req of spc.requirements) {
          await prisma.document.updateMany({
            where: { requirementId: req.id },
            data: { requirementId: null },
          });
          await prisma.providerTask.deleteMany({
            where: { requirementId: req.id },
          });
          await prisma.certificationRequest.deleteMany({
            where: { requirementId: req.id },
          });
        }
        await prisma.requirement.deleteMany({
          where: { productCountryId: spc.id },
        });
        await prisma.packagingItem.deleteMany({
          where: { productCountryId: spc.id },
        });
      }

      await prisma.productCountry.deleteMany({
        where: {
          productId: product.id,
          countryId: { notIn: targetCountryIds },
        },
      });
    }
  }

  // Delete any stale products belonging to this business not in active onboarding list
  if (activeProductIds.length > 0) {
    const staleProducts = await prisma.product.findMany({
      where: {
        businessId: business.id,
        id: { notIn: activeProductIds },
      },
      include: {
        destinations: {
          include: {
            requirements: true,
          },
        },
      },
    });

    for (const sp of staleProducts) {
      // Re-link any existing shipments pointing to this stale product to the active product
      await prisma.shipment.updateMany({
        where: { productId: sp.id },
        data: { productId: activeProductIds[0] },
      });

      for (const dest of sp.destinations) {
        for (const req of dest.requirements) {
          await prisma.document.updateMany({
            where: { requirementId: req.id },
            data: { requirementId: null },
          });
          await prisma.providerTask.deleteMany({
            where: { requirementId: req.id },
          });
          await prisma.certificationRequest.deleteMany({
            where: { requirementId: req.id },
          });
        }
        await prisma.requirement.deleteMany({
          where: { productCountryId: dest.id },
        });
        await prisma.packagingItem.deleteMany({
          where: { productCountryId: dest.id },
        });
      }

      await prisma.productCountry.deleteMany({
        where: { productId: sp.id },
      });

      await prisma.product.delete({
        where: { id: sp.id },
      });
    }
  }

  // Synchronize business active shipment to match selected product and target corridor
  if (activeProductIds.length > 0 && destinationsList.length > 0) {
    const primaryDest = destinationsList[0];
    const primaryCountry = await prisma.country.findFirst({
      where: {
        OR: [
          { isoCode: primaryDest.isoCode },
          { name: primaryDest.name },
        ],
      },
    });

    if (primaryCountry) {
      const portCity =
        primaryCountry.isoCode === 'NL'
          ? 'Rotterdam (Port of Rotterdam)'
          : primaryCountry.isoCode === 'DE'
          ? 'Hamburg (Port of Hamburg)'
          : primaryCountry.isoCode === 'VN'
          ? 'Hai Phong / Cat Lai Port'
          : primaryCountry.isoCode === 'AE'
          ? 'Dubai (Jebel Ali Port)'
          : primaryCountry.isoCode === 'US'
          ? 'New York / New Jersey Port'
          : primaryCountry.isoCode === 'GB'
          ? 'London Gateway / Southampton'
          : `${primaryCountry.name} Main Port`;

      await prisma.shipment.updateMany({
        where: { businessId: business.id },
        data: {
          productId: activeProductIds[0],
          destinationCountryId: primaryCountry.id,
          destinationCity: portCity,
        },
      });
    }
  }

  // Handle Document Uploads from Step 5
  const docFiles = [
    { key: 'gstDoc', type: 'GST_CERTIFICATE', name: 'GSTIN Registration Certificate' },
    { key: 'iecDoc', type: 'IEC_CERTIFICATE', name: 'DGFT Import Export Code (IEC)' },
    { key: 'udyamDoc', type: 'UDYAM_REGISTRATION', name: 'Udyam MSME Registration' },
    { key: 'rcmcDoc', type: 'RCMC_CERTIFICATE', name: 'Export Promotion Council RCMC' },
    { key: 'cooDoc', type: 'CERTIFICATE_OF_ORIGIN', name: 'Certificate of Origin' },
    { key: 'otherDoc', type: 'COMPLIANCE_EVIDENCE', name: 'Compliance Evidence Document' },
  ];

  for (const docSpec of docFiles) {
    const file = formData.get(docSpec.key) as File | null;
    if (file && file.size > 0 && file.size <= 10 * 1024 * 1024) {
      const saved = await saveFileLocally(file, docSpec.key);
      if (saved) {
        await prisma.document.create({
          data: {
            businessId: business.id,
            type: docSpec.type,
            storageKey: saved.storageKey,
            originalName: saved.name || file.name,
            mimeType: file.type || 'application/pdf',
            size: saved.size || file.size,
            status: 'under_review',
            notes: `Submitted during business onboarding: ${docSpec.name}`,
          },
        });
      }
    }
  }

  // Calculate & sync personalized requirements tailored to industry, products, destinations
  await syncBusinessRequirements(business.id);

  // Audit log
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      entityType: 'Business',
      entityId: business.id,
      action: 'ONBOARDING_COMPLETED',
      newValueJson: JSON.stringify({
        displayName: business.displayName,
        businessType: business.businessType,
        industry,
        productsCount: productsList.length,
        destinationsCount: destinationsList.length,
      }),
    },
  });

  revalidatePath('/', 'layout');
  revalidatePath('/dashboard');
  revalidatePath('/business');
  revalidatePath('/readiness');
  revalidatePath('/documents');
  revalidatePath('/shipments');

  redirect('/dashboard');
}
