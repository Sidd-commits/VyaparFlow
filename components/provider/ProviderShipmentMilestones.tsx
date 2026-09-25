'use client';

import React, { useState, useTransition } from 'react';
import {
  Ship,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Send,
  Building,
  ChevronDown,
  ChevronUp,
  Radio,
  FileCheck2,
} from 'lucide-react';
import { addTrackingEventAction } from '@/app/actions';

interface TrackingEventItem {
  id: string;
  status: string;
  location: string;
  note: string | null;
  timestamp: string | Date;
}

interface AssignedShipment {
  id: string;
  shipmentNumber: string;
  value: number;
  quantity: number;
  weight: number;
  packages: number;
  mode: string;
  status: string;
  destinationCity: string;
  business: {
    displayName: string;
    city: string;
    state: string;
  };
  product: {
    name: string;
    hsCode: string;
  };
  destinationCountry: {
    name: string;
    isoCode: string;
  };
  quotes: Array<{
    id: string;
    mode: string;
    cost: number;
    isSelected: boolean;
    provider: {
      id: string;
      name: string;
    };
  }>;
  trackingEvents: TrackingEventItem[];
}

interface ProviderShipmentMilestonesProps {
  shipments: AssignedShipment[];
  providerId: string;
}

const MILESTONE_STATUSES = [
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

export default function ProviderShipmentMilestones({
  shipments,
  providerId,
}: ProviderShipmentMilestonesProps) {
  const [expandedShipmentId, setExpandedShipmentId] = useState<string | null>(
    shipments[0]?.id || null
  );
  const [isPending, startTransition] = useTransition();

  const toggleExpand = (id: string) => {
    setExpandedShipmentId(expandedShipmentId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
            Live Consignment Telemetry &amp; Operations
          </span>
          <h2 className="text-2xl font-black text-slate-900 font-serif">
            Live Cargo Tracking &amp; Milestone Dispatch Desk
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Publish real-time telemetry checkpoints, container seal audits, port CFS gate-in events, and delivery confirmations to MSME exporters.
          </p>
        </div>

        <span className="text-xs bg-slate-900 text-white font-bold px-4 py-2 rounded-xl shrink-0">
          {shipments.length} Active Fleet Consignments
        </span>
      </div>

      {/* Shipments List */}
      <div className="space-y-5">
        {shipments.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <Truck className="w-10 h-10 text-orange-600 mx-auto" />
            <h4 className="text-base font-bold text-slate-900 font-serif">No Active Consignments</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Once an MSME exporter accepts your freight rate quote or assigns a logistics task, the consignment will appear here for live milestone tracking updates.
            </p>
          </div>
        ) : (
          shipments.map((shp) => {
            const isExpanded = expandedShipmentId === shp.id;
            const selectedQuote = shp.quotes.find((q) => q.isSelected) || shp.quotes[0];
            const latestEvent = shp.trackingEvents[0];

            return (
              <div
                key={shp.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
              >
                {/* Consignment Banner */}
                <div
                  onClick={() => toggleExpand(shp.id)}
                  className="p-6 cursor-pointer bg-linear-to-r from-white to-slate-50/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                        <Ship className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold text-slate-900 text-base font-serif">
                        #{shp.shipmentNumber} &bull; {shp.product.name}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        {shp.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span>
                        Exporter: <strong className="text-slate-800">{shp.business.displayName}</strong>
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-orange-600" />
                        Destination: <strong>{shp.destinationCity} ({shp.destinationCountry.name})</strong>
                      </span>
                      <span>&bull;</span>
                      <span>
                        Cargo: <strong>{shp.quantity} MT</strong> ({shp.weight.toLocaleString()} KG)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-left lg:text-right text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Last Milestone Location
                      </span>
                      <span className="font-bold text-slate-900 block truncate max-w-[220px]">
                        {latestEvent?.location || 'Origin Hub'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {latestEvent ? new Date(latestEvent.timestamp).toLocaleString('en-IN') : 'Awaiting First Telemetry'}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      aria-label="Expand Shipment Details"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Operational Workspace */}
                {isExpanded && (
                  <div className="p-6 sm:p-7 space-y-7 bg-slate-50/40">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
                      {/* Left: Dispatch Milestone Form */}
                      <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                            <Radio className="w-3.5 h-3.5" />
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm font-serif">
                            Broadcast Milestone Telemetry Event
                          </h4>
                        </div>

                        <form
                          action={async (formData: FormData) => {
                            const status = formData.get('status') as string;
                            const location = formData.get('location') as string;
                            const note = formData.get('note') as string;
                            await addTrackingEventAction(shp.id, status, location, note);
                          }}
                          className="space-y-3.5 text-xs"
                        >
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Select Telemetry Status Checkpoint
                            </label>
                            <select
                              name="status"
                              defaultValue={shp.status}
                              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:border-orange-500 focus:outline-none"
                              required
                            >
                              {MILESTONE_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Current Checkpoint Location
                            </label>
                            <input
                              type="text"
                              name="location"
                              placeholder="e.g. JNPT Container Terminal 3, Nhava Sheva"
                              defaultValue={
                                shp.status === 'Draft' || shp.status === 'Preparation'
                                  ? `${shp.business.city} Origin Factory Gate`
                                  : shp.status === 'Export Customs'
                                  ? 'JNPT Customs Terminal, Mumbai'
                                  : shp.status === 'Dispatched'
                                  ? 'JNPT Port (Vessel MV Horizon)'
                                  : shp.status === 'In Transit'
                                  ? 'Arabian Sea / Suez Canal Maritime Corridor'
                                  : `${shp.destinationCity} Destination Port`
                              }
                              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:border-orange-500 focus:outline-none"
                              required
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Telemetry Remarks &amp; Container Seal Data
                            </label>
                            <textarea
                              name="note"
                              rows={2}
                              placeholder="e.g. Container Seal #IN-98124 intact. Cold-chain temperature data logged at +4.0°C."
                              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:border-orange-500 focus:outline-none"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Broadcast Milestone Event →
                          </button>
                        </form>
                      </div>

                      {/* Right: Milestone Timeline */}
                      <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <h4 className="font-bold text-slate-900 text-sm font-serif">
                            Milestone Audit History ({shp.trackingEvents.length})
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Immutable Event Ledger
                          </span>
                        </div>

                        <div className="relative pl-5 space-y-5 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 max-h-72 overflow-y-auto pr-2">
                          {shp.trackingEvents.map((evt, idx) => (
                            <div key={evt.id} className="relative group text-xs">
                              {/* Circle indicator */}
                              <div
                                className={`absolute -left-[24px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${
                                  idx === 0
                                    ? 'bg-orange-600 border-orange-600 text-white ring-2 ring-orange-100'
                                    : 'bg-white border-slate-400 text-slate-600'
                                }`}
                              />

                              <div className="bg-[#FAF9F6] p-3 rounded-xl border border-slate-200/80 space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-slate-900 text-xs">
                                    {evt.status}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(evt.timestamp).toLocaleString('en-IN')}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 text-[11px] text-orange-600 font-medium">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{evt.location}</span>
                                </div>

                                {evt.note && (
                                  <p className="text-slate-600 text-[11px] pt-0.5 leading-relaxed">
                                    {evt.note}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
