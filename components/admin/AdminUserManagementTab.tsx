'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteUserAction } from '@/app/actions';
import {
  Users,
  Search,
  Building2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  X,
  Package,
  Globe2,
  FileText,
  Ship,
  Clock,
  Loader2,
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  businesses: Array<{
    id: string;
    legalName: string;
    displayName: string;
    businessType: string;
    location: string;
    city: string;
    state: string;
    gstStatus: string;
    iecStatus: string;
    profileCompletion: number;
    products?: Array<{
      id: string;
      name: string;
      hsCode: string;
      destinations?: Array<{
        country?: { name: string; isoCode: string } | null;
      }>;
    }>;
    documents?: Array<{
      id: string;
      type: string;
      status: string;
      originalName: string;
    }>;
    shipments?: Array<{
      id: string;
      shipmentNumber: string;
      status: string;
      value: number;
    }>;
  }>;
}

interface AdminUserManagementTabProps {
  users: UserData[];
  currentAdminEmail?: string;
}

export default function AdminUserManagementTab({
  users,
  currentAdminEmail,
}: AdminUserManagementTabProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'MSME' | 'PROVIDER' | 'ADMIN'>('ALL');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesRole;

    const biz = u.businesses?.[0];
    const matchesQuery =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      biz?.displayName?.toLowerCase().includes(q) ||
      biz?.legalName?.toLowerCase().includes(q) ||
      biz?.city?.toLowerCase().includes(q) ||
      biz?.state?.toLowerCase().includes(q);

    return matchesRole && matchesQuery;
  });

  const handleDelete = (userId: string) => {
    setActionError(null);
    startDeleteTransition(async () => {
      try {
        await deleteUserAction(userId);
        setUserToDelete(null);
        if (selectedUser?.id === userId) setSelectedUser(null);
        router.refresh();
      } catch (err: any) {
        setActionError(err.message || 'Failed to delete user.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by exporter name, email, trade brand, or city..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
          />
        </div>

        {/* Role Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {(['ALL', 'MSME', 'PROVIDER', 'ADMIN'] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 ${
                roleFilter === role
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {role === 'ALL' ? 'All Roles' : role === 'MSME' ? 'MSME Exporters' : role === 'PROVIDER' ? 'Providers' : 'Admins'}
            </button>
          ))}
        </div>
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-700 hover:text-red-900 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Exporter & User Accounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Registered Directory ({filteredUsers.length} accounts found)
          </h3>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No user accounts matched the selected query or filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {filteredUsers.map((u) => {
              const biz = u.businesses?.[0];
              const isCurrentUser = u.email === currentAdminEmail;

              return (
                <div
                  key={u.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
                >
                  {/* Left: User & Entity Identity */}
                  <div className="space-y-1 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{u.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'PROVIDER'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {u.role}
                      </span>
                      {biz && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200">
                          Profile: {biz.profileCompletion}%
                        </span>
                      )}
                    </div>

                    <p className="text-slate-500 text-xs">{u.email}</p>

                    {biz && (
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 pt-0.5">
                        <span className="font-semibold text-slate-800">{biz.displayName}</span>
                        <span>&bull;</span>
                        <span>{biz.location || `${biz.city}, ${biz.state}`}</span>
                        <span>&bull;</span>
                        <span className="text-emerald-700 font-medium">GST: {biz.gstStatus}</span>
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {biz && (
                      <button
                        type="button"
                        onClick={() => setSelectedUser(u)}
                        className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer border border-orange-200 shadow-2xs"
                      >
                        <span>Inspect Exporter</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {!isCurrentUser && (
                      <button
                        type="button"
                        onClick={() => setUserToDelete(u)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Exporter Detail Sliding Drawer */}
      {selectedUser && selectedUser.businesses?.[0] && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setSelectedUser(null)}
          />

          {/* Drawer Container */}
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 block">
                  MSME Exporter Audit Profile
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedUser.businesses[0].displayName}
                </h2>
                <p className="text-xs text-slate-500">
                  Owner: {selectedUser.name} ({selectedUser.email})
                </p>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              {/* Profile Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Legal Entity:</span>
                  <strong className="text-slate-900 font-bold">{selectedUser.businesses[0].legalName}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Industry Sector:</span>
                  <span className="text-slate-900">{selectedUser.businesses[0].businessType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Location:</span>
                  <span className="text-slate-900">
                    {selectedUser.businesses[0].location || `${selectedUser.businesses[0].city}, ${selectedUser.businesses[0].state}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Profile Completeness:</span>
                  <span className="font-mono font-bold text-orange-600">{selectedUser.businesses[0].profileCompletion}%</span>
                </div>
              </div>

              {/* Tax & Statutory Registrations */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Statutory Registrations
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold block">GSTIN Status</span>
                    <strong className="text-slate-800 text-xs font-mono mt-0.5 block">
                      {selectedUser.businesses[0].gstStatus}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold block">DGFT IEC Code</span>
                    <strong className="text-slate-800 text-xs font-mono mt-0.5 block">
                      {selectedUser.businesses[0].iecStatus}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Products & Destinations */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Configured Export Catalog
                </h4>
                {selectedUser.businesses[0].products && selectedUser.businesses[0].products.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUser.businesses[0].products.map((prod) => (
                      <div key={prod.id} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-orange-600" />
                          <div>
                            <span className="font-bold text-slate-900 block">{prod.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">HS Code: {prod.hsCode}</span>
                          </div>
                        </div>

                        {prod.destinations && prod.destinations.length > 0 && (
                          <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                            → {prod.destinations[0].country?.name || 'Corridor'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs">No active products configured.</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Audit Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-base">
                Delete Account: {userToDelete.name}?
              </h3>
              <p className="text-xs text-slate-500">
                This action will permanently delete user <strong className="text-slate-800">{userToDelete.email}</strong> and cascade delete all associated business records and documents.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleDelete(userToDelete.id)}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
