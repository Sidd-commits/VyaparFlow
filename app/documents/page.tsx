import React from 'react';
import Navbar from '@/components/Navbar';
import { requireAuth, getAllUsers, uploadDocumentAction, verifyDocumentAction } from '@/app/actions';
import { prisma } from '@/lib/prisma';
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
} from 'lucide-react';

export default async function DocumentsPage() {
  const { role, user } = await requireAuth();
  const allUsers = await getAllUsers();
  const business = user?.businesses?.[0];

  const documents = await prisma.document.findMany({
    where: role === 'MSME' && business?.id ? { businessId: business.id } : {},
    include: {
      requirement: true,
      shipment: true,
    },
    orderBy: { uploadedAt: 'desc' },
  });

  const requirementsNeedingDoc = await prisma.requirement.findMany({
    where: {
      productCountry: { product: { businessId: business?.id } },
      type: 'document',
    },
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 pb-16 font-sans">
      <Navbar currentRole={role} userEmail={user?.email} userName={user?.name} allUsers={allUsers} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Central Export Document Repository
            </span>
            <h1 className="text-3xl font-black text-slate-900 font-serif">
              Document Management & Verification
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Secure private file storage, server-side expiry auditing, and admin verification workflow.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Upload New Document Card (For MSME) */}
          {role === 'MSME' && (
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  <Upload className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">Upload Compliance Proof</h3>
              </div>

              <form action={uploadDocumentAction} className="space-y-4 text-xs">
                <input type="hidden" name="businessId" value={business?.id || ''} />

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Requirement / Document Type
                  </label>
                  <select
                    name="requirementId"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">-- Choose Requirement --</option>
                    {requirementsNeedingDoc.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title} ({r.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Document Label / Type</label>
                  <input
                    type="text"
                    name="docType"
                    placeholder="e.g. Certificate of Origin / Phytosanitary"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Choose File (PDF/PNG/JPG)</label>
                  <input
                    type="file"
                    name="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="w-full p-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-600 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Explanatory Notes</label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Provide issue reference, chamber serial, or notes..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
                >
                  Upload & Submit for Verification
                </button>
              </form>
            </div>
          )}

          {/* Right Column: Document List Table */}
          <div className={`${role === 'MSME' ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6`}>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 font-serif">
                Uploaded Export Evidence ({documents.length})
              </h3>
              {role === 'ADMIN' && (
                <span className="text-xs bg-slate-900 text-orange-400 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin Verification Mode Active
                </span>
              )}
            </div>

            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-[#FAF9F6] flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-600" />
                      <span className="font-bold text-slate-900 text-sm">{doc.originalName}</span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                          doc.status === 'verified'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : doc.status === 'rejected'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {doc.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">{doc.notes || 'No description notes.'}</p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span>Uploaded: {doc.uploadedAt.toLocaleDateString()}</span>
                      <span>Size: {Math.round(doc.size / 1024)} KB</span>
                      <span>Version: v{doc.version}</span>
                    </div>
                  </div>

                  {/* Actions for Admin vs MSME */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* View / Open Document */}
                    <a
                      href={`/api/documents/${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 shadow-xs border border-slate-300 transition-colors"
                      title="Open and preview uploaded document"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" /> View Document
                    </a>

                    {role === 'ADMIN' && doc.status === 'under_review' && (
                      <div className="flex items-center gap-2">
                        <form
                          action={async () => {
                            'use server';
                            await verifyDocumentAction(doc.id, 'verified');
                          }}
                        >
                          <button
                            type="submit"
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Verify
                          </button>
                        </form>

                        <form
                          action={async () => {
                            'use server';
                            await verifyDocumentAction(doc.id, 'rejected', 'Document scan unreadable.');
                          }}
                        >
                          <button
                            type="submit"
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <FileX2 className="w-3.5 h-3.5" /> Reject
                          </button>
                        </form>
                      </div>
                    )}

                    <span className="text-xs text-slate-500 font-medium px-3 py-1.5 bg-white rounded-lg border border-slate-200">
                      Private Key: {doc.storageKey.substring(0, 15)}...
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
