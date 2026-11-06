'use client';

import React, { useState } from 'react';
import { Search, Loader2, CheckCircle2, AlertCircle, Building2, MapPin, ShieldCheck, Check } from 'lucide-react';
import { GSTDetails } from '@/lib/services/sandboxGst';

interface GSTLookupButtonProps {
  gstinValue: string;
  onDetailsFetched?: (details: GSTDetails) => void;
  className?: string;
}

export default function GSTLookupButton({
  gstinValue,
  onDetailsFetched,
  className = '',
}: GSTLookupButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<GSTDetails | null>(null);

  const handleFetch = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError(null);

    const clean = (gstinValue || '').trim().toUpperCase();
    if (!clean || clean.length !== 15) {
      setError('Enter a full 15-character GSTIN first (e.g. 27AAACP1234F1Z5).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/gst/verify?gstin=${encodeURIComponent(clean)}`);
      const json = await res.json();

      if (!json.success || !json.data) {
        setError(json.error || 'Failed to fetch GST details.');
        setDetails(null);
      } else {
        setDetails(json.data);
        if (onDetailsFetched) {
          onDetailsFetched(json.data);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Network error fetching GST details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <button
        type="button"
        onClick={handleFetch}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
        title="Lookup official legal name & taxpayer details from Sandbox.co.in GST API"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Verifying GSTIN...</span>
          </>
        ) : (
          <>
            <Search className="w-3.5 h-3.5" />
            <span>Verify &amp; Fetch GST Details</span>
          </>
        )}
      </button>

      {/* Error display */}
      {error && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Result Card */}
      {details && (
        <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-300 text-emerald-950 space-y-2 text-xs animate-in fade-in duration-200 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-bold flex items-center gap-1.5 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Verified Indian Taxpayer
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-200 text-emerald-900">
                Status: {details.status}
              </span>
              {details.isChecksumValid && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3 text-blue-600" /> Mod-36 Valid
                </span>
              )}
            </div>
          </div>

          <div className="pt-1 space-y-1">
            <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
              Statutory Registered Legal Entity
            </div>
            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-orange-600 shrink-0" />
              {details.legalName}
            </div>
            {details.tradeName && details.tradeName !== details.legalName && (
              <div className="text-xs text-slate-700 font-medium">
                Trade Name: <span className="font-bold text-slate-900">{details.tradeName}</span>
              </div>
            )}
            {details.panNumber && (
              <div className="text-[11px] text-slate-600 font-mono">
                Permanent Account Number (PAN): <strong className="text-slate-800">{details.panNumber}</strong>
              </div>
            )}
          </div>

          {details.address && (
            <div className="text-xs text-slate-700 flex items-start gap-1.5 pt-1 border-t border-emerald-200/80">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span>
                {[details.address.buildingName, details.address.street, details.address.city, details.address.state, details.address.pincode]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </div>
          )}

          <div className="text-[10px] text-slate-500 pt-1.5 flex items-center justify-between border-t border-emerald-200/60">
            <span>Constitution: <strong>{details.constitutionOfBusiness || 'Registered Entity'}</strong></span>
            <span className="font-medium text-emerald-800">{details.source}</span>
          </div>
        </div>
      )}
    </div>
  );
}
