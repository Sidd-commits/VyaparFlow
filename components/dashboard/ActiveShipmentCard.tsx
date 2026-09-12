'use client';

import React from 'react';
import Link from 'next/link';
import {
  Truck,
  ArrowRight,
  Plus,
  ExternalLink,
  MapPin,
} from 'lucide-react';
import StatusBadge from './StatusBadge';

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
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
          Active Shipment
        </h2>

        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-900">No active shipment</h3>
              <p className="text-xs text-slate-500">
                Create an export shipment to manage carrier quotes, customs filings, and tracking.
              </p>
            </div>
          </div>

          <Link
            href="/shipments"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create shipment</span>
          </Link>
        </div>
      </div>
    );
  }

  const destinationText = activeShipment.destinationCity
    ? `${activeShipment.destinationCity}, ${activeShipment.destinationCountry.name}`
    : activeShipment.destinationCountry.name;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
          Active Shipment
        </h2>
        <span className="text-xs text-slate-500 font-mono">
          #{activeShipment.shipmentNumber}
        </span>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
        {/* Route & Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <span>Mumbai (JNPT)</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span>{destinationText}</span>
            </div>
            <p className="text-xs text-slate-500">
              {activeShipment.product.name} &bull; {activeShipment.quantity}{' '}
              {activeShipment.product.unit || 'MT'} ({activeShipment.weight.toLocaleString('en-IN')} kg)
            </p>
          </div>

          <div className="shrink-0">
            <StatusBadge status={activeShipment.status} />
          </div>
        </div>

        {/* Compact Metadata & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600">
            <span>
              Invoice Value: <strong className="text-slate-900 font-semibold font-mono">₹{activeShipment.value.toLocaleString('en-IN')}</strong>
            </span>
            <span>&bull;</span>
            <span>
              Mode: <strong className="text-slate-900 font-semibold">{activeShipment.mode || 'Sea Freight FCL'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/shipments/${activeShipment.id}/tracking`}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-orange-600" />
              <span>Tracking</span>
            </Link>

            <Link
              href={`/shipments/${activeShipment.id}`}
              className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <span>View shipment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
