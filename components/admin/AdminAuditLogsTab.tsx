'use client';

import React, { useState } from 'react';
import {
  Activity,
  Search,
  Filter,
  Eye,
  X,
  Clock,
  ShieldCheck,
  FileCode,
  User,
  Building2,
  FileText,
  Ship,
  Scale,
} from 'lucide-react';

interface AuditLogItem {
  id: string;
  actorId: string;
  entityType: string;
  entityId: string;
  action: string;
  oldValueJson?: string | null;
  newValueJson?: string | null;
  createdAt: string;
  actor?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

interface AdminAuditLogsTabProps {
  auditLogs: AuditLogItem[];
}

export default function AdminAuditLogsTab({ auditLogs }: AdminAuditLogsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const entityTypes = Array.from(new Set(auditLogs.map((l) => l.entityType))).filter(Boolean);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesEntity = entityFilter === 'ALL' || log.entityType === entityFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesEntity;

    const matchesSearch =
      log.action.toLowerCase().includes(q) ||
      log.entityType.toLowerCase().includes(q) ||
      log.entityId.toLowerCase().includes(q) ||
      (log.actor && (log.actor.name.toLowerCase().includes(q) || log.actor.email.toLowerCase().includes(q)));

    return matchesEntity && matchesSearch;
  });

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'Business':
        return <Building2 className="w-4 h-4 text-orange-600" />;
      case 'Document':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'Rule':
        return <Scale className="w-4 h-4 text-purple-600" />;
      case 'Shipment':
        return <Ship className="w-4 h-4 text-emerald-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action name, actor email, or entity ID..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
          />
        </div>

        {/* Entity Type Filter */}
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="ALL">All Entity Types</option>
          {entityTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Audit Log Stream */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Audit Trail Stream ({filteredLogs.length} events)
          </h3>
          <span className="text-[11px] text-slate-500">Immutable Cryptographic Audit Records</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <Activity className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No audit log records matched the search or filter query.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs font-mono">
            {filteredLogs.map((log) => {
              const actorName = log.actor?.name || 'System / Platform';
              const actorEmail = log.actor?.email || log.actorId;

              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-3 cursor-pointer group"
                >
                  <div className="space-y-1 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                        {getEntityIcon(log.entityType)}
                      </span>
                      <span className="font-bold text-slate-900 text-xs font-sans tracking-tight">
                        {log.action}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                        {log.entityType}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-sans">
                      <span>Actor: <strong className="text-slate-800">{actorName}</strong> ({actorEmail})</span>
                      <span>&bull;</span>
                      <span className="text-slate-400">ID: {log.entityId}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-slate-400 font-sans">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg bg-slate-100 group-hover:bg-orange-100 group-hover:text-orange-700 text-slate-600 font-sans font-bold text-xs transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Diff</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Audit Log Detail / JSON Diff Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-xs">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-serif">
                    Audit Log Trace Inspector
                  </h3>
                  <p className="text-xs text-slate-500">
                    Action: <strong className="text-slate-800 font-mono">{selectedLog.action}</strong> &bull; Entity: {selectedLog.entityType}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Actor</span>
                  <span className="font-bold text-slate-800 text-xs">{selectedLog.actor?.name || 'System'}</span>
                  <span className="text-[11px] text-slate-500 block">{selectedLog.actor?.email || selectedLog.actorId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Timestamp</span>
                  <span className="font-bold text-slate-800 text-xs">{new Date(selectedLog.createdAt).toLocaleString()}</span>
                  <span className="text-[11px] text-slate-400 block font-mono">ID: {selectedLog.id}</span>
                </div>
              </div>

              {/* Old Value JSON */}
              {selectedLog.oldValueJson && (
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 text-xs uppercase tracking-wider block">
                    Previous State (Old Value)
                  </span>
                  <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 text-[11px] overflow-x-auto font-mono">
                    {JSON.stringify(JSON.parse(selectedLog.oldValueJson), null, 2)}
                  </pre>
                </div>
              )}

              {/* New Value JSON */}
              {selectedLog.newValueJson && (
                <div className="space-y-1">
                  <span className="font-bold text-emerald-800 text-xs uppercase tracking-wider block">
                    Mutated State (New Value)
                  </span>
                  <pre className="p-3 rounded-xl bg-slate-900 text-emerald-300 text-[11px] overflow-x-auto font-mono">
                    {JSON.stringify(JSON.parse(selectedLog.newValueJson), null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
