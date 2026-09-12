import React from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { requireAuth, createShipmentAction } from '@/app/actions';
import { prisma } from '@/lib/prisma';
import { calculateReadinessScore } from '@/lib/services/readiness';
import { Truck, Plus, CheckCircle2, AlertOctagon, ArrowRight, MapPin, ExternalLink } from 'lucide-react';

export default async function ShipmentsPage() {
  const { role, user } = await requireAuth();
  const business = user?.businesses?.[0];
  const products = business?.products || [];
  const countries = await prisma.country.findMany({ where: { active: true } });

  const shipments = await prisma.shipment.findMany({
    where: role === 'MSME' ? { businessId: business?.id || 'none' } : {},
    include: {
      product: true,
      destinationCountry: true,
      quotes: true,
      trackingEvents: { orderBy: { timestamp: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Evaluate readiness for product destination
  let readiness = null;
  if (products[0]?.destinations[0]) {
    readiness = await calculateReadinessScore(products[0].destinations[0].id);
  }

  return (
    <AppShell currentRole={role} userEmail={user?.email} userName={user?.name}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Header */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Shipment Execution & Logistics Orchestration
            </span>
            <h1 className="text-3xl font-black text-slate-900 font-serif">
              Shipment Hub & Dispatch Center
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Create export shipments, compare freight quotes, manage customs clearance, and track deliveries.
            </p>
          </div>
        </div>



        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Create New Shipment Form (For MSME) */}
          {role === 'MSME' && (
            <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-serif">Create New Shipment</h3>
              </div>

              <form action={createShipmentAction} className="space-y-4 text-xs">
                <input type="hidden" name="businessId" value={business?.id || ''} />

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Export Product</label>
                  <input
                    type="text"
                    name="productName"
                    list="product-suggestions"
                    defaultValue={products[0]?.name || ''}
                    placeholder="Type product name..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs"
                    required
                  />
                  <datalist id="product-suggestions">
                    {products.map((p: any) => (
                      <option key={p.id} value={p.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destination Country</label>
                  <select
                    name="destinationCountryId"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                    required
                  >
                    {countries.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.isoCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destination City / Port</label>
                  <input
                    type="text"
                    name="destinationCity"
                    defaultValue="Dubai (Jebel Ali Port)"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Declared Value (INR)</label>
                    <input
                      type="number"
                      name="value"
                      defaultValue={1500000}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Quantity (MT / Units)</label>
                    <input
                      type="number"
                      name="quantity"
                      defaultValue={10}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Gross Weight (KG)</label>
                    <input
                      type="number"
                      name="weight"
                      defaultValue={10000}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Package Count</label>
                    <input
                      type="number"
                      name="packages"
                      defaultValue={500}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
                >
                  Create Shipment & Generate Quotes →
                </button>
              </form>
            </div>
          )}

          {/* Existing Shipments Grid */}
          <div className={`${role === 'MSME' ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
            <h3 className="text-xl font-bold text-slate-900 font-serif">
              Active & Historical Shipments ({shipments.length})
            </h3>

            <div className="space-y-4">
              {shipments.map((shp) => (
                <div
                  key={shp.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-orange-600">#{shp.shipmentNumber}</span>
                      <h4 className="text-lg font-bold text-slate-900 font-serif">
                        {shp.product.name} → {shp.destinationCountry.name}
                      </h4>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      {shp.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                    <div>
                      <span className="block text-slate-400 font-medium">Declared Value</span>
                      <span className="font-bold text-slate-900">₹{shp.value.toLocaleString('en-IN')} INR</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-medium">Quantity / Weight</span>
                      <span className="font-bold text-slate-900">{shp.quantity} MT ({shp.weight.toLocaleString()} KG)</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-medium">Quotes Status</span>
                      <span className="font-bold text-orange-600">{shp.quotes.length} Quotes Available</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <Link
                      href={`/shipments/${shp.id}/quotes`}
                      className="px-3.5 py-2 rounded-xl bg-orange-50 text-orange-700 font-bold text-xs hover:bg-orange-100 transition-colors"
                    >
                      Compare Quotes
                    </Link>

                    <Link
                      href={`/shipments/${shp.id}/tracking`}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors flex items-center gap-1"
                    >
                      <MapPin className="w-3.5 h-3.5 text-orange-400" /> Tracking Timeline
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
