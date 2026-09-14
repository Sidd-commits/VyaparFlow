import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { requireAuth, updateProviderTaskAction, verifyDocumentAction } from '@/app/actions';
import { prisma } from '@/lib/prisma';
import {
  Truck,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Eye,
  FileX2,
  Building,
  MapPin,
  Package,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProviderPage() {
  const { role, user } = await requireAuth();

  // Enforce strict Role-Based Access Control
  if (role !== 'PROVIDER' && role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Get all active provider tasks across system
  const providerTasks = await prisma.providerTask.findMany({
    include: {
      provider: true,
      shipment: { include: { business: true, product: true, destinationCountry: true } },
      requirement: {
        include: {
          documents: { orderBy: { uploadedAt: 'desc' } },
          productCountry: {
            include: {
              product: { include: { business: true } },
              country: true,
            },
          },
        },
      },
    },
    orderBy: { assignedAt: 'desc' },
  });

  return (
    <AppShell currentRole={role} userEmail={user?.email} userName={user?.name}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Header */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Accredited Trade Partner &amp; CHA Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
              Verification Queue &amp; Fulfillment Deck
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Audit submitted compliance documents (Certificate of Origin, Lab Reports), verify evidence, or issue rejection notices with mandatory audit remarks.
            </p>
          </div>
          <span className="text-xs bg-slate-900 text-white font-bold px-4 py-2 rounded-xl shrink-0">
            {providerTasks.length} Active Tasks
          </span>
        </div>

        {/* Task Cards List */}
        <div className="space-y-4">
          {providerTasks.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-900">All Tasks Completed</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                There are currently no pending document verifications or logistics tasks in your queue.
              </p>
            </div>
          ) : (
            providerTasks.map((task) => {
              const req = task.requirement;
              const doc = req?.documents?.[0];
              const exporterBusiness =
                task.shipment?.business || req?.productCountry?.product?.business;
              const product = task.shipment?.product || req?.productCountry?.product;
              const destination =
                task.shipment?.destinationCountry || req?.productCountry?.country;

              const isCompleted = task.status === 'completed';
              const isRejected = task.status === 'rejected';
              const isPending = task.status === 'in_progress' || task.status === 'requested';

              return (
                <div
                  key={task.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Truck className="w-5 h-5 text-orange-600 shrink-0" />
                        <span className="font-bold text-slate-900 text-base font-serif">
                          Task #{task.id.substring(0, 8)} &bull; {task.type}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isRejected
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Assigned Partner: <strong className="text-slate-800">{task.provider.name}</strong> ({task.provider.type})
                      </p>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      Assigned: {task.assignedAt.toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  {/* Exporter & Cargo Metadata Card */}
                  <div className="bg-[#FAF9F6] p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">
                        MSME Exporter
                      </span>
                      <span className="font-bold text-slate-900">
                        {exporterBusiness?.displayName || 'Exporter Private Limited'}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {exporterBusiness?.city || 'India'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">
                        Export Product &amp; HS Code
                      </span>
                      <span className="font-bold text-slate-900">
                        {product?.name || 'General Export Goods'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-600 block">
                        HS: {product?.hsCode || 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">
                        Target Destination Market
                      </span>
                      <span className="font-bold text-slate-900">
                        {destination?.name || 'Unspecified Corridor'}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        ISO: {destination?.isoCode || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Requirement Title and Uploaded Document Proof */}
                  {req && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Target Requirement
                          </span>
                          <strong className="text-slate-900 text-sm">{req.title}</strong>
                        </div>

                        {doc && (
                          <a
                            href={`/api/documents/${doc.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-xs border border-slate-300 shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" /> Preview File ({doc.originalName})
                          </a>
                        )}
                      </div>

                      {doc && (
                        <p className="text-slate-600 text-[11px]">
                          <span className="font-semibold text-slate-800">Exporter Submission Note:</span>{' '}
                          {doc.notes || 'Evidence submitted for platform compliance review.'}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Direct Document Verification Action Form */}
                  {doc && doc.status === 'under_review' && (
                    <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span className="font-bold text-amber-950 text-xs">
                          Platform Verification Audit Actions
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <form
                          action={async () => {
                            'use server';
                            await verifyDocumentAction(doc.id, 'verified');
                          }}
                        >
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve &amp; Clear Blocker
                          </button>
                        </form>

                        <form
                          action={async (formData: FormData) => {
                            'use server';
                            const reason =
                              (formData.get('rejectionReason') as string)?.trim() ||
                              'Certificate details do not match exporter consignee declaration.';
                            await verifyDocumentAction(doc.id, 'rejected', reason);
                          }}
                          className="flex items-center gap-2 flex-1 max-w-md"
                        >
                          <input
                            type="text"
                            name="rejectionReason"
                            placeholder="Mandatory rejection reason..."
                            defaultValue="Official chamber stamp or seal missing on uploaded certificate."
                            className="flex-1 p-2 rounded-lg border border-slate-300 bg-white text-xs"
                            required
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
                          >
                            <FileX2 className="w-3.5 h-3.5" /> Reject with Reason
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
