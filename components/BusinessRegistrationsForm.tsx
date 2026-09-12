'use client';

import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import GSTLookupButton from '@/components/GSTLookupButton';
import DocumentDropzone from '@/components/DocumentDropzone';
import { GSTDetails } from '@/lib/services/sandboxGst';

interface BusinessRegistrationsFormProps {
  businessId: string;
  defaultGstin: string;
  defaultIec: string;
  action: (formData: FormData) => Promise<void>;
}

export default function BusinessRegistrationsForm({
  businessId,
  defaultGstin,
  defaultIec,
  action,
}: BusinessRegistrationsFormProps) {
  const [gstin, setGstin] = useState(defaultGstin || '');
  const [iec, setIec] = useState(defaultIec || '');
  const [fetchedDetails, setFetchedDetails] = useState<GSTDetails | null>(null);

  const handleGSTFetched = (details: GSTDetails) => {
    setFetchedDetails(details);
  };

  return (
    <form action={action} className="space-y-6 text-xs">
      <input type="hidden" name="businessId" value={businessId} />

      {/* GSTIN Registration Block */}
      <div className="space-y-4 p-5 rounded-2xl border border-slate-200 bg-[#FAF9F6]">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-orange-600" /> GSTIN Registration
          </span>
          <span className="text-[10px] font-semibold text-orange-800 bg-orange-100 px-2.5 py-0.5 rounded-full border border-orange-200">
            Statutory Identifier
          </span>
        </div>

        <div>
          <label className="block font-bold text-slate-900 mb-1">
            Enter GSTIN Number (15 Characters) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="gstNumber"
            value={gstin}
            onChange={(e) => setGstin(e.target.value.toUpperCase())}
            placeholder="e.g. 27AAACP1234F1Z5"
            pattern="[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[A-Za-z0-9]{1}[Zz]{1}[A-Za-z0-9]{1}"
            title="GSTIN format: 2 digits + 5 letters (PAN) + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric"
            maxLength={15}
            minLength={15}
            className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono font-bold text-xs uppercase focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
            required
          />
          <p className="text-[10px] text-slate-500 mt-1 mb-2">
            Format: 2 digits + 5 letters + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric
          </p>

          {/* Real-time GST Verification Button */}
          <GSTLookupButton
            gstinValue={gstin}
            onDetailsFetched={handleGSTFetched}
          />
        </div>

        <div className="pt-2 border-t border-slate-200/80">
          <DocumentDropzone
            name="gstFile"
            label="GST Registration Certificate"
            description="Upload official Form GST REG-06 certificate issued by GSTN."
            maxSizeMb={10}
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          />
        </div>
      </div>

      {/* IEC Code Block */}
      <div className="space-y-4 p-5 rounded-2xl border border-slate-200 bg-[#FAF9F6]">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-orange-600" /> DGFT Import Export Code (IEC)
          </span>
          <span className="text-[10px] font-semibold text-orange-800 bg-orange-100 px-2.5 py-0.5 rounded-full border border-orange-200">
            Export Clearance
          </span>
        </div>

        <div>
          <label className="block font-bold text-slate-900 mb-1">
            Enter DGFT IEC Code (10 Digits) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="iecCode"
            value={iec}
            onChange={(e) => setIec(e.target.value)}
            placeholder="e.g. 0301099882"
            pattern="[0-9]{10}"
            title="IEC Code must be exactly 10 digits"
            maxLength={10}
            minLength={10}
            className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono font-bold text-xs uppercase focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
            required
          />
          <p className="text-[10px] text-slate-500 mt-0.5">Must be exactly 10 digits (e.g. 0301099882)</p>
        </div>

        <div className="pt-2 border-t border-slate-200/80">
          <DocumentDropzone
            name="iecFile"
            label="IEC Certificate Document"
            description="Upload official DGFT IEC e-certificate or copy."
            maxSizeMb={10}
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
      >
        Submit Registration Proofs & Recalculate Score →
      </button>
    </form>
  );
}
