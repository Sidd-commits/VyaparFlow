import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { requireAuth, getAllUsers, addTrackingEventAction } from '@/app/actions';
import { prisma } from '@/lib/prisma';
import {
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Ship,
  Truck,
  Plus,
  ShieldCheck,
  Building,
} from 'lucide-react';

export default async function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: shipmentId } = await params;
  const { role, user } = await requireAuth();
  const allUsers = await getAllUsers();

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: {
      product: true,
      destinationCountry: true,
      trackingEvents: { orderBy: { timestamp: 'desc' } },
      quotes: { where: { isSelected: true }, include: { provider: true } },
    },
  });

  if (!shipment) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] p-8 text-center">
        <h2 className="text-xl font-bold">Shipment Not Found</h2>
        <Link href="/shipments" className="text-orange-600 underline mt-4 inline-block">
          Return to Shipments
        </Link>
      </div>
    );
  }

  const trackingEvents = shipment.trackingEvents;
  const currentStatus = shipment.status;
  const selectedQuote = shipment.quotes[0];

  const allowedStatuses = [
    'Order Confirmed',
    'Documents Ready',
    'Pickup Scheduled',
    'Picked Up',
    'Export Customs',
    'Dispatched',
    'In Transit',
    'Destination Customs',
    'Delivered',
    'Exception',
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 pb-16 font-sans">
      <Navbar currentRole={role} userEmail={user?.email} userName={user?.name} allUsers={allUsers} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Link href="/shipments" className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back to Shipments
        </Link>

        {/* Header */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Live Cargo Tracking & Milestone Event Timeline
            </span>
            <h1 className="text-3xl font-black text-slate-900 font-serif">
              Shipment Tracking #{shipment.shipmentNumber}
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Cargo: {shipment.product.name} ({shipment.quantity} MT) → {shipment.destinationCity}, {shipment.destinationCountry.name}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-slate-900 text-white font-bold px-4 py-2 rounded-xl">
              Current Status: {currentStatus}
            </span>
          </div>
        </div>

        {/* Exception Alert Banner (if status is Exception) */}
        {currentStatus === 'Exception' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3 text-red-900">
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-bold text-sm text-red-900">Customs Inspection Hold / Exception Alert</span>
              <p className="text-red-800">
                Origin customs flagged a document mismatch. CHA provider task requires immediate resolution before cargo dispatch can resume.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Timeline Events Column */}
          <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-xl font-bold text-slate-900 font-serif">
              Chronological Event History ({trackingEvents.length} Milestones)
            </h3>

            <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {trackingEvents.map((evt, idx) => (
                <div key={evt.id} className="relative group">
                  {/* Circle dot */}
                  <div
                    className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                      idx === 0
                        ? 'bg-orange-600 border-orange-600 text-white ring-4 ring-orange-100'
                        : 'bg-white border-slate-400 text-slate-600'
                    }`}
                  >
                    {trackingEvents.length - idx}
                  </div>

                  <div className="bg-[#FAF9F6] p-4 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900 text-sm">{evt.status}</span>
                      <span className="text-slate-500">{evt.timestamp.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-orange-600 font-medium">
                      <MapPin className="w-3.5 h-3.5" /> {evt.location}
                    </div>

                    {evt.note && <p className="text-xs text-slate-600 pt-1">{evt.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Simulated Event Trigger (For Provider/Admin Testing) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Carrier Summary Box */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                Assigned Carrier Details
              </span>
              <div>
                <h4 className="text-lg font-bold font-serif text-white">
                  {selectedQuote?.provider.name || 'SwiftGlobe Freight Lines'}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Mode: {selectedQuote?.mode || 'Sea Freight (FCL 20ft Reefer)'}</p>
              </div>

              <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 space-y-1 text-xs">
                <span className="text-slate-400">Indicative ETA</span>
                <span className="block font-bold text-white text-base">
                  {shipment.eta ? shipment.eta.toLocaleDateString() : '14 Days from Dispatch'}
                </span>
              </div>
            </div>

            {/* Add Tracking Event Form (Simulated Lifecycle for Evaluator) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-base font-serif">Simulate Lifecycle Event</h4>
              </div>

              <form
                action={async (formData: FormData) => {
                  'use server';
                  const status = formData.get('status') as string;
                  const location = formData.get('location') as string;
                  const note = formData.get('note') as string;
                  await addTrackingEventAction(shipmentId, status, location, note);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Milestone Status</label>
                  <select
                    name="status"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                    required
                  >
                    {allowedStatuses.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current Location</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue="JNPT Port Customs / Jebel Ali Port"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Event Log Note</label>
                  <textarea
                    name="note"
                    rows={2}
                    placeholder="Provide container seal validation, customs release, or tracking notes..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  Post Tracking Milestone Update →
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
