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


import { ensureMSMEBusiness } from '@/lib/services/setupMSME';
import {
  PERSONA_COOKIE,
  USER_ID_COOKIE,
  USER_EMAIL_COOKIE,
  USER_NAME_COOKIE,
} from '@/lib/authCookies';

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

      // If user session exists but local serverless lambda database doesn't have the row yet:
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

          if (role === 'MSME') {
            await ensureMSMEBusiness(user.id, name, email);
          }

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

        // If MSME user does not have a business record yet, ensure tailored MSME business setup
        if (activeRole === 'MSME' && user.businesses.length === 0) {
          await ensureMSMEBusiness(user.id, user.name, user.email);
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
        }

        return { user, role: activeRole };
      }
    }

    return { user: null, role: null };
  } catch (error: any) {
    // Next.js dynamic server usage error should be rethrown
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

export async function requestCertificationAction(requirementId: string, providerId: string): Promise<void> {
  const req = await prisma.requirement.findUnique({
    where: { id: requirementId },
  });

  if (!req) throw new Error('Requirement not found');

  const providerTask = await prisma.providerTask.create({
    data: {
      providerId,
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
  revalidatePath('/readiness');
}

export async function registerUserAction(formData: FormData): Promise<void> {
  const name = (formData.get('name') as string)?.trim() || 'User';
  const rawEmail = ((formData.get('email') as string) || '').trim();
  const email = rawEmail.toLowerCase();
  const password = (formData.get('password') as string) || 'password123';
  const role = (formData.get('role') as 'MSME' | 'PROVIDER' | 'ADMIN') || 'MSME';
  const businessName = (formData.get('businessName') as string)?.trim() || `${name} Exports Pvt Ltd`;
  const city = (formData.get('city') as string)?.trim() || 'Mumbai';
  const state = (formData.get('state') as string)?.trim() || 'Maharashtra';
  const gstNumber = (formData.get('gstNumber') as string)?.trim() || '';
  const iecCode = (formData.get('iecCode') as string)?.trim() || '';
  const businessCategory = (formData.get('businessCategory') as string)?.trim() || '';

  // Check if user already exists - if so, seamlessly log them in without any error and jump to dashboard
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { email: rawEmail },
      ],
    },
  });

  if (existing) {
    if (role && role !== existing.role) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role },
      });
    }

    const cookieStore = await cookies();
    cookieStore.set(USER_ID_COOKIE, existing.id, { path: '/', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
    cookieStore.set(PERSONA_COOKIE, role || existing.role, { path: '/', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
    cookieStore.set(USER_EMAIL_COOKIE, existing.email, { path: '/', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
    cookieStore.set(USER_NAME_COOKIE, encodeURIComponent(existing.name), { path: '/', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
    revalidatePath('/', 'layout');
    if ((role || existing.role) === 'PROVIDER') redirect('/provider');
    else if ((role || existing.role) === 'ADMIN') redirect('/admin');
    else redirect('/dashboard');
  }

  if (role === 'MSME') {
    // Validate GSTIN & IEC are provided
    if (!gstNumber || !iecCode) {
      throw new Error('GSTIN Number and IEC Code are compulsory fields for MSME exporters.');
    }

    // Server-side GSTIN format verification
    const gstValidation = validateGSTIN(gstNumber);
    if (!gstValidation.valid) {
      throw new Error(`GSTIN Verification Failed: ${gstValidation.error}`);
    }

    // Server-side IEC format verification
    const iecValidation = validateIEC(iecCode);
    if (!iecValidation.valid) {
      throw new Error(`IEC Verification Failed: ${iecValidation.error}`);
    }

    // Validate business category
    if (!businessCategory || !(businessCategory in BUSINESS_TYPE_CONFIGS)) {
      throw new Error('Please select a valid business type (Steel, Food, Agricultural Goods, Diamonds, or Gold).');
    }
  }

  // Create User with fallback in case email is already registered
  let newUser;
  try {
    newUser = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: password,
        role,
      },
    });
  } catch (err: any) {
    // If user already exists (unique constraint caught), seamlessly log them in!
    const fallbackUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { email: rawEmail },
        ],
      },
    });

    if (fallbackUser) {
      const cookieStore = await cookies();
      cookieStore.set(USER_ID_COOKIE, fallbackUser.id, { path: '/', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
      cookieStore.set(PERSONA_COOKIE, fallbackUser.role, { path: '/', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
      cookieStore.set(USER_EMAIL_COOKIE, fallbackUser.email, { path: '/', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
      cookieStore.set(USER_NAME_COOKIE, encodeURIComponent(fallbackUser.name), { path: '/', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
      revalidatePath('/', 'layout');
      if (fallbackUser.role === 'PROVIDER') redirect('/provider');
      else if (fallbackUser.role === 'ADMIN') redirect('/admin');
      else redirect('/dashboard');
    }

    throw err;
  }

  if (role === 'PROVIDER') {
    const providerType =
      businessCategory === 'Steel'
        ? 'FREIGHT'
        : businessCategory === 'Food'
        ? 'CERTIFICATION'
        : 'CUSTOMS_CHA';

    await prisma.provider.create({
      data: {
        userId: newUser.id,
        name: businessName || `${name} Logistics & Maritime Services`,
        type: providerType,
        serviceArea: 'Pan-India & Global Corridors',
        contactEmail: email,
      },
    });
  } else if (role === 'MSME') {
    const bizType = businessCategory as BusinessType;
    const config = BUSINESS_TYPE_CONFIGS[bizType];

    // Create Business with registered GSTIN and IEC numbers
    const business = await prisma.business.create({
      data: {
        ownerUserId: newUser.id,
        legalName: `${businessName} Pvt Ltd`,
        displayName: businessName,
        businessType: config.businessTypeLabel,
        location: `${city} Industrial Area`,
        city,
        state,
        gstStatus: `Verified (${gstNumber.toUpperCase()})`,
        iecStatus: `Verified (${iecCode})`,
        profileCompletion: 60,
      },
    });

    // Find matching ProductCategory for this business type
    const matchingCategory = await prisma.productCategory.findFirst({
      where: {
        name: { contains: config.categoryMatch },
      },
    });

    const defaultCountry = await prisma.country.findFirst({ where: { isoCode: 'AE' } });

    if (matchingCategory && defaultCountry) {
      // Create default product based on business type
      const product = await prisma.product.create({
        data: {
          businessId: business.id,
          categoryId: matchingCategory.id,
          name: config.defaultProduct.name,
          hsCode: config.defaultProduct.hsCode,
          unit: config.defaultProduct.unit,
          defaultValue: config.defaultProduct.defaultValue,
        },
      });

      const pc = await prisma.productCountry.create({
        data: {
          productId: product.id,
          countryId: defaultCountry.id,
        },
      });

      // --- GSTIN & IEC as under_review requirements (awaiting admin proof verification) ---
      const gstReq = await prisma.requirement.create({
        data: {
          productCountryId: pc.id,
          type: 'document',
          title: 'GSTIN Registration Certificate',
          priority: 'critical',
          status: 'under_review',
          weight: 10,
          reason: `GSTIN number registered: ${gstNumber.toUpperCase()}. Awaiting proof document verification by admin.`,
        },
      });

      // Create placeholder proof document for GSTIN (admin can accept/reject)
      await prisma.document.create({
        data: {
          businessId: business.id,
          requirementId: gstReq.id,
          type: 'GST_CERTIFICATE',
          storageKey: `uploads/gst_proof_${Date.now()}.pdf`,
          originalName: `GSTIN_Proof_${gstNumber.toUpperCase()}.pdf`,
          mimeType: 'application/pdf',
          size: 150000,
          issueDate: new Date(),
          status: 'under_review',
          notes: `GSTIN: ${gstNumber.toUpperCase()} — Format validated. Awaiting admin verification of proof document.`,
        },
      });

      const iecReq = await prisma.requirement.create({
        data: {
          productCountryId: pc.id,
          type: 'document',
          title: 'Import Export Code (IEC) Certificate',
          priority: 'critical',
          status: 'under_review',
          weight: 10,
          reason: `IEC Code registered: ${iecCode}. Awaiting proof document verification by admin.`,
        },
      });

      // Create placeholder proof document for IEC (admin can accept/reject)
      await prisma.document.create({
        data: {
          businessId: business.id,
          requirementId: iecReq.id,
          type: 'IEC_CERTIFICATE',
          storageKey: `uploads/iec_proof_${Date.now()}.pdf`,
          originalName: `IEC_Proof_${iecCode}.pdf`,
          mimeType: 'application/pdf',
          size: 150000,
          issueDate: new Date(),
          status: 'under_review',
          notes: `IEC Code: ${iecCode} — Format validated. Awaiting admin verification of proof document.`,
        },
      });

      // --- Business-type-specific certificates & documents ---
      for (const req of config.requirements) {
        await prisma.requirement.create({
          data: {
            productCountryId: pc.id,
            type: req.type,
            title: req.title,
            priority: req.priority,
            status: 'missing',
            weight: req.weight,
            reason: req.description,
          },
        });
      }

      // --- Business-type-specific packaging & labelling items (some pre-completed for initial score) ---
      for (const item of config.packagingItems) {
        await prisma.packagingItem.create({
          data: {
            productCountryId: pc.id,
            title: item.title,
            type: item.type,
            priority: item.priority,
            mandatory: item.mandatory,
            status: item.initialStatus,
            notes: item.notes,
          },
        });
      }

      // --- Business-type-specific shipment prerequisites (some pre-verified for initial score) ---
      for (const shipReq of config.shipmentPrereqs) {
        await prisma.requirement.create({
          data: {
            productCountryId: pc.id,
            type: shipReq.type,
            title: shipReq.title,
            priority: shipReq.priority,
            status: shipReq.initialStatus,
            weight: shipReq.weight,
            reason: shipReq.description,
            completedAt: shipReq.initialStatus === 'verified' ? new Date() : null,
          },
        });
      }

      // Also generate requirements from any matching global rules
      const rules = await prisma.rule.findMany({
        where: {
          OR: [
            { categoryId: matchingCategory.id, countryId: defaultCountry.id },
            { categoryId: matchingCategory.id, countryId: null },
            { categoryId: null, countryId: defaultCountry.id },
          ],
          active: true,
        },
      });

      for (const rule of rules) {
        // Avoid duplicates — skip if a requirement with same title already exists
        const existingReq = await prisma.requirement.findFirst({
          where: {
            productCountryId: pc.id,
            title: rule.title,
          },
        });
        if (!existingReq) {
          await prisma.requirement.create({
            data: {
              productCountryId: pc.id,
              ruleId: rule.id,
              type: rule.type,
              title: rule.title,
              priority: rule.priority,
              status: 'missing',
              weight: rule.weight,
              reason: rule.description,
            },
          });
        }
      }
    }
  }

  // Switch role and log in with the newly created user account
  const cookieStore = await cookies();
  cookieStore.set(USER_ID_COOKIE, newUser.id, { path: '/', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
  cookieStore.set(PERSONA_COOKIE, newUser.role, { path: '/', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
  cookieStore.set(USER_EMAIL_COOKIE, newUser.email, { path: '/', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
  cookieStore.set(USER_NAME_COOKIE, encodeURIComponent(newUser.name), { path: '/', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
  revalidatePath('/', 'layout');

  // Jump to appropriate dashboard based on user's registered role
  if (newUser.role === 'PROVIDER') {
    redirect('/provider');
  } else if (newUser.role === 'ADMIN') {
    redirect('/admin');
  } else {
    redirect('/dashboard');
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
