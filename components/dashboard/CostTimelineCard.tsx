import React from 'react';
import { TrendingUp } from 'lucide-react';

interface CostTimelineCardProps {
  originCity?: string;
  destinationPortName?: string;
  cargoMode?: string;
  leadTimeDays?: string;
  costRange?: string;
  transitTimeDays?: string;
}

export default function CostTimelineCard({
  originCity = 'Origin Factory',
  destinationPortName = 'Destination Port',
  cargoMode = 'Sea Freight FCL 20ft Cargo',
  leadTimeDays = '4–6 Days',
  costRange = '₹125,000 – ₹155,000',
  transitTimeDays = '12–15 Days',
}: CostTimelineCardProps) {
  return (
    <div className="bg-[#090D16] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-lg font-bold font-serif text-white">
              Cost &amp; Timeline Predictive Intelligence
            </h4>
            <p className="text-xs text-slate-400">
              Calculated based on historical port clearance velocities and active carrier freight schedules
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-orange-500/15 text-orange-400 font-mono font-bold px-3 py-1 rounded-full border border-orange-500/30">
          INDICATIVE ESTIMATE
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-1.5">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
            Estimated Preparation Lead Time
          </span>
          <span className="block text-2xl sm:text-3xl font-black font-serif text-white font-mono">
            {leadTimeDays}
          </span>
          <span className="text-[11px] text-slate-400 block pt-1">
            Phytosanitary &amp; NABL lab test certification turnaround
          </span>
        </div>

        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-1.5">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
            Estimated Freight Logistics Cost
          </span>
          <span className="block text-2xl sm:text-3xl font-black font-serif text-orange-400 font-mono">
            {costRange}
          </span>
          <span className="text-[11px] text-slate-400 block pt-1">
            {cargoMode} to {destinationPortName}
          </span>
        </div>

        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-1.5">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
            Estimated Ocean Transit Time
          </span>
          <span className="block text-2xl sm:text-3xl font-black font-serif text-white font-mono">
            {transitTimeDays}
          </span>
          <span className="text-[11px] text-slate-400 block pt-1">
            {originCity} to {destinationPortName}
          </span>
        </div>
      </div>
    </div>
  );
}
