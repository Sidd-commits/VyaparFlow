'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Ship,
  TrendingUp,
  Clock,
  Plus,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Package,
  MapPin,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { submitFreightQuoteAction } from '@/app/actions';

interface ShipmentQuote {
  id: string;
  shipmentId: string;
  mode: string;
  cost: number;
  currency: string;
  transitMin: number;
  transitMax: number;
  inclusions: string;
  exclusions: string;
  isSelected: boolean;
  provider: {
    id: string;
    name: string;
    type: string;
  };
}

interface OpenShipment {
  id: string;
  shipmentNumber: string;
  value: number;
  currency: string;
  quantity: number;
  weight: number;
  packages: number;
  mode: string;
  status: string;
  createdAt: string | Date;
  destinationCity: string;
  business: {
    displayName: string;
    legalName: string;
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
  quotes: ShipmentQuote[];
}

interface ProviderQuotesDeskProps {
  providerId: string;
  providerName: string;
  openShipments: OpenShipment[];
  submittedQuotes: ShipmentQuote[];
}

export default function ProviderQuotesDesk({
  providerId,
  providerName,
  openShipments,
  submittedQuotes,
}: ProviderQuotesDeskProps) {
  const [selectedShipment, setSelectedShipment] = useState<OpenShipment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpenBidModal = (shipment: OpenShipment) => {
    setSelectedShipment(shipment);
    setMessage(null);
  };

  const handleCloseBidModal = () => {
    setSelectedShipment(null);
    setMessage(null);
  };

  const awardedQuotesCount = submittedQuotes.filter((q) => q.isSelected).length;

  return (
    <div className="space-y-8">
      {/* Top Banner & Overview */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
            Freight Forwarding &amp; Carrier Bidding Desk
          </span>
          <h2 className="text-2xl font-black text-slate-900 font-serif">
            Live Inbound MSME RFQs &amp; Freight Rates
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Discover active export shipments needing freight quotes, submit competitive carrier bids, and manage awarded bookings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-orange-50 text-orange-700 font-bold px-3.5 py-1.5 rounded-xl border border-orange-200">
            {openShipments.length} Open Inquiries
          </span>
          <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3.5 py-1.5 rounded-xl border border-emerald-200">
            {awardedQuotesCount} Awarded Contracts
          </span>
        </div>
      </div>

      {/* Inbound RFQs Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 font-serif">
            Active Consignments Needing Quotes ({openShipments.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {openShipments.map((shp) => {
            const hasAlreadyQuoted = shp.quotes.some((q) => q.provider.id === providerId);
            const myQuote = shp.quotes.find((q) => q.provider.id === providerId);

            return (
              <div
                key={shp.id}
                className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-5"
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">
                      #{shp.shipmentNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      Mode: {shp.mode} Freight
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-slate-900 font-serif">
                      {shp.product.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Exporter: <strong className="text-slate-800">{shp.business.displayName}</strong> ({shp.business.city}, {shp.business.state})
                    </p>
                  </div>
                </div>

                {/* Cargo Specifications Grid */}
                <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-slate-200/90 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Destination</span>
                    <span className="font-bold text-slate-900 block truncate">
                      {shp.destinationCity}
                    </span>
                    <span className="text-[10px] text-slate-500">{shp.destinationCountry.name}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Cargo Volume</span>
                    <span className="font-bold text-slate-900 block">
                      {shp.quantity} MT
                    </span>
                    <span className="text-[10px] text-slate-500">{shp.weight.toLocaleString()} KG Gross</span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Declared Value</span>
                    <span className="font-bold text-slate-900 block">
                      ₹{shp.value.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500">{shp.packages} Packages</span>
                  </div>
                </div>

                {/* Quote Status & Actions */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  {hasAlreadyQuoted && myQuote ? (
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                          myQuote.isSelected
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {myQuote.isSelected ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Carrier Awarded (₹{myQuote.cost.toLocaleString('en-IN')})
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-blue-600" /> Bid Submitted (₹{myQuote.cost.toLocaleString('en-IN')})
                          </>
                        )}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 font-medium">
                      {shp.quotes.length} competitor bids logged
                    </span>
                  )}

                  <button
                    onClick={() => handleOpenBidModal(shp)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                      hasAlreadyQuoted
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        : 'bg-orange-600 hover:bg-orange-700 text-white shadow-md'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    {hasAlreadyQuoted ? 'Submit Additional Option' : 'Submit Freight Rate Bid'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submitted Quotes History Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-serif">
              Submitted Rate Quotes &amp; Contracts ({submittedQuotes.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical ledger of carrier rate proposals submitted to exporters.
            </p>
          </div>
        </div>

        {submittedQuotes.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
            No freight quotes have been submitted yet. Select an open RFQ above to place your first carrier bid.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold text-[10px] uppercase">
                  <th className="py-3 px-3">Carrier / Mode</th>
                  <th className="py-3 px-3">Freight Rate (INR)</th>
                  <th className="py-3 px-3">Transit Window</th>
                  <th className="py-3 px-3">Inclusions &amp; Exclusions</th>
                  <th className="py-3 px-3 text-right">Award Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submittedQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-slate-900 block">{q.mode}</span>
                      <span className="text-[10px] text-slate-500">{q.provider.name}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-black text-slate-900 text-sm font-serif block">
                        ₹{q.cost.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase">{q.currency}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-orange-600" /> {q.transitMin}–{q.transitMax} Days
                      </span>
                    </td>
                    <td className="py-3.5 px-3 max-w-xs">
                      <p className="text-slate-600 text-[11px] truncate" title={q.inclusions}>
                        <strong className="text-slate-800">Inc:</strong> {q.inclusions}
                      </p>
                      <p className="text-slate-400 text-[10px] truncate" title={q.exclusions}>
                        <strong>Exc:</strong> {q.exclusions}
                      </p>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          q.isSelected
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {q.isSelected ? 'Awarded ✓' : 'Under Review'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit Quote Modal Dialog */}
      {selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  Carrier Bid Submission
                </span>
                <h3 className="text-xl font-bold text-slate-900 font-serif">
                  Submit Freight Quote for #{selectedShipment.shipmentNumber}
                </h3>
              </div>
              <button
                onClick={handleCloseBidModal}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Consignment Context Strip */}
            <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-slate-200/90 text-xs space-y-2">
              <div className="flex justify-between font-bold text-slate-800">
                <span>{selectedShipment.product.name} ({selectedShipment.quantity} MT)</span>
                <span className="text-orange-600">Destination: {selectedShipment.destinationCity}</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Exporter: {selectedShipment.business.displayName} &bull; Declared Value: ₹{selectedShipment.value.toLocaleString('en-IN')} INR
              </p>
            </div>

            {message && (
              <div
                className={`p-4 rounded-xl text-xs font-semibold ${
                  message.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Form */}
            <form
              action={async (formData: FormData) => {
                setIsSubmitting(true);
                formData.set('shipmentId', selectedShipment.id);
                formData.set('providerId', providerId);
                const res = await submitFreightQuoteAction(formData);
                setIsSubmitting(false);
                if (res.success) {
                  setMessage({ type: 'success', text: 'Freight rate bid submitted successfully to MSME exporter.' });
                  setTimeout(() => {
                    handleCloseBidModal();
                  }, 1200);
                } else {
                  setMessage({ type: 'error', text: res.error || 'Failed to submit quote.' });
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Carrier Freight Mode</label>
                <select
                  name="mode"
                  defaultValue="Sea Freight (FCL 20ft Reefer)"
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:border-orange-500 focus:outline-none"
                  required
                >
                  <option value="Sea Freight (FCL 20ft Reefer)">Sea Freight (FCL 20ft Reefer Cold-Chain)</option>
                  <option value="Sea Freight FCL (Dry Van 20ft)">Sea Freight FCL (Dry Van 20ft)</option>
                  <option value="Sea Freight (FCL 40ft High Cube)">Sea Freight (FCL 40ft High Cube)</option>
                  <option value="Sea Freight Express (Direct Liner)">Sea Freight Express (Direct Liner Priority)</option>
                  <option value="Air Cargo Express">Air Cargo Express (Scheduled Freighter BOM -&gt; DXB/JFK)</option>
                  <option value="LCL Groupage Consolidation">LCL Groupage Consolidation</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Indicative Rate (INR)</label>
                  <input
                    type="number"
                    name="cost"
                    placeholder="e.g. 135000"
                    defaultValue={Math.round(selectedShipment.value * 0.09)}
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white font-bold text-xs focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Transit (Days)</label>
                  <input
                    type="number"
                    name="transitMin"
                    defaultValue={10}
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Transit (Days)</label>
                  <input
                    type="number"
                    name="transitMax"
                    defaultValue={14}
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rate Inclusions</label>
                <input
                  type="text"
                  name="inclusions"
                  defaultValue="Origin port terminal handling, Bill of Lading filing, Temperature data logging (+4°C), JNPT gate-in"
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rate Exclusions</label>
                <input
                  type="text"
                  name="exclusions"
                  defaultValue="Destination customs duties, Local destination VAT/GST, Demurrage beyond 7 free days"
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseBidModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Transmitting Rate Bid...' : 'Transmit Freight Bid →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
