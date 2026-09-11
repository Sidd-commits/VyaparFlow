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

// Cookie key for active persona
const PERSONA_COOKIE = 'vyaparflow_active_role';
const USER_ID_COOKIE = 'vyaparflow_active_user_id';

export async function getActiveUser(): Promise<{
  user: any | null;
  role: 'MSME' | 'PROVIDER' | 'ADMIN' | null;
}> {
  const cookieStore = await cookies();
  const userIdVal = cookieStore.get(USER_ID_COOKIE)?.value;

  if (userIdVal) {
    let user = await prisma.user.findUnique({
      where: { id: userIdVal },
      include: { 
        businesses: { 
          include: { 
            products: { 
              include: { 
                destinations: { include: { country: true, requirements: true } } 
              } 
            },
            shipments: true,
          } 
        },
        providers: true 
      },
    });

    if (user) {
      const activeRole = (user.role || 'MSME') as 'MSME' | 'PROVIDER' | 'ADMIN';

      // If MSME user does not have a business record yet, ensure tailored MSME business setup
      if (activeRole === 'MSME' && user.businesses.length === 0) {
        await ensureMSMEBusiness(user.id, user.name, user.email);
        user = await prisma.user.findUnique({
          where: { id: userIdVal },
          include: { 
            businesses: { 
              include: { 
                products: { 
                  include: { 
                    destinations: { include: { country: true, requirements: true } } 
                  } 
                },
                shipments: true,
              } 
            },
            providers: true 
          },
        });
      }

      return { user, role: activeRole };
    }
  }

  // No active user / unauthenticated guest state
  return { user: null, role: null };
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
  cookieStore.delete(USER_ID_COOKIE);
  cookieStore.delete(PERSONA_COOKIE);
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function uploadDocumentAction(formData: FormData): Promise<void> {
  const requirementId = formData.get('requirementId') as string;
  const businessId = formData.get('businessId') as string;
  const docType = formData.get('docType') as string;
  const file = formData.get('file') as File | null;
  const notes = formData.get('notes') as string;

  if (!businessId) {
    throw new Error('Business ID is required for document upload');
  }

  const saved = await saveFileLocally(file, docType || 'doc');
  const filename = saved?.name || file?.name || `${docType}_Sample_Evidence.pdf`;
  const storageKey = saved?.storageKey || `uploads/${Date.now()}_${filename.replace(/\s+/g, '_')}`;

  await prisma.document.create({
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
      notes: notes || 'Uploaded for export readiness verification.',
    },
  });

  if (requirementId) {
    await prisma.requirement.update({
      where: { id: requirementId },
      data: {
        status: 'under_review',
        reason: 'Document uploaded successfully. Awaiting platform verification.',
      },
    });
  }

  revalidatePath('/dashboard');
  revalidatePath('/documents');
  revalidatePath('/readiness');
}

export async function verifyDocumentAction(documentId: string, status: 'verified' | 'rejected', notes?: string): Promise<void> {
  const doc = await prisma.document.update({
    where: { id: documentId },
    data: {
      status,
      notes: notes || (status === 'verified' ? 'Document verified by Platform Admin.' : 'Rejected due to legibility/format error.'),
    },
  });

  if (doc.requirementId) {
    await prisma.requirement.update({
      where: { id: doc.requirementId },
      data: {
        status,
        reason: status === 'verified' ? 'Requirement verified with document proof.' : 'Uploaded document rejected.',
        completedAt: status === 'verified' ? new Date() : null,
      },
    });
  }

  const { user } = await getActiveUser();
  if (user) {
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        entityType: 'Document',
        entityId: documentId,
        action: status === 'verified' ? 'VERIFY_DOCUMENT' : 'REJECT_DOCUMENT',
        newValueJson: JSON.stringify({ status, notes }),
      },
    });
  }

  revalidatePath('/dashboard');
  revalidatePath('/documents');
  revalidatePath('/readiness');
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
    cookieStore.set(USER_ID_COOKIE, existing.id, { path: '/' });
    cookieStore.set(PERSONA_COOKIE, role || existing.role, { path: '/' });
    revalidatePath('/', 'layout');
    redirect('/dashboard');
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
      cookieStore.set(USER_ID_COOKIE, fallbackUser.id, { path: '/' });
      cookieStore.set(PERSONA_COOKIE, fallbackUser.role, { path: '/' });
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
  cookieStore.set(USER_ID_COOKIE, newUser.id, { path: '/' });
  cookieStore.set(PERSONA_COOKIE, newUser.role, { path: '/' });
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
}

export async function updateBusinessRegistrationsAction(formData: FormData): Promise<void> {
  const businessId = formData.get('businessId') as string;
  const gstNumber = formData.get('gstNumber') as string;
  const iecCode = formData.get('iecCode') as string;
  const gstFile = formData.get('gstFile') as File | null;
  const iecFile = formData.get('iecFile') as File | null;

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

  let targetBusinessId = businessId;

  // If businessId is missing or empty, try to resolve from active user or fallback business
  if (!targetBusinessId) {
    const { user } = await getActiveUser();
    if (user?.businesses?.[0]?.id) {
      targetBusinessId = user.businesses[0].id;
    } else {
      const fallbackBiz = await prisma.business.findFirst();
      if (fallbackBiz) targetBusinessId = fallbackBiz.id;
    }
  }

  if (!targetBusinessId) {
    throw new Error('No business record found to update. Please register or select an MSME business account.');
  }

  const existingBiz = await prisma.business.findUnique({
    where: { id: targetBusinessId },
  });

  if (!existingBiz) {
    const fallbackBiz = await prisma.business.findFirst();
    if (fallbackBiz) {
      targetBusinessId = fallbackBiz.id;
    } else {
      throw new Error(`Business record '${targetBusinessId}' was not found in the database.`);
    }
  }

  await prisma.business.update({
    where: { id: targetBusinessId },
    data: updateData,
  });

  const business = await prisma.business.findUnique({
    where: { id: targetBusinessId },
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
                businessId: targetBusinessId,
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
                businessId: targetBusinessId,
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



