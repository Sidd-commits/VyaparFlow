'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  FlaskConical,
  Truck,
  Ship,
  Plane,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
  Check,
  RotateCcw,
} from 'lucide-react';

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
  steps: {
    title: string;
    sub: string;
    badge: string;
    completed: boolean;
  }[];
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
        completed: true,
      },
      {
        title: 'NABL Laboratory Clearance',
        sub: 'APEDA Phytosanitary & Pesticide Residue Cert uploaded',
        badge: 'Passed',
        completed: true,
      },
      {
        title: 'Port CFS Gate-in & ICEGATE',
        sub: 'Shipping Bill SB-98214 registered • Container sealed',
        badge: 'Gate-In Done',
        completed: true,
      },
      {
        title: 'Customs LEO Clearance',
        sub: 'Let Export Order granted • 0% CEPA preferential tariff',
        badge: 'LEO Cleared',
        completed: true,
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
    ftaType: '4.8% REX Concession',
    icon: 'ship',
    steps: [
      {
        title: 'Mill Dispatch & Documentation',
        sub: 'Batch inspection passed • Commercial Dossier assembled',
        badge: 'Verified',
        completed: true,
      },
      {
        title: 'OEKO-TEX & REACH Compliance',
        sub: 'EU Safety standards validated by accredited lab',
        badge: 'Passed',
        completed: true,
      },
      {
        title: 'CFS Container Stuffing',
        sub: 'Hazira customs gate-in registered • RFID container seal',
        badge: 'Gate-In Done',
        completed: true,
      },
      {
        title: 'Customs LEO Release',
        sub: 'Shipping bill assessment cleared • Vessel boarding ordered',
        badge: 'LEO Cleared',
        completed: true,
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
    ftaType: 'IATA Non-DG Clearance',
    icon: 'plane',
    steps: [
      {
        title: 'Precision Quality QC',
        sub: 'PPAP level 3 clearance • Digitized packing manifest',
        badge: 'Verified',
        completed: true,
      },
      {
        title: 'Security & Aviation Screening',
        sub: 'IATA non-DG certification & dual-use audit pass',
        badge: 'Passed',
        completed: true,
      },
      {
        title: 'Airport Cargo Terminal Gate-in',
        sub: 'Airway Bill (AWB) verified • Customs examination',
        badge: 'Airside Gate-In',
        completed: true,
      },
      {
        title: 'Customs LEO Release',
        sub: 'Electronic LEO issued • Loaded on priority cargo flight',
        badge: 'LEO Cleared',
        completed: true,
      },
    ],
  },
];

export default function ExportRoadmapVisual() {
  const [activeRouteId, setActiveRouteId] = useState<string>('nashik-dubai');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(3); // All 4 completed by default

  const route = ROUTES.find((r) => r.id === activeRouteId) || ROUTES[0];

  const handleNextStep = () => {
    setActiveStepIndex((prev) => (prev < 3 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-4 select-none">
      {/* Route Switcher Pills */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
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
              className={`relative flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer truncate text-center ${
                isSelected
                  ? 'text-orange-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="roadmap-route-pill"
                  className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200/80"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 truncate block text-[11px] sm:text-xs">
                {r.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Pathway Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-5 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/5 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

        {/* Header Telemetry Strip */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0 shadow-2xs">
              {route.icon === 'plane' ? (
                <Plane className="w-4 h-4" />
              ) : (
                <Ship className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                {route.commodity}
              </h3>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate font-medium">
                <span>{route.origin}</span>
                <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="text-slate-700 font-semibold">{route.destination}</span>
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {route.ftaType}
            </span>
            <span className="block text-[10px] text-slate-500 mt-0.5 font-medium">
              {route.dutySaved}
            </span>
          </div>
        </div>

        {/* Visual Export Pathway (Roadmap Stepper) */}
        <div className="relative pl-6 space-y-4">
          {/* Vertical Connecting Line */}
          <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-slate-200" />
          <motion.div
            className="absolute left-[11px] top-3 w-0.5 bg-linear-to-b from-orange-500 to-emerald-500"
            initial={{ height: 0 }}
            animate={{
              height: `${(activeStepIndex / 3) * 100}%`,
            }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />

          {route.steps.map((step, idx) => {
            const isCompleted = idx <= activeStepIndex;
            const isCurrent = idx === activeStepIndex;

            return (
              <div
                key={step.title}
                onClick={() => setActiveStepIndex(idx)}
                className={`relative flex items-start justify-between gap-3 p-2.5 rounded-2xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-orange-50/50 border-orange-300 shadow-2xs'
                    : isCompleted
                    ? 'bg-white border-slate-200/90 hover:border-slate-300'
                    : 'bg-slate-50/50 border-slate-200/60 opacity-60'
                }`}
              >
                {/* Node Indicator Dot */}
                <div
                  className={`absolute -left-[27px] top-3 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-xs ${
                    isCurrent
                      ? 'bg-orange-600 text-white ring-4 ring-orange-100 scale-110'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                </div>

                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      0{idx + 1}
                    </span>
                    <h4
                      className={`font-bold text-xs truncate ${
                        isCurrent ? 'text-orange-950' : 'text-slate-900'
                      }`}
                    >
                      {step.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug truncate">
                    {step.sub}
                  </p>
                </div>

                <span
                  className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border self-center ${
                    idx === 3 && isCompleted
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : isCurrent
                      ? 'bg-orange-100 text-orange-800 border-orange-200'
                      : isCompleted
                      ? 'bg-slate-100 text-slate-700 border-slate-200'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  {step.badge}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer Metrics & Interactive Action */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span>Transit: <strong>{route.transit}</strong></span>
          </div>

          <button
            type="button"
            onClick={handleNextStep}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 font-semibold text-[11px] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Step {activeStepIndex + 1} of 4</span>
          </button>
        </div>
      </div>
    </div>
  );
}
