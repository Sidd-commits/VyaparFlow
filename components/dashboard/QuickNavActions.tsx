'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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

      {/* Skiper UI Bento Grid with Vengeance Displacement Hover */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.name}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Link
                href={action.href}
                prefetch={true}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-orange-300 hover:shadow-md hover:shadow-orange-600/5 transition-all flex flex-col justify-between group h-full block"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/80 group-hover:bg-orange-50 group-hover:border-orange-200 text-slate-600 group-hover:text-orange-600 flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </div>
                <div className="mt-2.5 space-y-0.5">
                  <span className="block font-bold text-slate-900 text-xs truncate group-hover:text-orange-600 transition-colors">
                    {action.name}
                  </span>
                  <span className="block text-[10px] text-slate-400 truncate">
                    {action.desc}
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}