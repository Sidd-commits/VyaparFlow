'use client';

import React, { useState } from 'react';
import AdminOverviewTab from './AdminOverviewTab';
import AdminUserManagementTab from './AdminUserManagementTab';
import AdminVerificationQueueTab from './AdminVerificationQueueTab';
import AdminRulesManagerTab from './AdminRulesManagerTab';
import AdminAuditLogsTab from './AdminAuditLogsTab';
import CreateRuleModal from './CreateRuleModal';
import {
  LayoutDashboard,
  Users,
  FileCheck2,
  Scale,
  Activity,
  ShieldCheck,
  Building2,
  RefreshCw,
} from 'lucide-react';

interface AdminOperationsDeckProps {
  currentAdminEmail?: string;
  metrics: {
    totalMsmes: number;
    totalShipments: number;
    activeBlockersCount: number;
    pendingDocsCount: number;
    totalRulesCount: number;
    totalAuditLogsCount: number;
    totalPipelineValueINR: number;
    averageReadinessScore: number;
    verifiedMsmesCount: number;
  };
  corridorDistribution: Array<{
    country: string;
    isoCode: string;
    count: number;
    sharePercent: number;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    actorName: string;
    createdAt: string;
  }>;
  usersList: any[];
  pendingDocsList: any[];
  rulesList: any[];
  auditLogsList: any[];
  countriesList: Array<{ id: string; name: string; isoCode: string }>;
  categoriesList: Array<{ id: string; name: string }>;
}

export default function AdminOperationsDeck({
  currentAdminEmail,
  metrics,
  corridorDistribution,
  recentActivity,
  usersList,
  pendingDocsList,
  rulesList,
  auditLogsList,
  countriesList,
  categoriesList,
}: AdminOperationsDeckProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'verifications' | 'rules' | 'logs'>('overview');

  interface AdminTab {
    id: 'overview' | 'users' | 'verifications' | 'rules' | 'logs';
    label: string;
    icon: any;
    badge: number | null;
    badgeVariant?: 'alert' | 'neutral';
  }

  const tabs: AdminTab[] = [
    {
      id: 'overview',
      label: 'Platform Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'users',
      label: 'Exporters & Users',
      icon: Users,
      badge: metrics.totalMsmes,
    },
    {
      id: 'verifications',
      label: 'Verification Queue',
      icon: FileCheck2,
      badge: metrics.pendingDocsCount > 0 ? metrics.pendingDocsCount : null,
      badgeVariant: metrics.pendingDocsCount > 0 ? 'alert' : 'neutral',
    },
    {
      id: 'rules',
      label: 'Regulatory Rules',
      icon: Scale,
      badge: metrics.totalRulesCount,
    },
    {
      id: 'logs',
      label: 'Audit Trail',
      icon: Activity,
      badge: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Deck Bar */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Background Subtle Gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-orange-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Platform Control &amp; Regulatory Governance Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-tight">
              Admin Operations Command Center
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl">
              Supervise exporter onboarding, manage multi-corridor statutory compliance rules, verify trade documents, and monitor live audit logs.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <CreateRuleModal countries={countriesList} categories={categoriesList} />
          </div>
        </div>

        {/* Tab Switcher Bar */}
        <div className="relative z-10 flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto text-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== null && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      tab.badgeVariant === 'alert'
                        ? 'bg-amber-400 text-slate-900 font-bold'
                        : isActive
                        ? 'bg-orange-700 text-white'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Tab Body */}
      <div>
        {activeTab === 'overview' && (
          <AdminOverviewTab
            metrics={metrics}
            corridorDistribution={corridorDistribution}
            recentActivity={recentActivity}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'users' && (
          <AdminUserManagementTab
            users={usersList}
            currentAdminEmail={currentAdminEmail}
          />
        )}

        {activeTab === 'verifications' && (
          <AdminVerificationQueueTab documents={pendingDocsList} />
        )}

        {activeTab === 'rules' && (
          <AdminRulesManagerTab
            rules={rulesList}
            countries={countriesList}
            categories={categoriesList}
          />
        )}

        {activeTab === 'logs' && <AdminAuditLogsTab auditLogs={auditLogsList} />}
      </div>
    </div>
  );
}
