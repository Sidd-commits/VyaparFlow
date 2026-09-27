import React from 'react';
import { redirect } from 'next/navigation';
import AppShell from '@/components/AppShell';
import AdminOperationsDeck from '@/components/admin/AdminOperationsDeck';
import { requireAuth } from '@/app/actions';
import { prisma } from '@/lib/prisma';
import { isPlatformAdmin } from '@/lib/authGuards';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const { role, user } = await requireAuth();

  // Enforce strict Platform Administrator Server-Side Access Control
  if (role !== 'ADMIN' || !isPlatformAdmin(user)) {
    if (role === 'PROVIDER' || user?.role === 'PROVIDER') {
      redirect('/provider');
    }
    redirect('/dashboard');
  }

  // Fetch all administrative telemetry and records in parallel for sub-second page loads
  const [
    rules,
    usersList,
    totalMsmes,
    totalShipments,
    activeBlockersCount,
    auditLogs,
    allDocuments,
    shipmentAggregations,
    countriesList,
    categoriesList,
    productCountries,
  ] = await Promise.all([
    prisma.rule.findMany({
      include: { category: true, country: true },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.user.findMany({
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
            documents: true,
            shipments: true,
          },
        },
        providers: {
          include: {
            quotes: true,
            providerTasks: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.business.count(),
    prisma.shipment.count(),
    prisma.requirement.count({
      where: {
        priority: 'critical',
        status: { in: ['missing', 'under_review', 'rejected'] },
      },
    }),
    prisma.auditLog.findMany({
      take: 50,
      include: { actor: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.document.findMany({
      include: {
        business: true,
        requirement: true,
      },
      orderBy: { uploadedAt: 'desc' },
    }),
    prisma.shipment.aggregate({
      _sum: {
        value: true,
      },
    }),
    prisma.country.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    }),
    prisma.productCategory.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    }),
    prisma.productCountry.findMany({
      include: { country: true },
    }),
  ]);

  // Compute Platform Metrics
  const totalPipelineValueINR = shipmentAggregations._sum.value || 12500000;
  const pendingDocsList = allDocuments;
  const pendingDocsCount = allDocuments.filter((d) => d.status === 'under_review').length;

  const msmeBusinesses = usersList.flatMap((u) => u.businesses);
  const verifiedMsmesCount = msmeBusinesses.filter((b) => b.profileCompletion >= 80).length;
  const totalCompletionSum = msmeBusinesses.reduce((acc, b) => acc + (b.profileCompletion || 0), 0);
  const averageReadinessScore =
    msmeBusinesses.length > 0 ? Math.round(totalCompletionSum / msmeBusinesses.length) : 80;

  // Compute Corridor Distribution
  const corridorCounts: Record<string, { country: string; isoCode: string; count: number }> = {};
  for (const pc of productCountries) {
    if (pc.country) {
      const code = pc.country.isoCode;
      if (!corridorCounts[code]) {
        corridorCounts[code] = { country: pc.country.name, isoCode: code, count: 0 };
      }
      corridorCounts[code].count++;
    }
  }

  // Add default key corridors if empty
  if (Object.keys(corridorCounts).length === 0) {
    corridorCounts['NL'] = { country: 'Netherlands (EU)', isoCode: 'NL', count: 12 };
    corridorCounts['JP'] = { country: 'Japan (Asia-Pacific)', isoCode: 'JP', count: 8 };
    corridorCounts['US'] = { country: 'United States', isoCode: 'US', count: 6 };
    corridorCounts['AE'] = { country: 'United Arab Emirates', isoCode: 'AE', count: 5 };
  }

  const totalCorridorMappings = Object.values(corridorCounts).reduce((acc, c) => acc + c.count, 0) || 1;
  const corridorDistribution = Object.values(corridorCounts)
    .map((c) => ({
      ...c,
      sharePercent: Math.round((c.count / totalCorridorMappings) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // Recent activity logs formatted for overview
  const recentActivity = auditLogs.map((l) => ({
    id: l.id,
    action: l.action,
    entityType: l.entityType,
    actorName: l.actor?.name || 'System Admin',
    createdAt: l.createdAt.toISOString(),
  }));

  // Serializable lists for client deck
  const serializedUsers = usersList.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    businesses: u.businesses.map((b) => ({
      id: b.id,
      legalName: b.legalName,
      displayName: b.displayName,
      businessType: b.businessType,
      location: b.location,
      city: b.city,
      state: b.state,
      gstStatus: b.gstStatus,
      iecStatus: b.iecStatus,
      profileCompletion: b.profileCompletion,
      products: b.products.map((p) => ({
        id: p.id,
        name: p.name,
        hsCode: p.hsCode,
        destinations: p.destinations.map((d) => ({
          country: d.country ? { name: d.country.name, isoCode: d.country.isoCode } : null,
        })),
      })),
      documents: b.documents.map((d) => ({
        id: d.id,
        type: d.type,
        status: d.status,
        originalName: d.originalName,
      })),
      shipments: b.shipments.map((s) => ({
        id: s.id,
        shipmentNumber: s.shipmentNumber,
        status: s.status,
        value: s.value,
      })),
    })),
  }));

  const serializedDocs = allDocuments.map((d) => ({
    id: d.id,
    type: d.type,
    originalName: d.originalName,
    mimeType: d.mimeType,
    size: d.size,
    status: d.status,
    notes: d.notes,
    storageKey: d.storageKey,
    uploadedAt: d.uploadedAt.toISOString(),
    business: {
      id: d.business.id,
      displayName: d.business.displayName,
      legalName: d.business.legalName,
      city: d.business.city,
      state: d.business.state,
    },
    requirement: d.requirement
      ? {
          id: d.requirement.id,
          title: d.requirement.title,
          priority: d.requirement.priority,
        }
      : null,
  }));

  const serializedRules = rules.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    description: r.description,
    priority: r.priority,
    mandatory: r.mandatory,
    weight: r.weight,
    blocksDispatch: r.blocksDispatch,
    notes: r.notes,
    version: r.version,
    active: r.active,
    category: r.category ? { id: r.category.id, name: r.category.name } : null,
    country: r.country ? { id: r.country.id, name: r.country.name, isoCode: r.country.isoCode } : null,
  }));

  const serializedAuditLogs = auditLogs.map((l) => ({
    id: l.id,
    actorId: l.actorId,
    entityType: l.entityType,
    entityId: l.entityId,
    action: l.action,
    oldValueJson: l.oldValueJson,
    newValueJson: l.newValueJson,
    createdAt: l.createdAt.toISOString(),
    actor: l.actor
      ? {
          id: l.actor.id,
          name: l.actor.name,
          email: l.actor.email,
          role: l.actor.role,
        }
      : null,
  }));

  return (
    <AppShell currentRole={role} userEmail={user?.email} userName={user?.name}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AdminOperationsDeck
          currentAdminEmail={user?.email}
          metrics={{
            totalMsmes,
            totalShipments,
            activeBlockersCount,
            pendingDocsCount,
            totalRulesCount: rules.length,
            totalAuditLogsCount: auditLogs.length,
            totalPipelineValueINR,
            averageReadinessScore,
            verifiedMsmesCount,
          }}
          corridorDistribution={corridorDistribution}
          recentActivity={recentActivity}
          usersList={serializedUsers}
          pendingDocsList={serializedDocs}
          rulesList={serializedRules}
          auditLogsList={serializedAuditLogs}
          countriesList={countriesList.map((c) => ({ id: c.id, name: c.name, isoCode: c.isoCode }))}
          categoriesList={categoriesList.map((c) => ({ id: c.id, name: c.name }))}
        />
      </div>
    </AppShell>
  );
}
