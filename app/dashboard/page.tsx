import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AppShell from '@/components/AppShell';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import NextBestAction from '@/components/dashboard/NextBestAction';
import ReadinessHero from '@/components/dashboard/ReadinessHero';
import CriticalBlockers from '@/components/dashboard/CriticalBlockers';
import ReadinessBreakdown from '@/components/dashboard/ReadinessBreakdown';
import ActiveShipmentCard from '@/components/dashboard/ActiveShipmentCard';
import CostTimelineCard from '@/components/dashboard/CostTimelineCard';
import TariffIntelligenceCard from '@/components/dashboard/TariffIntelligenceCard';
import { requireAuth } from '@/app/actions';
import { prisma } from '@/lib/prisma';
import { calculateReadinessScore } from '@/lib/services/readiness';
import { getTariffIntelligence } from '@/lib/services/applicability';
import { ArrowRight } from 'lucide-react';

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
  const business = user?.businesses[0];
  const product = business?.products[0];
  const destination = product?.destinations[0];

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
    product?.hsCode || '2008.99.11',
    product?.name || 'Commercial Export Cargo',
    destination?.country.isoCode || 'AE',
    destination?.country.name || 'United Arab Emirates'
  );

  return (
    <AppShell currentRole={role} userEmail={user?.email} userName={user?.name}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* 1. Header & Exporter Context */}
        <DashboardHeader
          user={user}
          business={business}
          product={product ? { name: product.name, hsCode: product.hsCode } : null}
          destinationCountryName={destination?.country.name}
        />

        {/* 2. Primary Operational Overview */}
        {readinessData ? (
          <div className="space-y-6">
            {/* Dedicated Next Best Action Highlight */}
            <NextBestAction readinessData={readinessData} />

            {/* Dual-Pane Operations Deck */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Pane: 0–100 Readiness Score Cockpit */}
              <div className="lg:col-span-5">
                <ReadinessHero
                  readinessData={readinessData}
                  productName={product?.name}
                  originCity={business?.city}
                  destinationCountryName={destination?.country.name}
                  destinationCountryIso={destination?.country.isoCode}
                />
              </div>

              {/* Right Pane: Critical Dispatch Blockers & Actions Queue */}
              <div className="lg:col-span-7">
                <CriticalBlockers readinessData={readinessData} />
              </div>
            </div>

            {/* 3. 5-Pillar Readiness Breakdown Matrix */}
            <ReadinessBreakdown categoryScores={readinessData.categoryScores} />
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Onboarding &amp; Trade Corridor Setup
              </span>
              <h3 className="text-2xl font-bold font-serif text-slate-900">
                Configure Export Product &amp; Target Destination
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Set up your export product catalog and target foreign country to activate real-time readiness scoring, blocker detection, and statutory document checklists.
              </p>
            </div>
            <Link
              href="/products"
              className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 shrink-0"
            >
              <span>Setup Export Product</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* 4. Tariff & Trade Framework Intelligence */}
        <TariffIntelligenceCard data={tariffData} />

        {/* 5. Active Export Shipment Module */}
        <ActiveShipmentCard activeShipment={activeShipment} />

        {/* 6. Cost & Timeline Predictive Intelligence */}
        <CostTimelineCard
          originCity={business?.city ? `${business.city} Origin Factory` : 'Factory Origin'}
          destinationPortName={
            activeShipment
              ? `${activeShipment.destinationCity}, ${activeShipment.destinationCountry.name}`
              : destination?.country.name
              ? `${destination.country.name} Port`
              : 'Destination Port'
          }
          cargoMode={activeShipment?.mode || 'Sea Freight FCL 20ft Reefer'}
          leadTimeDays="4–6 Days"
          costRange="₹125,000 – ₹155,000"
          transitTimeDays="12–15 Days"
        />
      </div>
    </AppShell>
  );
}
