'use client';

import React, { useState, useTransition } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  FileX2,
  Building2,
  MapPin,
  Package,
  Search,
  Filter,
  Award,
  ShieldCheck,
  Check,
  ChevronDown,
  XCircle,
  FlaskConical,
} from 'lucide-react';
import { verifyDocumentAction, updateProviderTaskAction, completeLabAuditAction } from '@/app/actions';

interface TaskItem {
  id: string;
  type: string;
  status: string;
  notes: string | null;
  assignedAt: string | Date;
  completedAt: string | Date | null;
  provider: {
    id: string;
    name: string;
    type: string;
  };
  requirement?: {
    id: string;
    title: string;
    type: string;
    priority: string;
    status: string;
    reason: string | null;
    documents?: Array<{
      id: string;
      originalName: string;
      storageKey: string;
      status: string;
      notes: string | null;
      uploadedAt: string | Date;
      mimeType: string;
      size: number;
    }>;
    productCountry?: {
      product: {
        name: string;
        hsCode: string;
        business?: {
          displayName: string;
          legalName: string;
          city: string;
          state: string;
        };
      };
      country: {
        name: string;
        isoCode: string;
      };
    };
  } | null;
  shipment?: {
    id: string;
    shipmentNumber: string;
    value: number;
    quantity: number;
    weight: number;
    destinationCity: string;
    business?: {
      displayName: string;
      city: string;
      state: string;
    };
    product?: {
      name: string;
      hsCode: string;
    };
    destinationCountry?: {
      name: string;
      isoCode: string;
    };
  } | null;
}

interface ProviderVerificationDeckProps {
  tasks: TaskItem[];
  currentProviderType?: string;
}

export default function ProviderVerificationDeck({
  tasks,
  currentProviderType,
}: ProviderVerificationDeckProps) {
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeModalTaskId, setActiveModalTaskId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredTasks = tasks.filter((t) => {
    // Filter by tab status
    const isCompleted = t.status === 'completed' || t.requirement?.status === 'verified';
    const isRejected = t.status === 'rejected' || t.requirement?.status === 'rejected';
    const isPending = !isCompleted && !isRejected;

    if (filterTab === 'PENDING' && !isPending) return false;
    if (filterTab === 'COMPLETED' && !isCompleted) return false;
    if (filterTab === 'REJECTED' && !isRejected) return false;

    // Filter by category
    if (selectedCategory !== 'ALL' && t.type !== selectedCategory) return false;

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const taskNum = t.id.toLowerCase();
      const reqTitle = t.requirement?.title?.toLowerCase() || '';
      const prodName =
        t.shipment?.product?.name?.toLowerCase() ||
        t.requirement?.productCountry?.product?.name?.toLowerCase() ||
        '';
      const bizName =
        t.shipment?.business?.displayName?.toLowerCase() ||
        t.requirement?.productCountry?.product?.business?.displayName?.toLowerCase() ||
        '';
      const hsCode =
        t.shipment?.product?.hsCode?.toLowerCase() ||
        t.requirement?.productCountry?.product?.hsCode?.toLowerCase() ||
        '';

      return (
        taskNum.includes(q) ||
        reqTitle.includes(q) ||
        prodName.includes(q) ||
        bizName.includes(q) ||
        hsCode.includes(q)
      );
    }

    return true;
  });

  const pendingCount = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'rejected' && t.requirement?.status !== 'verified'
  ).length;
  const completedCount = tasks.filter(
    (t) => t.status === 'completed' || t.requirement?.status === 'verified'
  ).length;
  const rejectedCount = tasks.filter(
    (t) => t.status === 'rejected' || t.requirement?.status === 'rejected'
  ).length;

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setFilterTab('PENDING')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'PENDING'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilterTab('COMPLETED')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'COMPLETED'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Cleared ({completedCount})
          </button>
          <button
            onClick={() => setFilterTab('REJECTED')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'REJECTED'
                ? 'bg-white text-red-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            Exceptions ({rejectedCount})
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search exporter, HS code, or task..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none transition-colors"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="CERTIFICATION">Laboratory &amp; Phytosanitary</option>
            <option value="CUSTOMS_CHA">Customs &amp; CHA</option>
            <option value="FREIGHT">Freight &amp; Cargo</option>
          </select>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 font-serif">Queue is Clean</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || filterTab !== 'ALL'
                ? 'No verification tasks match your current filter criteria.'
                : 'All document audits, lab test assessments, and customs clearances are currently up to date.'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const req = task.requirement;
            const doc = req?.documents?.[0];
            const exporterBusiness =
              task.shipment?.business || req?.productCountry?.product?.business;
            const product = task.shipment?.product || req?.productCountry?.product;
            const destination =
              task.shipment?.destinationCountry || req?.productCountry?.country;

            const isCompleted = task.status === 'completed' || req?.status === 'verified';
            const isRejected = task.status === 'rejected' || req?.status === 'rejected';
            const isPending = !isCompleted && !isRejected;

            const assignedDateStr = new Date(task.assignedAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={task.id}
                className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all space-y-5"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          task.type === 'CERTIFICATION'
                            ? 'bg-emerald-50 text-emerald-600'
                            : task.type === 'CUSTOMS_CHA'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-orange-50 text-orange-600'
                        }`}
                      >
                        {task.type === 'CERTIFICATION' ? (
                          <FlaskConical className="w-4 h-4" />
                        ) : task.type === 'CUSTOMS_CHA' ? (
                          <ShieldCheck className="w-4 h-4" />
                        ) : (
                          <Package className="w-4 h-4" />
                        )}
                      </div>

                      <span className="font-bold text-slate-900 text-base font-serif">
                        Task #{task.id.substring(0, 8)} &bull; {task.type.replace('_', ' ')}
                      </span>

                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full capitalize ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isRejected
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {isCompleted
                          ? 'Audit Cleared ✓'
                          : isRejected
                          ? 'Audit Rejected ✗'
                          : 'Pending Review'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">
                      Assigned to partner: <strong className="text-slate-800">{task.provider.name}</strong>
                    </p>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium shrink-0">
                    Assigned: {assignedDateStr}
                  </span>
                </div>

                {/* Exporter & Cargo Metadata Strip */}
                <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-slate-200/90 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">
                      MSME Exporter Entity
                    </span>
                    <span className="font-bold text-slate-900 block truncate">
                      {exporterBusiness?.displayName || 'Exporter Enterprise'}
                    </span>
                    <span className="text-[11px] text-slate-500 block flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {exporterBusiness?.city || 'Mumbai'}, {exporterBusiness?.state || 'India'}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">
                      Product &amp; HS Code
                    </span>
                    <span className="font-bold text-slate-900 block truncate">
                      {product?.name || 'General Export Consignment'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-600 block">
                      HS: {product?.hsCode || 'N/A'}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">
                      Target Trade Corridor
                    </span>
                    <span className="font-bold text-slate-900 block truncate">
                      {destination?.name || 'International Corridor'}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Destination ISO: {destination?.isoCode || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Requirement & Evidence Section */}
                {req && (
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Regulatory Requirement Target
                        </span>
                        <strong className="text-slate-900 text-sm font-serif block">
                          {req.title}
                        </strong>
                      </div>

                      {doc && (
                        <a
                          href={`/${doc.storageKey}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-xs border border-slate-300 transition-colors shrink-0"
                        >
                          <Eye className="w-3.5 h-3.5 text-orange-600" /> Preview Evidence ({doc.originalName})
                        </a>
                      )}
                    </div>

                    {req.reason && (
                      <p className="text-slate-600 text-[11px] bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="font-semibold text-slate-800">Compliance Requirement Summary:</span>{' '}
                        {req.reason}
                      </p>
                    )}

                    {doc?.notes && (
                      <p className="text-slate-500 text-[11px]">
                        <span className="font-semibold text-slate-700">Exporter Submission Remark:</span> {doc.notes}
                      </p>
                    )}
                  </div>
                )}

                {/* Audit Action Panel (If Pending) */}
                {isPending && (
                  <div className="p-5 bg-linear-to-r from-amber-50/80 to-orange-50/50 border border-amber-200/90 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-700" />
                        <span className="font-bold text-amber-950 text-xs">
                          Accredited Audit Action Panel
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                        Action Required
                      </span>
                    </div>

                    {/* Laboratory Test Assay Form (If CERTIFICATION) */}
                    {task.type === 'CERTIFICATION' ? (
                      <form
                        action={async (formData: FormData) => {
                          await completeLabAuditAction(formData);
                        }}
                        className="space-y-3 text-xs"
                      >
                        <input type="hidden" name="taskId" value={task.id} />
                        <input type="hidden" name="requirementId" value={req?.id || ''} />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Lab Assay Value / NABL Test Score (Optional)
                            </label>
                            <input
                              type="text"
                              name="assayValue"
                              placeholder="e.g. Curcumin 5.2% | Heavy Metals < 0.01 ppm"
                              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Laboratory Audit Remarks
                            </label>
                            <input
                              type="text"
                              name="notes"
                              placeholder="e.g. Sample meets EU/GCC MRL tolerances and phytosanitary purity."
                              defaultValue="Sample inspected and verified compliant with target market safety standards."
                              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                          <button
                            type="submit"
                            name="decision"
                            value="approve"
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Endorse &amp; Issue Clearance
                          </button>

                          <button
                            type="submit"
                            name="decision"
                            value="reject"
                            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                          >
                            <FileX2 className="w-3.5 h-3.5" /> Reject Sample
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Standard Document Verification / CHA Clearance Form */
                      <div className="flex flex-wrap items-center gap-3">
                        {doc && (
                          <form
                            action={async () => {
                              await verifyDocumentAction(doc.id, 'verified');
                            }}
                          >
                            <button
                              type="submit"
                              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve &amp; Clear Blocker
                            </button>
                          </form>
                        )}

                        <form
                          action={async (formData: FormData) => {
                            const reason =
                              (formData.get('rejectionReason') as string)?.trim() ||
                              'Official chamber stamp or seal missing on uploaded certificate.';
                            if (doc) {
                              await verifyDocumentAction(doc.id, 'rejected', reason);
                            } else {
                              await updateProviderTaskAction(task.id, 'rejected', reason);
                            }
                          }}
                          className="flex items-center gap-2 flex-1 max-w-lg"
                        >
                          <input
                            type="text"
                            name="rejectionReason"
                            placeholder="Mandatory rejection reason..."
                            defaultValue="Official chamber stamp or seal missing on uploaded certificate."
                            className="flex-1 p-2 rounded-xl border border-slate-300 bg-white text-xs"
                            required
                          />
                          <button
                            type="submit"
                            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
                          >
                            <FileX2 className="w-3.5 h-3.5" /> Reject with Reason
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                )}

                {/* Audit Resolution Stamp (If Completed or Rejected) */}
                {!isPending && (
                  <div
                    className={`p-4 rounded-2xl border flex items-start gap-2.5 text-xs ${
                      isCompleted
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                        : 'bg-red-50/60 border-red-200 text-red-900'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold block text-xs">
                        {isCompleted ? 'Verification Finalized' : 'Audit Notice Issued'}
                      </span>
                      <p className="text-[11px] mt-0.5 opacity-90">
                        {task.notes || req?.reason || 'Compliance state synchronized.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
