'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createRuleAction } from '@/app/actions';
import { Plus, X, ShieldAlert, Scale, Globe2, Layers, Loader2, CheckCircle2 } from 'lucide-react';

interface CreateRuleModalProps {
  countries: Array<{ id: string; name: string; isoCode: string }>;
  categories: Array<{ id: string; name: string }>;
  triggerClassName?: string;
  buttonText?: string;
}

export default function CreateRuleModal({
  countries,
  categories,
  triggerClassName,
  buttonText = '+ Add Compliance Rule',
}: CreateRuleModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'document',
    priority: 'high',
    weight: '15',
    countryId: '',
    categoryId: '',
    blocksDispatch: true,
    mandatory: true,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('type', formData.type);
    data.append('priority', formData.priority);
    data.append('weight', formData.weight);
    data.append('countryId', formData.countryId);
    data.append('categoryId', formData.categoryId);
    data.append('blocksDispatch', formData.blocksDispatch ? 'true' : 'false');
    data.append('mandatory', formData.mandatory ? 'true' : 'false');
    data.append('notes', formData.notes);

    startTransition(async () => {
      try {
        const res = await createRuleAction(data);
        if (res.success) {
          setStatusMessage({ type: 'success', text: 'Regulatory compliance rule created successfully!' });
          router.refresh();
          setTimeout(() => {
            setIsOpen(false);
            setStatusMessage(null);
            setFormData({
              title: '',
              description: '',
              type: 'document',
              priority: 'high',
              weight: '15',
              countryId: '',
              categoryId: '',
              blocksDispatch: true,
              mandatory: true,
              notes: '',
            });
          }, 1000);
        } else {
          setStatusMessage({ type: 'error', text: res.error || 'Failed to create rule.' });
        }
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: err.message || 'An unexpected error occurred.' });
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          triggerClassName ||
          'px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer'
        }
      >
        <Plus className="w-4 h-4" />
        <span>{buttonText}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-xs">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-serif">
                    Define New Regulatory Compliance Rule
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add statutory export requirements, lab certifications, or packaging gates for corridors.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status message */}
            {statusMessage && (
              <div
                className={`mx-6 mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-red-50 text-red-900 border border-red-200'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  Rule Title / Requirement Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. EU REX Certificate of Origin / NABL Heavy Metal Assay"
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  Rule Description &amp; Regulatory Context <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain why this compliance rule is mandatory for the export corridor..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Pillar Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="document">Export Document</option>
                    <option value="certification">Product Certification</option>
                    <option value="packaging">Packaging Standard</option>
                    <option value="labelling">Labelling Compliance</option>
                    <option value="shipment">Shipment Prerequisite</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="critical">Critical Priority</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Score Weight (pts)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Target Country / Corridor</label>
                  <select
                    value={formData.countryId}
                    onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="">Global / All Corridors</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.isoCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Commodity Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="">All Industry Sectors</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.blocksDispatch}
                    onChange={(e) => setFormData({ ...formData, blocksDispatch: e.target.checked })}
                    className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                  />
                  <span>Blocks Dispatch (Mandatory Gate)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.mandatory}
                    onChange={(e) => setFormData({ ...formData, mandatory: e.target.checked })}
                    className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                  />
                  <span>Mandatory Prerequisite</span>
                </label>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Regulatory Citation / Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. DGFT Public Notice No. 42/2023 / EU Regulation 2021/821"
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Rule...</span>
                    </>
                  ) : (
                    <span>Save &amp; Activate Rule</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
