import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AppShell from '@/components/AppShell';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ExportReadinessSummary from '@/components/dashboard/ExportReadinessSummary';
import AttentionRequiredSection from '@/components/dashboard/AttentionRequiredSection';
import ActiveShipmentCard from '@/components/dashboard/ActiveShipmentCard';
import QuickNavActions from '@/components/dashboard/QuickNavActions';
import TariffIntelligenceCard from '@/components/dashboard/TariffIntelligenceCard';
import { requireAuth } from '@/app/actions';
import { prisma } from '@/lib/prisma';
import { calculateReadinessScore } from '@/lib/services/readiness';
import { getTariffIntelligence } from '@/lib/services/applicability';
import { ArrowRight, Plus } from 'lucide-react';

export default async function DashboardPage() {
  const { role, user } = await requireAuth();

  // Enforce strict Role-Based Access Control
  if (role === 'PROVIDER') {
    redirect('/provider');
  }

  if (role === 'ADMIN') {
    redirect('/admin');
  }

  // Scoped strictly to authenticated user's owned business
  const business = user?.businesses?.[0];

  // If the user has not completed onboarding setup, guide them to complete onboarding
  if (!business || (business.profileCompletion && business.profileCompletion < 50) || !business.products || business.products.length === 0) {
    redirect('/onboarding');
  }

  const product = business?.products?.[0];
  const destination = product?.destinations?.[0];

  let readinessData = null;
  if (destination) {
    try {
      readinessData = await calculateReadinessScore(destination.id);
    } catch (e) {
      console.error('Error calculating readiness score:', e);
    }
  }

  // Get active shipment for this business
  const activeShipment = business?.id
    ? await prisma.shipment.findFirst({
        where: { businessId: business.id },
        include: {
          product: true,
          destinationCountry: true,
          quotes: { include: { provider: true } },
          trackingEvents: { orderBy: { timestamp: 'desc' } },
          providerTasks: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    : null;

  // Retrieve indicative tariff intelligence for this export corridor
  const tariffData = getTariffIntelligence(
    product?.hsCode,
    product?.name,
    destination?.country.isoCode,
    destination?.country.name
  );

  return (
    <AppShell currentRole={role} userEmail={user?.email} userName={user?.name}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* LEVEL 1 — Context & Header */}
        <DashboardHeader
          user={user}
          business={business}
          product={product ? { name: product.name, hsCode: product.hsCode } : null}
          destinationCountryName={destination?.country.name}
          destinationCountryIso={destination?.country.isoCode}
        />

        {readinessData ? (
          <div className="space-y-6">
            {/* LEVEL 1 — Export Readiness Summary (Score & 1-line plain status) */}
            <ExportReadinessSummary
              readinessData={readinessData}
              productName={product?.name}
              destinationCountryName={destination?.country.name}
              destinationCountryIso={destination?.country.isoCode}
            />

            {/* LEVEL 1 — What Needs Your Attention (Action Queue max 3 items) */}
            <AttentionRequiredSection readinessData={readinessData} />

            {/* LEVEL 2 — Active Shipment Operational Status */}
            <ActiveShipmentCard activeShipment={activeShipment} />

            {/* LEVEL 3 — Quick Navigation Actions */}
            <QuickNavActions />

            {/* LEVEL 4 — Collapsible Tariff Intelligence */}
            {tariffData && <TariffIntelligenceCard data={tariffData} />}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Setup Required
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                Configure Export Product &amp; Target Destination
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Set up your export product catalog and target foreign country to activate real-time readiness scoring, blocker detection, and statutory document checklists.
              </p>
            </div>
            <Link
              href="/products"
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-2xs transition-colors inline-flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Setup Export Product</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
