import React from 'react';
import AppShell from '@/components/AppShell';
import { requireAuth, requestCertificationAction } from '@/app/actions';
import { prisma } from '@/lib/prisma';
import { Award, Clock, CheckCircle2, ShieldCheck, ArrowRight, Building } from 'lucide-react';

export default async function CertificationsPage() {
  const { role, user } = await requireAuth();
  const business = user?.businesses[0];

  const certRequirements = business?.id
    ? await prisma.requirement.findMany({
        where: {
          productCountry: { product: { businessId: business.id } },
          type: 'certification',
        },
        include: {
          rule: true,
          certificationRequests: { include: { providerTask: { include: { provider: true } } } },
        },
      })
    : [];

  const certLabs = await prisma.provider.findMany({
    where: { type: 'CERTIFICATION' },
  });

  return (
    <AppShell currentRole={role} userEmail={user?.email} userName={user?.name}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Header */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Product Compliance & Laboratory Accreditation
            </span>
            <h1 className="text-3xl font-black text-slate-900 font-serif">
              Export Product Certifications Hub
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Direct digital coordination with accredited labs (Phytosanitary, Halal, residue testing).
            </p>
          </div>
        </div>

        {/* Certifications Grid */}
        <div className="space-y-6">
          {certRequirements.map((req) => {
            const activeReq = req.certificationRequests[0];

            return (
              <div
                key={req.id}
                className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Award className="w-6 h-6 text-orange-600" />
                      <h3 className="text-xl font-bold text-slate-900 font-serif">{req.title}</h3>
                      <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-md uppercase">
                        {req.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 max-w-2xl">{req.reason || req.rule?.description}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Est. {req.rule?.processingDays || 4} Days
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${
                        req.status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : req.status === 'under_review'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      Status: {req.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Task Assignment / Laboratory Section */}
                {activeReq ? (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-500 font-semibold uppercase text-[10px]">Assigned Accredited Body</span>
                      <span className="block font-bold text-slate-900 text-sm">
                        {activeReq.providerTask?.provider.name || 'Apex Quality & Quarantine Labs'}
                      </span>
                      <span className="text-slate-500">Contact: {activeReq.providerTask?.provider.contactEmail}</span>
                    </div>

                    <span className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs">
                      Task Status: {activeReq.status.toUpperCase()}
                    </span>
                  </div>
                ) : (
                  <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="font-bold text-orange-900">No Accredited Lab Assigned Yet</span>
                      <p className="text-slate-600">Select an authorized partner to initiate sample testing & certification.</p>
                    </div>

                    <form
                      action={async (formData: FormData) => {
                        'use server';
                        const providerId = formData.get('providerId') as string;
                        await requestCertificationAction(req.id, providerId);
                      }}
                      className="flex items-center gap-2"
                    >
                      <select
                        name="providerId"
                        className="p-2 rounded-xl border border-slate-300 bg-white font-medium text-xs"
                        required
                      >
                        {certLabs.map((lab) => (
                          <option key={lab.id} value={lab.id}>
                            {lab.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        Request Partner Lab →
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
