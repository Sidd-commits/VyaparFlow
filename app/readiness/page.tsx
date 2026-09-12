import React from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { requireAuth } from '@/app/actions';
import { prisma } from '@/lib/prisma';
import { calculateReadinessScore } from '@/lib/services/readiness';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Award,
  Box,
  Truck,
  ArrowRight,
  ShieldCheck,
  Info,
  ChevronRight,
  AlertOctagon,
} from 'lucide-react';

export default async function ReadinessPage() {
  const { role, user } = await requireAuth();
  const business = user?.businesses[0];
  const product = business?.products[0];
  const destination = product?.destinations[0];

  let readiness = null;
  let pcDetails = null;

  if (destination) {
    readiness = await calculateReadinessScore(destination.id);
    pcDetails = await prisma.productCountry.findUnique({
      where: { id: destination.id },
      include: {
        product: { include: { category: true } },
        country: true,
        requirements: {
          include: {
            rule: true,
            documents: true,
          },
          orderBy: { priority: 'asc' },
        },
        packagingItems: true,
      },
    });
  }

  return (
    <AppShell currentRole={role} userEmail={user?.email} userName={user?.name}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Explainable Export Compliance Engine
            </span>
            <h1 className="text-3xl font-black text-slate-900 font-serif">
              Export Readiness Assessment
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Target Product: <span className="font-bold text-slate-900">{product?.name}</span> | Target Country:{' '}
              <span className="font-bold text-slate-900">{destination?.country.name}</span>
            </p>
          </div>

          {readiness && (
            <div className="flex items-center gap-4 bg-slate-900 text-white p-4 rounded-xl shadow-md">
              <div className="text-right">
                <span className="block text-[10px] text-slate-400 font-semibold uppercase">Overall Index</span>
                <span className="text-3xl font-black text-orange-400 font-serif">{readiness.totalScore} / 100</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center font-bold text-white text-xs">
                {readiness.readinessState.includes('Blockers') ? '!' : '✓'}
              </div>
            </div>
          )}
        </div>

        {/* Explainable Category Weights Grid */}
        {readiness && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-slate-900 font-serif">
              Category Weight & Compliance Contribution Breakdown
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                  <span>Business Registrations</span>
                  <span className="text-slate-900 font-bold">20% Weight</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">{readiness.categoryScores.business.score}%</div>
                <p className="text-[11px] text-slate-500">GSTIN, IEC code active status</p>
              </div>

              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                  <span>Export Documents</span>
                  <span className="text-slate-900 font-bold">25% Weight</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">{readiness.categoryScores.documents.score}%</div>
                <p className="text-[11px] text-slate-500">APEDA, Invoice, CoO proofs</p>
              </div>

              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                  <span>Certifications</span>
                  <span className="text-slate-900 font-bold">20% Weight</span>
                </div>
                <div className="text-2xl font-bold text-amber-600">{readiness.categoryScores.certifications.score}%</div>
                <p className="text-[11px] text-slate-500">Phytosanitary & Halal lab certs</p>
              </div>

              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                  <span>Packaging & Labelling</span>
                  <span className="text-slate-900 font-bold">15% Weight</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{readiness.categoryScores.packaging.score}%</div>
                <p className="text-[11px] text-slate-500">Bilingual Arabic labels, sealing</p>
              </div>

              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                  <span>Shipment Prerequisites</span>
                  <span className="text-slate-900 font-bold">20% Weight</span>
                </div>
                <div className="text-2xl font-bold text-slate-700">{readiness.categoryScores.shipment.score}%</div>
                <p className="text-[11px] text-slate-500">Logistics quotes & draft docs</p>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Requirements Checklist */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-serif">
                Product-Country Compliance Requirements Checklist
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every requirement includes source regulation notes and explainable reasoning for Indian exporters.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {pcDetails?.requirements.map((req) => (
              <div
                key={req.id}
                className={`p-5 rounded-2xl border transition-all ${
                  req.status === 'verified'
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : req.priority === 'critical'
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{req.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          req.priority === 'critical'
                            ? 'bg-red-100 text-red-700'
                            : req.priority === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {req.priority} Priority
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                          req.status === 'verified'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : req.status === 'under_review'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        Status: {req.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">{req.reason || req.rule?.description}</p>

                    {req.rule?.notes && (
                      <div className="flex items-start gap-1.5 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-2">
                        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Regulatory Basis:</strong> {req.rule.notes}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right Action Button */}
                  <div className="shrink-0">
                    {req.type === 'document' && (
                      <Link
                        href="/documents"
                        className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                      >
                        {req.status === 'verified' ? 'View Uploaded Proof' : 'Upload Document Proof'}
                      </Link>
                    )}

                    {req.type === 'certification' && (
                      <Link
                        href="/certifications"
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                      >
                        {req.status === 'verified' ? 'View Certificate' : 'Request Accredited Lab Cert'}
                      </Link>
                    )}

                    {(req.type === 'packaging' || req.type === 'labelling') && (
                      <Link
                        href="/packaging"
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                      >
                        Complete Checklist
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
