import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { requireAuth, updateProviderTaskAction } from '@/app/actions';
import { prisma } from '@/lib/prisma';
import { Truck, CheckCircle2, FileText, AlertTriangle, Clock, ShieldCheck } from 'lucide-react';

export default async function ProviderPage() {
  const { role, user } = await requireAuth();

  // Enforce strict Role-Based Access Control
  if (role !== 'PROVIDER') {
    redirect('/dashboard');
  }

  // Get all active provider tasks across system
  const providerTasks = await prisma.providerTask.findMany({
    include: {
      provider: true,
      shipment: { include: { business: true, product: true, destinationCountry: true } },
      requirement: true,
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
              Third-Party Service Provider Portal
            </span>
            <h1 className="text-3xl font-black text-slate-900 font-serif">
              Assigned Task Queue & Fulfillment Center
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Fulfill certification, freight forwarding, CHA customs declarations, and cargo insurance requests.
            </p>
          </div>
          <span className="text-xs bg-slate-900 text-white font-bold px-4 py-2 rounded-xl">
            {providerTasks.length} Active Tasks Assigned
          </span>
        </div>

        {/* Task Cards List */}
        <div className="space-y-4">
          {providerTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-orange-600" />
                    <span className="font-bold text-slate-900 text-lg font-serif">
                      Task #{task.id.substring(0, 8)} — {task.type}
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-0.5 rounded-full capitalize ${
                        task.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : task.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Assigned Provider: <span className="font-bold text-slate-900">{task.provider.name}</span> ({task.provider.type})
                  </p>
                </div>

                <span className="text-xs text-slate-400">Assigned: {task.assignedAt.toLocaleDateString()}</span>
              </div>

              {/* Shipment Details */}
              {task.shipment && (
                <div className="bg-[#FAF9F6] p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">MSME Exporter</span>
                    <span className="block font-bold text-slate-900">{task.shipment.business.displayName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Cargo Description</span>
                    <span className="block font-bold text-slate-900">{task.shipment.product.name} ({task.shipment.quantity} MT)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Destination</span>
                    <span className="block font-bold text-slate-900">{task.shipment.destinationCity}, {task.shipment.destinationCountry.name}</span>
                  </div>
                </div>
              )}

              {task.notes && (
                <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-700">Task Notes:</span> {task.notes}
                </div>
              )}

              {/* Status Updater Form */}
              <form
                action={async (formData: FormData) => {
                  'use server';
                  const nextStatus = formData.get('status') as string;
                  const notes = formData.get('notes') as string;
                  await updateProviderTaskAction(task.id, nextStatus, notes);
                }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2"
              >
                <input
                  type="text"
                  name="notes"
                  placeholder="Enter fulfillment timestamp, lab serial, or notes..."
                  className="flex-1 p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs"
                />

                <select
                  name="status"
                  defaultValue={task.status}
                  className="p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs"
                >
                  <option value="requested">Requested</option>
                  <option value="accepted">Accepted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed ✓</option>
                  <option value="exception">Exception Alert ⚠️</option>
                </select>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Update Task Status
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
