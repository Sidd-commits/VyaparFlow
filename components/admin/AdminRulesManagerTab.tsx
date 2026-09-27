'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateRuleAction } from '@/app/actions';
import CreateRuleModal from './CreateRuleModal';
import {
  Scale,
  Search,
  Filter,
  Globe2,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2,
  Edit3,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface RuleItem {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: string;
  mandatory: boolean;
  weight: number;
  blocksDispatch: boolean;
  notes?: string | null;
  version: number;
  active: boolean;
  category?: { id: string; name: string } | null;
  country?: { id: string; name: string; isoCode: string } | null;
}

interface AdminRulesManagerTabProps {
  rules: RuleItem[];
  countries: Array<{ id: string; name: string; isoCode: string }>;
  categories: Array<{ id: string; name: string }>;
}

export default function AdminRulesManagerTab({
  rules,
  countries,
  categories,
}: AdminRulesManagerTabProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [countryFilter, setCountryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ id: string; text: string } | null>(null);

  const filteredRules = rules.filter((rule) => {
    const matchesType = typeFilter === 'ALL' || rule.type === typeFilter;
    const matchesCountry =
      countryFilter === 'ALL' ||
      (countryFilter === 'GLOBAL' && !rule.country) ||
      rule.country?.id === countryFilter;
    const matchesPriority = priorityFilter === 'ALL' || rule.priority === priorityFilter;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesType && matchesCountry && matchesPriority;

    const matchesQuery =
      rule.title.toLowerCase().includes(q) ||
      rule.description.toLowerCase().includes(q) ||
      (rule.notes && rule.notes.toLowerCase().includes(q)) ||
      rule.category?.name.toLowerCase().includes(q) ||
      rule.country?.name.toLowerCase().includes(q);

    return matchesType && matchesCountry && matchesPriority && matchesQuery;
  });

  const handleUpdateRule = (ruleId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const priority = (form.elements.namedItem('priority') as HTMLSelectElement).value;
    const weight = parseFloat((form.elements.namedItem('weight') as HTMLInputElement).value);
    const blocksDispatch = (form.elements.namedItem('blocksDispatch') as HTMLSelectElement).value === 'true';

    setEditingRuleId(ruleId);
    startTransition(async () => {
      try {
        await updateRuleAction(ruleId, {
          priority,
          weight: isNaN(weight) ? 10 : weight,
          blocksDispatch,
        });
        setFeedback({ id: ruleId, text: 'Rule updated & score weights re-synced!' });
        router.refresh();
        setTimeout(() => setFeedback(null), 3000);
      } catch (err: any) {
        setFeedback({ id: ruleId, text: err.message || 'Update failed' });
      } finally {
        setEditingRuleId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-serif">
              Regulatory Rules &amp; Scoring Matrix Manager
            </h3>
            <p className="text-xs text-slate-500">
              Configure deterministic weights, priority gates, and dispatch blocker criteria across international corridors.
            </p>
          </div>

          <CreateRuleModal countries={countries} categories={categories} />
        </div>

        {/* Search & Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rule title, keyword..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700 focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs"
          >
            <option value="ALL">All Rule Types</option>
            <option value="document">Export Documents</option>
            <option value="certification">Product Certifications</option>
            <option value="packaging">Packaging Standards</option>
            <option value="labelling">Labelling Compliance</option>
            <option value="shipment">Shipment Prerequisites</option>
          </select>

          {/* Country / Corridor Filter */}
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700 focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs"
          >
            <option value="ALL">All Corridor Targets</option>
            <option value="GLOBAL">Global / Common Rules</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.isoCode})
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700 focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs"
          >
            <option value="ALL">All Priorities</option>
            <option value="critical">Critical Priority</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Rules Matrix List */}
      <div className="space-y-4">
        {filteredRules.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 space-y-2">
            <Scale className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No regulatory compliance rules match your search or filter selection.</p>
          </div>
        ) : (
          filteredRules.map((rule) => {
            const isSaving = editingRuleId === rule.id;
            const hasFeedback = feedback?.id === rule.id;

            return (
              <div
                key={rule.id}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-colors"
              >
                {/* Rule Header & Meta */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{rule.title}</span>
                      <span className="text-[10px] bg-slate-900 text-white font-bold px-2 py-0.5 rounded-md uppercase font-mono">
                        {rule.type}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-orange-100 text-orange-800">
                        Weight: {rule.weight} pts
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">v{rule.version}</span>
                    </div>

                    <p className="text-xs text-slate-600 max-w-3xl">{rule.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-xs">
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      Corridor: <strong>{rule.country?.name || 'All Markets'}</strong>
                    </span>
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      Category: <strong>{rule.category?.name || 'All Sectors'}</strong>
                    </span>
                  </div>
                </div>

                {/* Form Controls for instant weight & priority updates */}
                <form
                  onSubmit={(e) => handleUpdateRule(rule.id, e)}
                  className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs bg-slate-50/70 p-3 rounded-xl"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-600">Priority:</span>
                    <select
                      name="priority"
                      defaultValue={rule.priority}
                      className="p-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-600">Weight:</span>
                    <input
                      type="number"
                      name="weight"
                      min="1"
                      max="50"
                      defaultValue={rule.weight}
                      className="w-16 p-1.5 rounded-lg border border-slate-300 bg-white font-mono font-bold text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-600">Blocks Dispatch Gate:</span>
                    <select
                      name="blocksDispatch"
                      defaultValue={rule.blocksDispatch ? 'true' : 'false'}
                      className="p-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    >
                      <option value="true">Yes (Mandatory Gate)</option>
                      <option value="false">No (Advisory Only)</option>
                    </select>
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    {hasFeedback && (
                      <span className="text-emerald-700 font-bold text-[11px] animate-in fade-in flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {feedback.text}
                      </span>
                    )}

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Edit3 className="w-3.5 h-3.5" />}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
