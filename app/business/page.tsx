import React from 'react';
import AppShell from '@/components/AppShell';
import BusinessRegistrationsForm from '@/components/BusinessRegistrationsForm';
import EditCompanyProfileModal from '@/components/EditCompanyProfileModal';
import { requireAuth, updateBusinessRegistrationsAction, verifyDocumentAction } from '@/app/actions';
import { prisma } from '@/lib/prisma';
import { Building2, MapPin, CheckCircle2, ShieldCheck, Upload, FileText, AlertTriangle, Clock, XCircle, Eye, Edit3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BusinessPage() {
  const { role, user } = await requireAuth();
  
  // Scoped strictly to the logged in user's owned business
  const business = user?.businesses?.[0];

  const gstDone = business?.gstStatus?.toLowerCase().includes('active') || business?.gstStatus?.toLowerCase().includes('verified');
  const iecDone = business?.iecStatus?.toLowerCase().includes('active') || business?.iecStatus?.toLowerCase().includes('verified');

  // Fetch GSTIN and IEC proof documents for this business in parallel
  const [gstProofDocs, iecProofDocs] = await Promise.all([
    business
      ? prisma.document.findMany({
          where: {
            businessId: business.id,
            type: 'GST_CERTIFICATE',
          },
          include: { requirement: true },
          orderBy: { uploadedAt: 'desc' },
        })
      : Promise.resolve([]),
    business
      ? prisma.document.findMany({
          where: {
            businessId: business.id,
            type: 'IEC_CERTIFICATE',
          },
          include: { requirement: true },
          orderBy: { uploadedAt: 'desc' },
        })
      : Promise.resolve([]),
  ]);

  const statusBadge = (status: string) => {
    if (status === 'verified')
      return (
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 w-fit">
          <CheckCircle2 className="w-3 h-3" /> Verified by Admin
        </span>
      );
    if (status === 'under_review')
      return (
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1 w-fit">
          <Clock className="w-3 h-3" /> Under Review
        </span>
      );
    if (status === 'rejected')
      return (
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 flex items-center gap-1 w-fit">
          <XCircle className="w-3 h-3" /> Rejected
        </span>
      );
    return (
      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 w-fit">
        <AlertTriangle className="w-3 h-3" /> Pending Upload
      </span>
    );
  };

  return (
    <AppShell currentRole={role} userEmail={user?.email} userName={user?.name}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Header */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              MSME Entity Registration Profile
            </span>
            <h1 className="text-3xl font-black text-slate-900 font-serif">
              Business Profile & Government Registrations
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Location: {business?.location}, {business?.city}, {business?.state}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Profile Readiness:</span>
            <span className="text-xl font-bold text-slate-900">{business?.profileCompletion || 20}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Business Details Overview */}
          <div className="lg:col-span-6 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-orange-600" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-serif">
                    {business?.legalName || 'New MSME Exporter'}
                  </h3>
                  <p className="text-xs text-slate-500">{business?.businessType}</p>
                </div>
              </div>

              {business && (
                <EditCompanyProfileModal
                  business={business}
                  buttonText="Edit Company Details"
                  triggerClassName="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs transition-colors flex items-center gap-1.5 border border-orange-200 cursor-pointer shadow-2xs"
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold">Display Brand Name</span>
                <span className="block font-bold text-slate-900 text-sm">{business?.displayName}</span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-semibold">Location / Address</span>
                <span className="block font-bold text-slate-900 text-sm flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-600" /> {business?.location}, {business?.city}, {business?.state}
                </span>
              </div>

              <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold">GSTIN Registration Status</span>
                {gstDone ? (
                  <span className="block font-bold text-emerald-600 text-sm flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" /> {business?.gstStatus}
                  </span>
                ) : (
                  <span className="block font-bold text-amber-600 text-sm flex items-center gap-1 mt-0.5">
                    <AlertTriangle className="w-4 h-4" /> Pending Upload (0 Score)
                  </span>
                )}
              </div>

              <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold">IEC Code Status</span>
                {iecDone ? (
                  <span className="block font-bold text-emerald-600 text-sm flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" /> {business?.iecStatus}
                  </span>
                ) : (
                  <span className="block font-bold text-amber-600 text-sm flex items-center gap-1 mt-0.5">
                    <AlertTriangle className="w-4 h-4" /> Pending Upload (0 Score)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Upload & Verification Form */}
          <div className="lg:col-span-6 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
              <Upload className="w-6 h-6 text-orange-600" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">Upload Registration Proofs</h3>
                <p className="text-xs text-slate-500">Provide GSTIN and IEC numbers & certificate files to increase score</p>
              </div>
            </div>

            <BusinessRegistrationsForm
              businessId={business?.id || ''}
              defaultGstin={business?.gstStatus?.includes('(') ? business.gstStatus.split('(')[1].replace(')', '') : ''}
              defaultIec={business?.iecStatus?.includes('(') ? business.iecStatus.split('(')[1].replace(')', '') : ''}
              action={updateBusinessRegistrationsAction}
            />
          </div>
        </div>

        {/* GSTIN & IEC Proof Verification Status (visible to all, admin can act) */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <ShieldCheck className="w-6 h-6 text-orange-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-serif">
                GSTIN & IEC Proof Verification
              </h3>
              <p className="text-xs text-slate-500">
                {role === 'ADMIN'
                  ? 'Review and accept or reject GSTIN/IEC proof documents submitted by MSME exporters.'
                  : 'Your proof documents are submitted for admin verification. Status updates will appear here.'}
              </p>
            </div>
          </div>

          {/* GSTIN Proof Section */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-600" /> GSTIN Certificate Proofs
            </h4>

            {gstProofDocs.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                No GSTIN proof documents uploaded yet. Use the form above to submit your GSTIN certificate.
              </div>
            ) : (
              <div className="space-y-3">
                {gstProofDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                      doc.status === 'verified'
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : doc.status === 'rejected'
                        ? 'bg-red-50/60 border-red-200'
                        : 'bg-blue-50/60 border-blue-200'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{doc.originalName}</span>
                        {statusBadge(doc.status)}
                      </div>
                      <p className="text-[11px] text-slate-600">{doc.notes}</p>
                      <p className="text-[10px] text-slate-400">
                        Uploaded: {doc.uploadedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* View / Open Document button */}
                      <a
                        href={`/api/documents/${doc.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 border border-slate-300"
                        title="Open and preview official uploaded document"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" /> View Document
                      </a>

                      {/* Admin Accept/Reject Buttons */}
                      {role === 'ADMIN' && doc.status === 'under_review' && (
                        <>
                          <form
                            action={async () => {
                              'use server';
                              await verifyDocumentAction(doc.id, 'verified', 'GSTIN proof verified by Platform Admin.');
                            }}
                          >
                            <button
                              type="submit"
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                            </button>
                          </form>
                          <form
                            action={async () => {
                              'use server';
                              await verifyDocumentAction(doc.id, 'rejected', 'GSTIN proof rejected. Please re-upload valid certificate.');
                            }}
                          >
                            <button
                              type="submit"
                              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* IEC Proof Section */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-600" /> IEC Certificate Proofs
            </h4>

            {iecProofDocs.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                No IEC proof documents uploaded yet. Use the form above to submit your IEC certificate.
              </div>
            ) : (
              <div className="space-y-3">
                {iecProofDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                      doc.status === 'verified'
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : doc.status === 'rejected'
                        ? 'bg-red-50/60 border-red-200'
                        : 'bg-blue-50/60 border-blue-200'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{doc.originalName}</span>
                        {statusBadge(doc.status)}
                      </div>
                      <p className="text-[11px] text-slate-600">{doc.notes}</p>
                      <p className="text-[10px] text-slate-400">
                        Uploaded: {doc.uploadedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* View / Open Document button */}
                      <a
                        href={`/api/documents/${doc.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 border border-slate-300"
                        title="Open and preview official uploaded document"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" /> View Document
                      </a>

                      {/* Admin Accept/Reject Buttons */}
                      {role === 'ADMIN' && doc.status === 'under_review' && (
                        <>
                          <form
                            action={async () => {
                              'use server';
                              await verifyDocumentAction(doc.id, 'verified', 'IEC proof verified by Platform Admin.');
                            }}
                          >
                            <button
                              type="submit"
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                            </button>
                          </form>
                          <form
                            action={async () => {
                              'use server';
                              await verifyDocumentAction(doc.id, 'rejected', 'IEC proof rejected. Please re-upload valid certificate.');
                            }}
                          >
                            <button
                              type="submit"
                              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
