import React from 'react';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { requireAuth, getAllUsers, updateRuleAction, deleteUserAction, verifyDocumentAction } from '@/app/actions';
import { prisma } from '@/lib/prisma';
import { ShieldCheck, Sliders, FileText, AlertTriangle, Users, Ship, Trash2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';

export default async function AdminPage() {
  const { role, user } = await requireAuth();

  // Enforce strict Role-Based Access Control
  if (role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const allUsers = await getAllUsers();

  const rules = await prisma.rule.findMany({
    include: { category: true, country: true },
    orderBy: { updatedAt: 'desc' },
  });

  const usersList = await prisma.user.findMany({
    include: { businesses: true },
    orderBy: { createdAt: 'desc' },
  });

  const totalMsmes = await prisma.business.count();
  const totalShipments = await prisma.shipment.count();
  const activeBlockersCount = await prisma.requirement.count({
    where: { priority: 'critical', status: { not: 'verified' } },
  });
  const auditLogs = await prisma.auditLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  });

  const pendingDocs = await prisma.document.findMany({
    where: { status: 'under_review' },
    include: { business: true },
    orderBy: { uploadedAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 pb-16 font-sans">
      <Navbar currentRole={role} userEmail={user?.email} userName={user?.name} allUsers={allUsers} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 md:p-8 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-orange-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Platform Control & Rules Engine Console
            </div>
            <h1 className="text-3xl font-black text-white font-serif mt-1">
              Admin Operations Center
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure deterministic compliance rules, weights, priorities, user accounts, and audit log history.
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-semibold">Registered MSMEs</span>
            <span className="block text-3xl font-black text-slate-900 font-serif">{totalMsmes}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-semibold">Active Shipments</span>
            <span className="block text-3xl font-black text-orange-600 font-serif">{totalShipments}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-semibold">System Critical Blockers</span>
            <span className="block text-3xl font-black text-amber-600 font-serif">{activeBlockersCount}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-semibold">Compliance Dataset Version</span>
            <span className="block text-3xl font-black text-slate-900 font-serif">v2.0 MVP</span>
          </div>
        </div>

        {/* Pending Document Verification Section */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-serif">
                Pending Document Verifications ({pendingDocs.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review and accept or reject documents uploaded by MSME exporters.
              </p>
            </div>
          </div>

          {pendingDocs.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
              No pending documents require verification at this time.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {pendingDocs.map((doc) => (
                <div key={doc.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-600" />
                      <span className="font-bold text-slate-900 text-sm">{doc.originalName}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md uppercase">
                        {doc.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-slate-600 font-medium">Business: {doc.business.displayName}</p>
                    <p className="text-slate-500 text-[11px]">{doc.notes}</p>
                    <a href={`/${doc.storageKey}`} target="_blank" className="inline-flex items-center gap-1 text-orange-600 hover:underline mt-1 font-semibold">
                      View Uploaded Document <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <form
                      action={async () => {
                        'use server';
                        await verifyDocumentAction(doc.id, 'verified', 'Document verified by Admin.');
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
                        await verifyDocumentAction(doc.id, 'rejected', 'Document rejected. Please provide a valid proof.');
                      }}
                    >
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Account Management Section (Create / Delete Accounts) */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-serif">
                Registered User Accounts ({usersList.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect registered exporter accounts, service providers, and administrators.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {usersList.map((u) => (
              <div key={u.id} className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{u.name}</span>
                    <span className="text-[10px] bg-slate-900 text-white font-bold px-2 py-0.5 rounded-md uppercase">
                      {u.role}
                    </span>
                  </div>
                  <p className="text-slate-500">{u.email}</p>
                  {u.businesses[0] && (
                    <span className="text-slate-600 font-semibold block text-[11px]">
                      Business: {u.businesses[0].displayName} ({u.businesses[0].city}, {u.businesses[0].state})
                    </span>
                  )}
                </div>

                {/* Delete Account Button */}
                <form
                  action={async () => {
                    'use server';
                    await deleteUserAction(u.id);
                  }}
                >
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-red-50 text-red-700 font-bold text-xs border border-red-200 hover:bg-red-100 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Account
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>

        {/* Rules Configurator Section */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-serif">
                Compliance Rules & Scoring Weights Manager ({rules.length} Rules)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Rule changes instantly affect future/re-run readiness assessments.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="p-5 rounded-2xl border border-slate-200 bg-[#FAF9F6] space-y-3"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{rule.title}</span>
                      <span className="text-[10px] bg-slate-900 text-white font-bold px-2 py-0.5 rounded-md uppercase">
                        {rule.type}
                      </span>
                      <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-md">
                        Weight: {rule.weight}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{rule.description}</p>
                  </div>

                  <span className="text-xs text-slate-500">
                    Category: <strong>{rule.category?.name || 'All'}</strong> | Country:{' '}
                    <strong>{rule.country?.name || 'All'}</strong>
                  </span>
                </div>

                <form
                  action={async (formData: FormData) => {
                    'use server';
                    const priority = formData.get('priority') as string;
                    const weight = parseFloat(formData.get('weight') as string);
                    const blocksDispatch = formData.get('blocksDispatch') === 'true';
                    await updateRuleAction(rule.id, { priority, weight, blocksDispatch });
                  }}
                  className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700">Priority:</span>
                    <select
                      name="priority"
                      defaultValue={rule.priority}
                      className="p-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700">Weight:</span>
                    <input
                      type="number"
                      name="weight"
                      defaultValue={rule.weight}
                      className="w-20 p-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700">Blocks Dispatch:</span>
                    <select
                      name="blocksDispatch"
                      defaultValue={rule.blocksDispatch ? 'true' : 'false'}
                      className="p-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                    >
                      <option value="true">Yes (Mandatory Gate)</option>
                      <option value="false">No (Advisory Only)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer ml-auto"
                  >
                    Save Rule Changes (v{rule.version + 1}) →
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log Viewer */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xl font-bold text-slate-900 font-serif">Recent Audit Logs</h3>
          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className="text-slate-500 ml-2">Entity: {log.entityType} ({log.entityId})</span>
                </div>
                <span className="text-slate-400">{log.createdAt.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
