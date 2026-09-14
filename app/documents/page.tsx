import React from 'react';
import AppShell from '@/components/AppShell';
import { requireAuth, verifyDocumentAction } from '@/app/actions';
import { prisma } from '@/lib/prisma';
import EnterpriseDocumentUpload from '@/components/EnterpriseDocumentUpload';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileCheck2,
  FileX2,
  Eye,
  AlertOctagon,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Building,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DocumentsPage() {
  const { role, user } = await requireAuth();
  const business = user?.businesses?.[0];

  // Scoped strictly to authenticated user's business for MSME; all for Admin/Provider
  const [documents, requirementsNeedingDoc] = await Promise.all([
    prisma.document.findMany({
      where: role === 'MSME' ? { businessId: business?.id || 'none' } : {},
      include: {
        requirement: true,
        shipment: true,
        business: true,
      },
      orderBy: { uploadedAt: 'desc' },
    }),
    business?.id
      ? prisma.requirement.findMany({
          where: {
            productCountry: { product: { businessId: business.id } },
            type: { in: ['document', 'certification'] },
          },
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        })
      : Promise.resolve([]),
  ]);

  return (
    <AppShell currentRole={role} userEmail={user?.email} userName={user?.name}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Statutory Export Dossier
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
              Document Management & Verification
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Secure file vault, explicit state machine (Submitted &rarr; Under Review &rarr; Verified/Rejected), and tamper-evident audit logging.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              Total Documents: <strong className="text-slate-900">{documents.length}</strong>
            </span>
          </div>
        </div>

        {/* Verification Rule Notice */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/90 text-xs text-amber-900 flex items-start gap-3">
          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Core Compliance Rule: Uploaded &ne; Approved</span>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              When an exporter uploads a document (e.g. Certificate of Origin, Test Report), it enters the <span className="font-semibold text-amber-950">Verification Pending</span> state. The dispatch blocker remains active until an accredited service provider or platform verifier conducts an audit.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Enterprise Document Upload Component (For MSME) */}
          {role === 'MSME' && business && (
            <div className="lg:col-span-5">
              <EnterpriseDocumentUpload
                businessId={business.id}
                requirements={requirementsNeedingDoc}
              />
            </div>
          )}

          {/* Right Column: Document List & Status Timelines */}
          <div className={`${role === 'MSME' && business ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 font-serif">
                Compliance Document Dossier ({documents.length})
              </h3>
              {role === 'ADMIN' && (
                <span className="text-xs bg-slate-900 text-orange-400 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Platform Admin Reviewer
                </span>
              )}
            </div>

            {documents.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No Documents Uploaded Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Submit required export proof using the upload tool to initiate the platform verification workflow.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => {
                  const isVerified = doc.status === 'verified';
                  const isRejected = doc.status === 'rejected';
                  const isPending = doc.status === 'under_review';

                  return (
                    <div
                      key={doc.id}
                      className={`bg-white rounded-2xl border p-5 space-y-4 shadow-xs transition-all ${
                        isVerified
                          ? 'border-emerald-200'
                          : isRejected
                          ? 'border-red-200'
                          : 'border-amber-200'
                      }`}
                    >
                      {/* Top Bar: Name, Type, and Status Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                              isVerified
                                ? 'bg-emerald-100 text-emerald-700'
                                : isRejected
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">
                              {doc.originalName}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              Type: {doc.type} &bull; v{doc.version} &bull; {(doc.size / 1024).toFixed(0)} KB
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto flex items-center gap-1 ${
                            isVerified
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isRejected
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {isVerified ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Approved / Verified
                            </>
                          ) : isRejected ? (
                            <>
                              <AlertCircle className="w-3 h-3" />
                              Verification Rejected
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              Verification Pending
                            </>
                          )}
                        </span>
                      </div>

                      {/* Requirement Association & Notes */}
                      <div className="text-xs space-y-1.5">
                        {doc.requirement && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-medium">Fulfills Requirement:</span>
                            <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                              {doc.requirement.title}
                            </span>
                          </div>
                        )}
                        <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px]">
                          <strong className="text-slate-800">Audit Notes:</strong>{' '}
                          {doc.notes || 'No description notes provided.'}
                        </p>
                      </div>

                      {/* Explicit Document State Machine Timeline */}
                      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2 text-[11px]">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Verification Workflow Timeline
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                          {/* Step 1: Uploaded */}
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                              ✓
                            </div>
                            <div>
                              <span className="font-semibold text-slate-800 block">1. Submitted</span>
                              <span className="text-slate-500 text-[10px]">
                                {doc.uploadedAt.toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Step 2: Under Review */}
                          <div className="flex items-start gap-2">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 ${
                                isPending
                                  ? 'bg-amber-500 text-white animate-pulse'
                                  : 'bg-emerald-600 text-white'
                              }`}
                            >
                              {isPending ? '●' : '✓'}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-800 block">2. Under Review</span>
                              <span className="text-slate-500 text-[10px]">
                                {isPending ? 'Awaiting authorized verifier' : 'Audit completed'}
                              </span>
                            </div>
                          </div>

                          {/* Step 3: Approved / Rejected */}
                          <div className="flex items-start gap-2">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 ${
                                isVerified
                                  ? 'bg-emerald-600 text-white'
                                  : isRejected
                                  ? 'bg-red-600 text-white'
                                  : 'bg-slate-300 text-slate-600'
                              }`}
                            >
                              {isVerified ? '✓' : isRejected ? '✗' : '○'}
                            </div>
                            <div>
                              <span
                                className={`font-semibold block ${
                                  isVerified
                                    ? 'text-emerald-700'
                                    : isRejected
                                    ? 'text-red-700'
                                    : 'text-slate-500'
                                }`}
                              >
                                3. {isVerified ? 'Approved' : isRejected ? 'Rejected' : 'Final Audit'}
                              </span>
                              <span className="text-slate-500 text-[10px]">
                                {isVerified
                                  ? 'Platform Verified'
                                  : isRejected
                                  ? 'Action required'
                                  : 'Pending decision'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Actions: View Document & Admin/Provider Approval */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <a
                          href={`/api/documents/${doc.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-xs border border-slate-300 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" /> View Document
                        </a>

                        {/* Admin / Provider Action Buttons */}
                        {(role === 'ADMIN' || role === 'PROVIDER') && isPending && (
                          <div className="flex items-center gap-2">
                            <form
                              action={async () => {
                                'use server';
                                await verifyDocumentAction(doc.id, 'verified');
                              }}
                            >
                              <button
                                type="submit"
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Verify
                              </button>
                            </form>

                            <form
                              action={async () => {
                                'use server';
                                await verifyDocumentAction(
                                  doc.id,
                                  'rejected',
                                  'Document scan illegible or missing official seal/signature.'
                                );
                              }}
                            >
                              <button
                                type="submit"
                                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                              >
                                <FileX2 className="w-3.5 h-3.5" /> Reject Document
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
