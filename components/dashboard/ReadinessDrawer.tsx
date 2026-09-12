'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Award,
  Box,
  Truck,
  Building2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { ReadinessScoreResult } from '@/lib/services/readiness';
import StatusBadge from './StatusBadge';

interface ReadinessDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  readinessData: ReadinessScoreResult;
  productName?: string;
  destinationCountryName?: string;
}

export default function ReadinessDrawer({
  isOpen,
  onClose,
  readinessData,
  productName = 'Export Product',
  destinationCountryName = 'Target Destination',
}: ReadinessDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { totalScore, readinessState, categoryScores, blockers } = readinessData;
  const isHealthy = totalScore >= 85 && blockers.length === 0;

  const pillars = [
    {
      id: 'business',
      label: '1. Business Profile & Registrations',
      score: categoryScores.business.score,
      weight: '20%',
      href: '/business',
      icon: Building2,
      desc: 'GSTIN, IEC code active status and exporter registration.',
    },
    {
      id: 'documents',
      label: '2. Export Documents',
      score: categoryScores.documents.score,
      weight: '25%',
      href: '/documents',
      icon: FileText,
      desc: 'Commercial Invoice, Packing List, Certificate of Origin.',
    },
    {
      id: 'certifications',
      label: '3. Product Certifications',
      score: categoryScores.certifications.score,
      weight: '20%',
      href: '/certifications',
      icon: Award,
      desc: 'NABL laboratory assays, phytosanitary and sector-specific certs.',
    },
    {
      id: 'packaging',
      label: '4. Packaging & Labelling',
      score: categoryScores.packaging.score,
      weight: '15%',
      href: '/packaging',
      icon: Box,
      desc: 'Bilingual labels, ISPM-15 wooden pallets, tamper seals.',
    },
    {
      id: 'shipment',
      label: '5. Shipment Prerequisites',
      score: categoryScores.shipment.score,
      weight: '20%',
      href: '/shipments',
      icon: Truck,
      desc: 'Freight quotes, carrier booking, and port slot reservation.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="readiness-drawer-title">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 block">
              Readiness Breakdown
            </span>
            <h2 id="readiness-drawer-title" className="text-lg font-bold text-slate-900">
              Export Readiness Audit
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {productName} &rarr; {destinationCountryName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* Overall Score Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Overall Index
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-black text-slate-900 font-mono">
                  {totalScore}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </div>
            </div>

            <StatusBadge
              status={isHealthy ? 'Green Channel Active' : readinessState}
              variant={isHealthy ? 'verified' : 'pending'}
            />
          </div>

          {/* 5-Pillars Weighted Matrix */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Weighted Compliance Pillars
            </h3>

            <div className="space-y-2.5">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <Link
                    key={pillar.id}
                    href={pillar.href}
                    onClick={onClose}
                    className="block p-3.5 rounded-xl border border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/20 transition-all group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs">
                        <Icon className="w-4 h-4 text-slate-500 group-hover:text-orange-600 transition-colors" />
                        <span>{pillar.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-medium">{pillar.weight} weight</span>
                        <span className="font-bold text-slate-900 font-mono text-xs">
                          {pillar.score}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pillar.score >= 80
                            ? 'bg-emerald-500'
                            : pillar.score >= 50
                            ? 'bg-amber-500'
                            : 'bg-orange-500'
                        }`}
                        style={{ width: `${pillar.score}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1.5 leading-normal">
                      {pillar.desc}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/60 font-semibold text-xs cursor-pointer transition-colors"
          >
            Close
          </button>

          <Link
            href="/readiness"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>Open Full Readiness Page</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
