import React from 'react';
import Link from 'next/link';
import {
  Truck,
  MapPin,
  ExternalLink,
  Download,
  ArrowRight,
  Plus,
} from 'lucide-react';

interface ActiveShipmentCardProps {
  activeShipment: {
    id: string;
    shipmentNumber: string;
    status: string;
    quantity: number;
    weight: number;
    value: number;
    currency: string;
    mode?: string | null;
    destinationCity: string;
    product: {
      name: string;
      unit?: string | null;
    };
    destinationCountry: {
      name: string;
    };
    quotes: Array<{
      id: string;
      isSelected: boolean;
    }>;
  } | null;
}

export default function ActiveShipmentCard({ activeShipment }: ActiveShipmentCardProps) {
  if (!activeShipment) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-orange-700 uppercase tracking-wider block">
            EXPORT CARGO DISPATCH PIPELINE
          </span>
          <h3 className="text-2xl font-bold text-slate-900 font-serif">
            No Active Export Cargo in Dispatch Pipeline
          </h3>
          <p className="text-xs text-slate-600 max-w-lg">
            Create a new export shipment to orchestrate container booking, compare multi-carrier freight quotes, file customs declarations, and track live milestones.
          </p>
        </div>

        <Link
          href="/shipments"
          className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Export Shipment</span>
        </Link>
      </div>
    );
  }

  const hasSelectedQuote = activeShipment.quotes.some((q) => q.isSelected);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
      {/* Top Shipment Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold text-orange-700 uppercase tracking-wider block">
            ACTIVE OPERATIONAL CARGO
          </span>
          <h3 className="text-2xl font-bold text-slate-900 font-serif mt-0.5">
            Shipment #{activeShipment.shipmentNumber}
          </h3>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Status: {activeShipment.status}
          </span>

          <Link
            href={`/shipments/${activeShipment.id}`}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span>Manage Details</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4-Pillar Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200 space-y-1">
          <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider block">Export Product</span>
          <strong className="block text-slate-900 text-sm font-bold truncate">
            {activeShipment.product.name}
          </strong>
          <span className="text-[11px] text-slate-500">
            Quantity: {activeShipment.quantity} {activeShipment.product.unit || 'MT'} ({activeShipment.weight.toLocaleString('en-IN')} KG)
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200 space-y-1">
          <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider block">Destination Port</span>
          <strong className="block text-slate-900 text-sm font-bold truncate">
            {activeShipment.destinationCity}, {activeShipment.destinationCountry.name}
          </strong>
          <span className="text-[11px] text-slate-500">
            Port of Loading: JNPT Nhava Sheva (INNSA1)
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200 space-y-1">
          <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider block">Declared Invoice Value</span>
          <strong className="block text-slate-900 text-sm font-bold font-mono">
            ₹{activeShipment.value.toLocaleString('en-IN')} {activeShipment.currency || 'INR'}
          </strong>
          <span className="text-[11px] text-emerald-700 font-semibold">
            Duty Drawback / RoDTEP Eligible
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200 space-y-1">
          <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider block">Logistics Quote Status</span>
          <strong className="block text-orange-700 text-sm font-bold">
            {hasSelectedQuote ? '✓ Provider Quote Selected' : `${activeShipment.quotes.length} Quotes Available`}
          </strong>
          <span className="text-[11px] text-slate-500">
            Mode: {activeShipment.mode || 'Ocean FCL Reefer'}
          </span>
        </div>
      </div>

      {/* Connected Action Buttons with Strict Hierarchy */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Link
          href={`/shipments/${activeShipment.id}/tracking`}
          className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all flex items-center gap-2 group cursor-pointer"
        >
          <MapPin className="w-4 h-4 text-white" />
          <span>Live Milestone Tracking</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href={`/shipments/${activeShipment.id}/quotes`}
          className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Truck className="w-4 h-4 text-orange-400" />
          <span>Compare Freight Quotes</span>
        </Link>

        <a
          href={`/api/export-documents/invoice?shipmentId=${activeShipment.id}`}
          download={`Commercial_Invoice_${activeShipment.shipmentNumber}.pdf`}
          className="px-4 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Download Commercial Invoice PDF</span>
        </a>
      </div>
    </div>
  );
}
