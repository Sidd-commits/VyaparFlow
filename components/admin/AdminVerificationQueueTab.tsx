'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { verifyDocumentAction } from '@/app/actions';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  Search,
  Filter,
  Eye,
  Loader2,
  Building2,
  AlertOctagon,
} from 'lucide-react';

interface DocumentItem {
  id: string;
  type: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: string;
  notes?: string | null;
  storageKey: string;
  uploadedAt: string;
  business: {
    id: string;
    displayName: string;
    legalName: string;
    city: string;
    state: string;
  };
  requirement?: {
    id: string;
    title: string;
    priority: string;
  } | null;
}

interface AdminVerificationQueueTabProps {
  documents: DocumentItem[];
}

export default function AdminVerificationQueueTab({ documents }: AdminVerificationQueueTabProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'under_review' | 'verified' | 'rejected'>('under_review');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [docToReject, setDocToReject] = useState<DocumentItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionDocId, setActionDocId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const docTypes = Array.from(new Set(documents.map((d) => d.type))).filter(Boolean);

  const filteredDocs = documents.filter((doc) => {
    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || doc.type === typeFilter;
    const q = searchQuery.toLowerCase().trim();

    if (!q) return matchesStatus && matchesType;

    const matchesSearch =
      doc.originalName.toLowerCase().includes(q) ||
      doc.type.toLowerCase().includes(q) ||
      doc.business.displayName.toLowerCase().includes(q) ||
      doc.business.legalName.toLowerCase().includes(q) ||
      (doc.notes && doc.notes.toLowerCase().includes(q));

    return matchesStatus && matchesType && matchesSearch;
  });

  const handleApprove = (docId: string) => {
    setErrorMessage(null);
    setActionDocId(docId);
    startTransition(async () => {
      try {
        await verifyDocumentAction(docId, 'verified', 'Compliance evidence verified and approved by Platform Administrator.');
        router.refresh();
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to approve document.');
      } finally {
        setActionDocId(null);
      }
    });
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docToReject || !rejectReason.trim()) return;

    setErrorMessage(null);
    setActionDocId(docToReject.id);
    startTransition(async () => {
      try {
        await verifyDocumentAction(docToReject.id, 'rejected', rejectReason.trim());
        setDocToReject(null);
        setRejectReason('');
        router.refresh();
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to reject document.');
      } finally {
        setActionDocId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by file name, document type, or MSME business..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
            />
          </div>

          {/* Type Dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="ALL">All Document Types</option>
            {docTypes.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-semibold">Status:</span>
          {(['ALL', 'under_review', 'verified', 'rejected'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === status
                  ? status === 'under_review'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : status === 'verified'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : status === 'rejected'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {status === 'ALL'
                ? 'All Documents'
                : status === 'under_review'
                ? `Pending Review (${documents.filter((d) => d.status === 'under_review').length})`
                : status === 'verified'
                ? 'Approved'
                : 'Rejected'}
            </button>
          ))}
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-700 hover:text-red-900 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Documents List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Verification Queue ({filteredDocs.length} items)
          </h3>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No compliance documents found for the selected status/query.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {filteredDocs.map((doc) => {
              const isUnderReview = doc.status === 'under_review';
              const isVerified = doc.status === 'verified';
              const isRejected = doc.status === 'rejected';
              const isProcessing = actionDocId === doc.id;

              return (
                <div
                  key={doc.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  {/* Left: Document Metadata */}
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-600 shrink-0" />
                      <span className="font-bold text-slate-900 text-sm">{doc.originalName}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded uppercase font-mono">
                        {doc.type.replace(/_/g, ' ')}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          isVerified
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isUnderReview
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {isVerified ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </>
                        ) : isUnderReview ? (
                          <>
                            <Clock className="w-3 h-3" /> Under Review
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Rejected
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-800">
                        {doc.business.displayName} ({doc.business.city}, {doc.business.state})
                      </span>
                      <span>&bull;</span>
                      <span>Submitted: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      <span>&bull;</span>
                      <span>Size: {(doc.size / 1024).toFixed(0)} KB</span>
                    </div>

                    {doc.notes && (
                      <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <strong>Review Note:</strong> {doc.notes}
                      </p>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`/${doc.storageKey}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1 border border-slate-200 shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View File</span>
                    </a>

                    {isUnderReview && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApprove(doc.id)}
                          disabled={isProcessing}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          <span>Approve</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDocToReject(doc);
                            setRejectReason('');
                          }}
                          disabled={isProcessing}
                          className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject Modal with Mandatory Feedback Notes */}
      {docToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-red-600 font-bold">
                <AlertOctagon className="w-5 h-5" />
                <span>Reject Compliance Document</span>
              </div>
              <button
                type="button"
                onClick={() => setDocToReject(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 block">Target Document:</span>
              <strong className="text-slate-900 text-xs font-bold block">{docToReject.originalName}</strong>
              <span className="text-[11px] text-slate-600 block">MSME: {docToReject.business.displayName}</span>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 text-xs">
                  Rejection Reason / Deficiency Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this document was rejected (e.g. illegible seal, incorrect HS code breakdown, expired registration)..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  required
                />
                <p className="text-[11px] text-slate-400">
                  This explanation will be shown directly to the MSME exporter with a prompt to re-upload.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDocToReject(null)}
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending || !rejectReason.trim()}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  <span>Confirm Document Rejection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
