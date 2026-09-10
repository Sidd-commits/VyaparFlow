import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { requireAuth, getAllUsers } from '@/app/actions';
import { prisma } from '@/lib/prisma';
import { Package, Globe, ArrowRight } from 'lucide-react';

export default async function ProductsPage() {
  const { role, user } = await requireAuth();
  const allUsers = await getAllUsers();
  const business = user?.businesses[0];

  const products = await prisma.product.findMany({
    where: { businessId: business?.id },
    include: {
      category: true,
      destinations: { include: { country: true } },
    },
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 pb-16 font-sans">
      <Navbar currentRole={role} userEmail={user?.email} userName={user?.name} allUsers={allUsers} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Export Product Catalog & Market Setup
            </span>
            <h1 className="text-3xl font-black text-slate-900 font-serif">
              Products & Destination Markets
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Configure product HS codes, default invoice values, and target export country mappings.
            </p>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-orange-600 uppercase">{p.category.name}</span>
                  <h3 className="text-xl font-bold text-slate-900 font-serif">{p.name}</h3>
                  <span className="inline-block text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md">
                    HS Code: {p.hsCode}
                  </span>
                </div>
              </div>

              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-orange-600" /> Target Destination Countries
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {p.destinations.map((d) => (
                    <span
                      key={d.id}
                      className="bg-white text-slate-800 font-bold px-3 py-1 rounded-lg border border-slate-300 flex items-center gap-1"
                    >
                      🇦🇪 {d.country.name} ({d.country.isoCode})
                    </span>
                  ))}
                </div>
              </div>

              <Link
                href="/readiness"
                className="block w-full py-2.5 text-center bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Run Readiness Assessment for Product →
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
