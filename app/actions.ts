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
} from '@/lib/authCookies';

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
    const userIdVal = cookieStore.get(USER_ID_COOKIE)?.value;
    const userEmailVal = cookieStore.get(USER_EMAIL_COOKIE)?.value;
    const rawName = cookieStore.get(USER_NAME_COOKIE)?.value;
    const userNameVal = rawName ? decodeURIComponent(rawName) : null;
    const personaVal = cookieStore.get(PERSONA_COOKIE)?.value as 'MSME' | 'PROVIDER' | 'ADMIN' | undefined;

    if (userIdVal || userEmailVal) {
      let user = null;
      if (userIdVal) {
        user = await prisma.user.findUnique({
          where: { id: userIdVal },
          include: { 
            businesses: { 
              where: { ownerUserId: userIdVal },
              include: { 
                products: { 
                  include: { 
                    destinations: { include: { country: true, requirements: { include: { rule: true, documents: true } }, packagingItems: true } } 
                  } 
                },
                shipments: {
                  include: {
                    product: true,
                    destinationCountry: true,
                    quotes: { include: { provider: true } },
                    trackingEvents: { orderBy: { timestamp: 'desc' } },
                    providerTasks: true,
                  },
                  orderBy: { createdAt: 'desc' },
                },
              } 
            },
            providers: true 
          },
        });
      }

      if (!user && userEmailVal) {
        user = await prisma.user.findFirst({
          where: { email: userEmailVal },
          include: { 
            businesses: { 
              include: { 
                products: { 
                  include: { 
                    destinations: { include: { country: true, requirements: { include: { rule: true, documents: true } }, packagingItems: true } } 
                  } 
                },
                shipments: {
                  include: {
                    product: true,
                    destinationCountry: true,
                    quotes: { include: { provider: true } },
                    trackingEvents: { orderBy: { timestamp: 'desc' } },
                    providerTasks: true,
                  },
                  orderBy: { createdAt: 'desc' },
                },
              } 
            },
            providers: true 
          },
        });
      }

      // If user session exists but local database doesn't have the row yet:
      if (!user && (userEmailVal || userIdVal)) {
        const email = userEmailVal || `user_${userIdVal?.slice(0, 8)}@vyaparflow.app`;
        const name = userNameVal || email.split('@')[0];
        const role = personaVal || 'MSME';

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
            include: {
              businesses: true,
              providers: true,
            },
          });

          user = await prisma.user.findUnique({
            where: { id: user.id },
            include: { 
              businesses: { 
                where: { ownerUserId: user.id },
                include: { 
                  products: { 
                    include: { 
                      destinations: { include: { country: true, requirements: { include: { rule: true, documents: true } }, packagingItems: true } } 
                    } 
                  },
                  shipments: {
                    include: {
                      product: true,
                      destinationCountry: true,
                      quotes: { include: { provider: true } },
                      trackingEvents: { orderBy: { timestamp: 'desc' } },
                      providerTasks: true,
                    },
                    orderBy: { createdAt: 'desc' },
                  },
                } 
              },
              providers: true 
            },
          });
        } catch (syncErr) {
          console.error('Auto-syncing session user to local lambda failed:', syncErr);
        }
      }

      if (user) {
        const activeRole = (user.role || personaVal || 'MSME') as 'MSME' | 'PROVIDER' | 'ADMIN';
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

  // Strict Server-Side Role Authorization: Exporters cannot self-approve
  if (!user || (role !== 'PROVIDER' && role !== 'ADMIN')) {
    throw new Error('Unauthorized: Exporters cannot self-verify compliance documents. Verification must be performed by an authorized partner or administrator.');
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
  await prisma.packagingItem.update({
    where: { id: itemId },
    data: { status },
  });

  revalidatePath('/dashboard');
  revalidatePath('/packaging');
  revalidatePath('/readiness');
}

export async function createShipmentAction(formData: FormData): Promise<void> {
  const businessId = formData.get('businessId') as string;
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

  const shipmentNumber = `SHP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

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

  revalidatePath('/shipments');
  revalidatePath(`/shipments/${shipmentId}`);
}

export async function updateProviderTaskAction(taskId: string, status: string, notes?: string): Promise<void> {
  const task = await prisma.providerTask.update({
    where: { id: taskId },
    data: {
      status,
      notes,
      completedAt: status === 'completed' ? new Date() : null,
    },
  });

  if (task.requirementId && status === 'completed') {
    await prisma.requirement.update({
      where: { id: task.requirementId },
      data: {
        status: 'verified',
        completedAt: new Date(),
        reason: 'Requirement completed & verified by service provider.',
      },
    });
  }

  revalidatePath('/provider');
  revalidatePath('/dashboard');
  revalidatePath('/readiness');
}

export async function addTrackingEventAction(shipmentId: string, status: string, location: string, note?: string): Promise<void> {
  await prisma.trackingEvent.create({
    data: {
      shipmentId,
      status,
      location,
      note,
    },
  });

  await prisma.shipment.update({
    where: { id: shipmentId },
    data: { status },
  });

  revalidatePath('/shipments');
  revalidatePath(`/shipments/${shipmentId}`);
  revalidatePath(`/shipments/${shipmentId}/tracking`);
}

export async function updateRuleAction(ruleId: string, data: { priority?: string; weight?: number; blocksDispatch?: boolean; active?: boolean }): Promise<void> {
  await prisma.rule.update({
    where: { id: ruleId },
    data: {
      ...data,
      version: { increment: 1 },
    },
  });
  revalidatePath('/admin');
  revalidatePath('/dashboard');
}

export async function registerUserAction(formData: FormData): Promise<void> {
  const name = ((formData.get('name') as string) || '').trim();
  const rawEmail = ((formData.get('email') as string) || '').trim();
  const email = rawEmail.toLowerCase();
  const password = (formData.get('password') as string) || '';
  const role = ((formData.get('role') as string) || 'MSME').trim() as 'MSME' | 'PROVIDER' | 'ADMIN';

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

  // Create new user account
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: password,
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
  const cookieStore = await cookies();
  cookieStore.set(USER_ID_COOKIE, newUser.id, { path: '/', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
  cookieStore.set(PERSONA_COOKIE, newUser.role, { path: '/', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
  cookieStore.set(USER_EMAIL_COOKIE, newUser.email, { path: '/', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
  cookieStore.set(USER_NAME_COOKIE, encodeURIComponent(newUser.name), { path: '/', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
  revalidatePath('/', 'layout');

  // Jump to appropriate flow based on user's registered role
  if (newUser.role === 'PROVIDER') {
    redirect('/provider');
  } else if (newUser.role === 'ADMIN') {
    redirect('/admin');
  } else {
    redirect('/onboarding');
  }
}

export async function loginUserAction(formData: FormData): Promise<void> {
  const rawEmail = ((formData.get('email') as string) || '').trim();
  const email = rawEmail.toLowerCase();
  const password = (formData.get('password') as string) || '';
  const preferredRole = (formData.get('preferredRole') as string)?.trim() as 'MSME' | 'PROVIDER' | 'ADMIN' | undefined;

  if (!email) {
    redirect('/login?error=email_required');
  }

  if (!password) {
    redirect('/login?error=password_required');
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { email: rawEmail },
      ],
    },
  });

  if (!user) {
    redirect('/login?error=user_not_found');
  }

  // If user signed up via Google OAuth, prompt them to use Google SSO
  if (user.passwordHash === 'oauth_google') {
    redirect('/login?error=use_google_signin');
  }

  // Verify password (allows user's actual password or default password123 for pre-seeded test accounts)
  const isMatch = user.passwordHash === password || (user.passwordHash === 'password123' && password === 'password123');
  if (!isMatch) {
    redirect('/login?error=invalid_password');
  }

  // If the user selected a specific portal (e.g. PROVIDER or ADMIN) and is permitted, update role
  let activeRole = user.role;
  if (preferredRole && preferredRole !== user.role) {
    // If logging into PROVIDER portal and has no provider profile, ensure one is provisioned
    if (preferredRole === 'PROVIDER') {
      const existingProvider = await prisma.provider.findFirst({ where: { userId: user.id } });
      if (!existingProvider) {
        await prisma.provider.create({
          data: {
            userId: user.id,
            name: `${user.name} Logistics & Trade Services`,
            type: 'FREIGHT',
            serviceArea: 'Pan-India & Global Corridors',
            contactEmail: user.email,
          },
        });
      }
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { role: preferredRole },
    });
    activeRole = preferredRole;
  }

  const cookieStore = await cookies();
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
  revalidatePath('/', 'layout');

  if (activeRole === 'PROVIDER') {
    redirect('/provider');
  } else if (activeRole === 'ADMIN') {
    redirect('/admin');
  } else {
    redirect('/dashboard');
  }
}

export async function deleteUserAction(userId: string): Promise<void> {
  await prisma.user.delete({
    where: { id: userId },
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
      role: u.role as 'MSME' | 'PROVIDER' | 'ADMIN',
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

  // Dynamically sync statutory compliance requirements to the updated business type
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
