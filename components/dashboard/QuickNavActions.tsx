'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  Award,
  Box,
  Truck,
  Building2,
  FileCheck2,
} from 'lucide-react';

const ACTIONS = [
  {
    name: 'Documents',
    href: '/documents',
    icon: FileText,
    desc: 'Invoices, CoO & uploads',
  },
  {
    name: 'Certifications',
    href: '/certifications',
    icon: Award,
    desc: 'Lab tests & compliance',
  },
  {
    name: 'Packaging & Labels',
    href: '/packaging',
    icon: Box,
    desc: 'Pallets & bilingual labels',
  },
  {
    name: 'Shipments',
    href: '/shipments',
    icon: Truck,
    desc: 'Freight quotes & tracking',
  },
  {
    name: 'Readiness Audit',
    href: '/readiness',
    icon: FileCheck2,
    desc: '5-pillar score breakdown',
  },
  {
    name: 'Company Profile',
    href: '/business',
    icon: Building2,
    desc: 'GSTIN, IEC & registrations',
  },
];

export default function QuickNavActions() {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
        Quick Access
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.name}
              href={action.href}
              className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-orange-300 hover:bg-orange-50/20 transition-all flex flex-col justify-between group"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/80 group-hover:bg-orange-100/50 group-hover:border-orange-200 text-slate-600 group-hover:text-orange-600 flex items-center justify-center transition-colors">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="mt-2 space-y-0.5">
                <span className="block font-bold text-slate-900 text-xs truncate">
                  {action.name}
                </span>
                <span className="block text-[10px] text-slate-400 truncate">
                  {action.desc}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
