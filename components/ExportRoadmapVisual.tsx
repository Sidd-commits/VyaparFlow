'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ship,
  Plane,
  Check,
  Clock,
  RotateCcw,
  MapPin,
} from 'lucide-react';

interface RouteStep {
  title: string;
  sub: string;
  badge: string;
  isLast?: boolean;
}

interface RouteData {
  id: string;
  label: string;
  commodity: string;
  origin: string;
  destination: string;
  transit: string;
  dutySaved: string;
  ftaType: string;
  icon: 'ship' | 'plane';
  steps: RouteStep[];
}

const ROUTES: RouteData[] = [
  {
    id: 'nashik-dubai',
    label: 'Nashik → Dubai',
    commodity: 'Sonaka Table Grapes',
    origin: 'JNPT Nhava Sheva',
    destination: 'Jebel Ali Port (UAE)',
    transit: '4–5 Days Ocean Reefer',
    dutySaved: '₹1.48L Saved',
    ftaType: '0% CEPA Duty',
    icon: 'ship',
    steps: [
      {
        title: 'Factory Readiness Audit',
        sub: 'Export readiness 100/100 • Automated Invoice & Packing List',
        badge: 'Verified',
      },
      {
        title: 'NABL Laboratory Clearance',
        sub: 'APEDA Phytosanitary & Pesticide Residue Cert uploaded',
        badge: 'Passed',
      },
      {
        title: 'Port CFS Gate-in & ICEGATE',
        sub: 'Shipping Bill SB-98214 registered • Container sealed',
        badge: 'Gate-In Done',
      },
      {
        title: 'Customs LEO Clearance',
        sub: 'Let Export Order granted • 0% CEPA preferential tariff',
        badge: 'LEO Cleared',
        isLast: true,
      },
    ],
  },
  {
    id: 'surat-rotterdam',
    label: 'Surat → Rotterdam',
    commodity: 'Woven Synthetic Fabrics',
    origin: 'Hazira Port Terminal',
    destination: 'Rotterdam Port (EU)',
    transit: '21–23 Days Ocean FCL',
    dutySaved: '₹2.24L Saved',
    ftaType: '4.8% REX Duty',
    icon: 'ship',
    steps: [
      {
        title: 'Mill Dispatch & Documentation',
        sub: 'Batch inspection passed • Commercial Dossier assembled',
        badge: 'Verified',
      },
      {
        title: 'OEKO-TEX & REACH Compliance',
        sub: 'EU safety standards validated by accredited lab',
        badge: 'Passed',
      },
      {
        title: 'Port CFS Gate-in & Stuffing',
        sub: 'Hazira customs gate-in registered • RFID container seal',
        badge: 'Gate-In Done',
      },
      {
        title: 'Customs LEO Clearance',
        sub: 'Shipping bill assessment cleared • Vessel boarding ordered',
        badge: 'LEO Cleared',
        isLast: true,
      },
    ],
  },
  {
    id: 'pune-frankfurt',
    label: 'Pune → Frankfurt',
    commodity: 'Precision CNC Auto Housings',
    origin: 'Mumbai Air Cargo (BOM)',
    destination: 'Frankfurt CargoCity (DE)',
    transit: '16 Hours Air Priority',
    dutySaved: 'Zero Delay',
    ftaType: 'IATA Non-DG Cert',
    icon: 'plane',
    steps: [
      {
        title: 'Precision QC & PPAP Clearance',
        sub: 'PPAP Level 3 clearance • Digitized packing manifest',
        badge: 'Verified',
      },
      {
        title: 'Security & Aviation Screening',
        sub: 'IATA non-DG certification & dual-use audit pass',
        badge: 'Passed',
      },
      {
        title: 'Airport Cargo Terminal Gate-in',
        sub: 'Airway Bill (AWB) verified • Customs examination',
        badge: 'Gate-In Done',
      },
      {
        title: 'Customs LEO Clearance',
        sub: 'Electronic LEO issued • Loaded on priority cargo flight',
        badge: 'LEO Cleared',
        isLast: true,
      },
    ],
  },
];

export default function ExportRoadmapVisual() {
  const [activeRouteId, setActiveRouteId] = useState<string>('nashik-dubai');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(3); // All 4 completed, 4th active by default

  const route = ROUTES.find((r) => r.id === activeRouteId) || ROUTES[0];

  const handleNextStep = () => {
    setActiveStepIndex((prev) => (prev < 3 ? prev + 1 : 0));
  };

  return (
    <div className="w-full space-y-4 select-none">
      {/* Route Switcher Segmented Control */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#F1EFEA] rounded-full border border-slate-200/80 shadow-2xs">
        {ROUTES.map((r) => {
          const isSelected = r.id === activeRouteId;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setActiveRouteId(r.id);
                setActiveStepIndex(3);
              }}
              className={`relative flex-1 py-2 px-3 sm:px-4 rounded-full text-xs font-semibold transition-all cursor-pointer truncate text-center ${
                isSelected
                  ? 'text-orange-950 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="active-route-pill"
                  className="absolute inset-0 bg-white rounded-full shadow-xs border border-slate-200/60"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10">{r.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Roadmap Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5 relative">
        {/* Card Header: Commodity, Corridor, FTA Badge & Savings */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200/70 text-orange-600 flex items-center justify-center shrink-0 shadow-2xs">
              {route.icon === 'ship' ? (
                <Ship className="w-5 h-5" />
              ) : (
                <Plane className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight truncate">
                {route.commodity}
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                {route.origin} → {route.destination}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
              {route.ftaType}
            </span>
            <span className="block text-xs font-semibold text-slate-600 mt-1">
              {route.dutySaved}
            </span>
          </div>
        </div>

        {/* Vertical Stepper with Continuous Connecting Line */}
        <div className="relative pl-8 space-y-3 pt-1 pb-1">
          {/* Vertical Connecting Track */}
          <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-emerald-600/30" />
          
          {/* Continuous Colored Line matching Image 1 */}
          <div 
            className="absolute left-[11px] top-4 w-[2px] transition-all duration-300"
            style={{
              height: `${Math.min(activeStepIndex, 3) * 33.33}%`,
              background: 'linear-gradient(to bottom, #059669 0%, #d97706 70%, #ea580c 100%)',
            }}
          />

          {route.steps.map((step, idx) => {
            const isCompleted = idx <= activeStepIndex;
            const isCurrent = idx === activeStepIndex;

            return (
              <div
                key={step.title}
                onClick={() => setActiveStepIndex(idx)}
                className={`relative flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-orange-50/30 border-orange-300 shadow-2xs'
                    : isCompleted
                    ? 'bg-white border-slate-200/90 hover:border-slate-300'
                    : 'bg-slate-50/50 border-slate-200/60 opacity-60'
                }`}
              >
                {/* Node Indicator Dot with Line Node Centering */}
                <div
                  className={`absolute -left-[29px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                    isCurrent
                      ? 'bg-orange-600 text-white ring-4 ring-orange-100 scale-105'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                {/* Step Text Details */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-400 font-mono">
                      0{idx + 1}
                    </span>
                    <h4
                      className={`font-bold text-xs sm:text-sm truncate ${
                        isCurrent ? 'text-slate-900' : 'text-slate-800'
                      }`}
                    >
                      {step.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug truncate">
                    {step.sub}
                  </p>
                </div>

                {/* Step Badge */}
                <span
                  className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full border self-center transition-colors ${
                    step.isLast && isCompleted
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                      : isCurrent
                      ? 'bg-orange-100 text-orange-900 border-orange-200'
                      : isCompleted
                      ? 'bg-slate-100 text-slate-700 border-slate-200/70'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  {step.badge}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer: Transit Time & Interactive Step Pill */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <Clock className="w-4 h-4 text-orange-600 shrink-0" />
            <span>
              Transit: <strong className="text-slate-800">{route.transit}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={handleNextStep}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50/80 hover:bg-orange-100 text-orange-800 border border-orange-200/90 font-medium text-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Step {activeStepIndex + 1} of 4</span>
          </button>
        </div>
      </div>

      {/* Direct Gateways Footnote below Card */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pt-0.5 px-1">
        <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
        <span>Direct Gateways: JNPT • Mundra • Hazira • Chennai • BOM Air Cargo</span>
      </div>
    </div>
  );
}

