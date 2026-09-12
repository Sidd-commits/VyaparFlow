import React from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { requireAuth } from '@/app/actions';
import { prisma } from '@/lib/prisma';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  FileText,
  Download,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Package,
  Globe,
  Building2,
  AlertOctagon,
} from 'lucide-react';

export default async function ShipmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: shipmentId } = await params;
  const { role, user } = await requireAuth();

  let shipment = null;
  if (shipmentId && shipmentId !== 'demo' && shipmentId !== 'latest' && shipmentId !== 'undefined') {
    const fetched = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        business: true,
        product: true,
        destinationCountry: true,
        quotes: { include: { provider: true } },
        trackingEvents: { orderBy: { timestamp: 'desc' } },
        providerTasks: { include: { provider: true } },
        documents: true,
      },
    });

    // Enforce authorization for MSME role
    if (fetched && (role !== 'MSME' || fetched.business.ownerUserId === user?.id)) {
      shipment = fetched;
    }
  } else if ((shipmentId === 'demo' || shipmentId === 'latest') && user?.businesses?.[0]?.id) {
    // Fallback ONLY if explicitly requested via 'demo' or 'latest' alias
    shipment = await prisma.shipment.findFirst({
      where: { businessId: user.businesses[0].id },
      include: {
        business: true,
        product: true,
        destinationCountry: true,
        quotes: { include: { provider: true } },
        trackingEvents: { orderBy: { timestamp: 'desc' } },
        providerTasks: { include: { provider: true } },
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  if (!shipment) {
    return (
      <AppShell currentRole={role} userEmail={user?.email} userName={user?.name}>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
            <Truck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-slate-900">Shipment Record Not Found</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            The requested shipment ID does not exist or has not been created yet in the export registry.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/shipments"
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              Browse All Shipments
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const selectedQuote = shipment.quotes.find((q) => q.isSelected) || shipment.quotes[0];
  const latestTracking = shipment.trackingEvents[0];

  return (
    <AppShell currentRole={role} userEmail={user?.email} userName={user?.name}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/shipments"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Shipments Hub
          </Link>
          <Link
            href="/dashboard"
            className="text-xs font-bold text-orange-600 hover:text-orange-700"
          >
            &larr; Exporter Operations Dashboard
          </Link>
        </div>

        {/* Master Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-700">
                ACTIVE EXPORT SHIPMENT DOSSIER
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs font-mono font-semibold text-slate-500">
                Created: {new Date(shipment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-serif">
              Shipment #{shipment.shipmentNumber}
            </h1>

            <p className="text-xs text-slate-600 flex flex-wrap items-center gap-2 font-medium">
              <span>Payload: <strong className="text-slate-900">{shipment.product.name} ({shipment.quantity} {shipment.product.unit})</strong></span>
              <span>&rarr;</span>
              <span>Destination: <strong className="text-slate-900">{shipment.destinationCity}, {shipment.destinationCountry.name}</strong></span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              Stage: {shipment.status}
            </span>

            <Link
              href={`/shipments/${shipment.id}/tracking`}
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-white" />
              <span>Milestone Tracking Timeline</span>
            </Link>
          </div>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Cargo Specifications */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-700">
              <Package className="w-4 h-4 text-orange-600" />
              <span>Cargo Specifications</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Commodity:</span>
                <span className="font-bold text-slate-900 truncate max-w-[140px]">{shipment.product.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">HS Code:</span>
                <span className="font-mono font-bold text-slate-900">{shipment.product.hsCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quantity:</span>
                <span className="font-bold text-slate-900">{shipment.quantity} {shipment.product.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Weight:</span>
                <span className="font-bold text-slate-900">{shipment.weight.toLocaleString('en-IN')} KG</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Packages:</span>
                <span className="font-bold text-slate-900">{shipment.packages} units</span>
              </div>
            </div>
          </div>

          {/* Card 2: Commercial Value & Drawback */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-700">
              <FileText className="w-4 h-4 text-orange-600" />
              <span>Commercial Invoice</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Declared Value:</span>
                <span className="font-mono font-black text-slate-900 text-sm">₹{shipment.value.toLocaleString('en-IN')} {shipment.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Terms:</span>
                <span className="font-bold text-slate-900">100% L/C at Sight</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Incoterms:</span>
                <span className="font-bold text-slate-900">CIF {shipment.destinationCity}</span>
              </div>
              <div className="pt-2">
                <a
                  href={`/api/export-documents/invoice?shipmentId=${shipment.id}`}
                  download={`Commercial_Invoice_${shipment.shipmentNumber}.pdf`}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-orange-400" />
                  <span>Download Invoice PDF</span>
                </a>
              </div>
            </div>
          </div>

          {/* Card 3: Route & Corridor */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-700">
              <Globe className="w-4 h-4 text-orange-600" />
              <span>Corridor &amp; Routing</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Port of Loading:</span>
                <span className="font-bold text-slate-900">JNPT Nhava Sheva (INNSA1)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Port of Discharge:</span>
                <span className="font-bold text-slate-900">{shipment.destinationCity} Port ({shipment.destinationCountry.isoCode})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Freight Mode:</span>
                <span className="font-bold text-slate-900">{shipment.mode || 'Ocean FCL Reefer'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Transit:</span>
                <span className="font-bold text-slate-900">12–15 Days</span>
              </div>
            </div>
          </div>

          {/* Card 4: Freight Carrier Quotes */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-700">
              <Truck className="w-4 h-4 text-orange-600" />
              <span>Carrier Quotations</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Quotes Received:</span>
                <span className="font-bold text-slate-900">{shipment.quotes.length} Quotes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Selected Carrier:</span>
                <span className="font-bold text-emerald-700">
                  {selectedQuote?.provider?.name || 'SwiftGlobe Logistics'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Freight Cost:</span>
                <span className="font-bold font-mono text-slate-900">
                  ₹{selectedQuote ? selectedQuote.cost.toLocaleString('en-IN') : '135,000'} INR
                </span>
              </div>
              <div className="pt-2">
                <Link
                  href={`/shipments/${shipment.id}/quotes`}
                  className="w-full py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-orange-200"
                >
                  <span>Compare All Quotes ({shipment.quotes.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Live Milestone Progress Summary */}
        <div className="bg-[#090D16] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-orange-400 block">
                LIVE LOGISTICS TELEMETRY
              </span>
              <h3 className="text-xl font-bold font-serif text-white mt-0.5">
                Current Operational Milestone: {shipment.status}
              </h3>
            </div>

            <Link
              href={`/shipments/${shipment.id}/tracking`}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <span>Inspect Full Event Log ({shipment.trackingEvents.length} Events)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block">Last Reported Location</span>
              <strong className="text-white text-sm block">
                {latestTracking?.location || 'Nhava Sheva Port Gate-In (JNPT)'}
              </strong>
              <span className="text-[11px] text-slate-400">
                {latestTracking ? new Date(latestTracking.timestamp).toLocaleString('en-IN') : 'Recent Event'}
              </span>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block">Customs Clearance Status</span>
              <strong className="text-emerald-400 text-sm block">
                Let Export Order (LEO) Active
              </strong>
              <span className="text-[11px] text-slate-400">
                Shipping Bill filed via ICEGATE Electronic Gateway
              </span>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block">Estimated Delivery</span>
              <strong className="text-orange-400 text-sm block">
                12–15 Days from Vessel Departure
              </strong>
              <span className="text-[11px] text-slate-400">
                Ocean Transit to {shipment.destinationCity} Port
              </span>
            </div>
          </div>
        </div>

        {/* Export Document Package Generation */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold font-serif text-slate-900">
              Generated Export Document Vault for this Shipment
            </h3>
            <p className="text-xs text-slate-500">
              Statutory documents compiled automatically from verified compliance data.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-bold text-slate-900 text-xs block">Commercial Invoice (Form SB-1)</span>
                <span className="text-[11px] text-slate-500 block">Required for Customs Let Export Order and Bank Remittance</span>
              </div>
              <a
                href={`/api/export-documents/invoice?shipmentId=${shipment.id}`}
                download={`Commercial_Invoice_${shipment.shipmentNumber}.pdf`}
                className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-bold text-slate-900 text-xs block">Shipping Packing List</span>
                <span className="text-[11px] text-slate-500 block">Detailed container itemization with tare/gross weights</span>
              </div>
              <a
                href={`/api/export-documents/packing-list?shipmentId=${shipment.id}`}
                download={`Packing_List_${shipment.shipmentNumber}.pdf`}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </a>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
