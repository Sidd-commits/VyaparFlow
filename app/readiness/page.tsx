import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
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
  AlertCircle,
} from 'lucide-react';

export default async function ReadinessPage() {
  const { role, user } = await requireAuth();
  if (role === 'PROVIDER') redirect('/provider');
  if (role === 'ADMIN') redirect('/admin');

  const business = user?.businesses?.[0];
  if (!business || (business.profileCompletion && business.profileCompletion < 50) || !business.products || business.products.length === 0) {
    redirect('/onboarding');
  }

  const product = business?.products?.[0];
  const destination = product?.destinations?.[0];

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
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
              Export Readiness Assessment
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Target Product: <span className="font-bold text-slate-900">{product?.name}</span> &bull; Target Country:{' '}
              <span className="font-bold text-slate-900">{destination?.country.name}</span>
            </p>
          </div>

          {readiness && (
            <div className="flex items-center gap-4 bg-slate-900 text-white p-4 rounded-xl shadow-md shrink-0">
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

        {/* Core Compliance Rule Notice */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Compliance Status Hierarchy</span>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              <span className="font-semibold text-emerald-900">Green = Approved</span> &bull;{' '}
              <span className="font-semibold text-amber-900">Yellow = Verification Pending (Still a Blocker)</span> &bull;{' '}
              <span className="font-semibold text-red-900">Red = Rejected / Missing (Action Required)</span> &bull;{' '}
              <span className="font-semibold text-slate-700">Gray = Not Started</span>
            </p>
          </div>
        </div>

        {/* Explainable Category Weights Grid */}
        {readiness && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-slate-900 font-serif">
              Category Weight &amp; Compliance Contribution Breakdown
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
                <p className="text-[11px] text-slate-500">Invoice, CoO, Packing List proofs</p>
              </div>

              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                  <span>Certifications</span>
                  <span className="text-slate-900 font-bold">20% Weight</span>
                </div>
                <div className="text-2xl font-bold text-amber-600">{readiness.categoryScores.certifications.score}%</div>
                <p className="text-[11px] text-slate-500">Industry-specific lab test certs</p>
              </div>

              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                  <span>Packaging &amp; Labelling</span>
                  <span className="text-slate-900 font-bold">15% Weight</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{readiness.categoryScores.packaging.score}%</div>
                <p className="text-[11px] text-slate-500">Bilingual labels, tamper sealing</p>
              </div>

              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                  <span>Shipment Prerequisites</span>
                  <span className="text-slate-900 font-bold">20% Weight</span>
                </div>
                <div className="text-2xl font-bold text-slate-700">{readiness.categoryScores.shipment.score}%</div>
                <p className="text-[11px] text-slate-500">Carrier quotes &amp; draft docs</p>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Requirements Checklist */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-serif">
                Tailored Compliance Requirements Checklist
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every requirement is personalized to your business domain, export product, and destination country.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {pcDetails?.requirements.map((req) => {
              const isVerified = req.status === 'verified';
              const isPending = req.status === 'under_review';
              const isRejected = req.status === 'rejected';

              return (
                <div
                  key={req.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isVerified
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : isPending
                      ? 'bg-amber-50/50 border-amber-300'
                      : isRejected
                      ? 'bg-red-50/50 border-red-300'
                      : req.priority === 'critical'
                      ? 'bg-amber-50/30 border-amber-200'
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
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize flex items-center gap-1 ${
                            isVerified
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isPending
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : isRejected
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {isVerified ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Verified &amp; Approved
                            </>
                          ) : isPending ? (
                            <>
                              <Clock className="w-3 h-3 text-amber-600" /> Verification Pending
                            </>
                          ) : isRejected ? (
                            <>
                              <AlertCircle className="w-3 h-3 text-red-600" /> Rejected — Action Required
                            </>
                          ) : (
                            'Status: Not Started'
                          )}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">
                        {isPending
                          ? 'Document evidence submitted. Awaiting review by authorized review partner.'
                          : req.reason || req.rule?.description}
                      </p>

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
                          className={`px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1 ${
                            isVerified
                              ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                              : isPending
                              ? 'bg-amber-600 hover:bg-amber-700 text-white'
                              : isRejected
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-orange-600 hover:bg-orange-700 text-white'
                          }`}
                        >
                          {isVerified
                            ? 'View Uploaded Proof'
                            : isPending
                            ? 'View Status'
                            : isRejected
                            ? 'Replace Document'
                            : 'Upload Document Proof'}
                        </Link>
                      )}

                      {req.type === 'certification' && (
                        <Link
                          href="/certifications"
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                        >
                          {isVerified ? 'View Certificate' : 'Request Accredited Lab Cert'}
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
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
