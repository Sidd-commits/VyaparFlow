import React from 'react';
import { redirect } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { requireAuth } from '@/app/actions';
import { prisma } from '@/lib/prisma';
import { ensureProviderProfile } from '@/lib/services/setupProvider';
import ProviderStatsHeader from '@/components/provider/ProviderStatsHeader';
import ProviderTabsContainer from '@/components/provider/ProviderTabsContainer';

export const dynamic = 'force-dynamic';

export default async function ProviderPage() {
  const { role, user } = await requireAuth();

  // Enforce strict Role-Based Access Control
  if (role !== 'PROVIDER' && role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Ensure provider profile entity and seed tasks if empty
  const provider = await ensureProviderProfile(
    user?.id || 'demo_provider',
    user?.email || 'provider@freight.com',
    user?.name || 'Partner Trade Services'
  );

  // Fetch all tasks for this provider (or all tasks if platform admin)
  const isPlatformAdmin = role === 'ADMIN';

  const [providerTasks, allShipments, submittedQuotes] = await Promise.all([
    prisma.providerTask.findMany({
      where: isPlatformAdmin
        ? {}
        : {
            OR: [
              { providerId: provider.id },
              { provider: { type: provider.type } },
            ],
          },
      include: {
        provider: true,
        shipment: {
          include: {
            business: true,
            product: true,
            destinationCountry: true,
          },
        },
        requirement: {
          include: {
            documents: { orderBy: { uploadedAt: 'desc' } },
            productCountry: {
              include: {
                product: { include: { business: true } },
                country: true,
              },
            },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    }),

    prisma.shipment.findMany({
      include: {
        business: true,
        product: true,
        destinationCountry: true,
        quotes: {
          include: {
            provider: true,
          },
        },
        trackingEvents: {
          orderBy: { timestamp: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),

    prisma.quote.findMany({
      where: isPlatformAdmin ? {} : { providerId: provider.id },
      include: {
        provider: true,
        shipment: {
          include: {
            business: true,
            product: true,
            destinationCountry: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    }),
  ]);

  // Open RFQs (Shipments in Draft / Preparation that can receive bids)
  const openShipments = allShipments.filter(
    (shp) => shp.status === 'Draft' || shp.status === 'Preparation' || shp.quotes.length > 0
  );

  // Assigned Shipments (Shipments where this provider's quote is selected, or tasks assigned, or active)
  const assignedShipments = allShipments.filter(
    (shp) =>
      isPlatformAdmin ||
      shp.quotes.some((q) => q.providerId === provider.id) ||
      providerTasks.some((t) => t.shipmentId === shp.id) ||
      shp.status !== 'Draft'
  );

  // Calculate Metrics
  const pendingTasksCount = providerTasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'rejected' && t.requirement?.status !== 'verified'
  ).length;

  const completedTasksCount = providerTasks.filter(
    (t) => t.status === 'completed' || t.requirement?.status === 'verified'
  ).length;

  const activeShipmentsCount = assignedShipments.filter(
    (s) => s.status !== 'Delivered' && s.status !== 'Draft'
  ).length;

  return (
    <AppShell currentRole={role} userEmail={user?.email} userName={user?.name}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Top Operational Telemetry & KPI Header */}
        <ProviderStatsHeader
          providerName={provider.name}
          providerType={provider.type}
          serviceArea={provider.serviceArea}
          totalTasks={providerTasks.length}
          pendingTasksCount={pendingTasksCount}
          openRfqsCount={openShipments.length}
          activeShipmentsCount={activeShipmentsCount}
          completedTasksCount={completedTasksCount}
        />

        {/* Dynamic Multi-Disciplinary Workspaces Container */}
        <ProviderTabsContainer
          provider={provider}
          tasks={providerTasks}
          openShipments={openShipments}
          submittedQuotes={submittedQuotes}
          assignedShipments={assignedShipments.length > 0 ? assignedShipments : openShipments}
        />
      </div>
    </AppShell>
  );
}
