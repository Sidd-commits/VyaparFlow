'use client';

import React, { useState, useRef, useTransition } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { uploadDocumentAction } from '@/app/actions';

interface RequirementOption {
  id: string;
  title: string;
  status: string;
  priority?: string;
}

interface EnterpriseDocumentUploadProps {
  businessId: string;
  requirements: RequirementOption[];
  defaultRequirementId?: string;
  defaultDocType?: string;
  onUploadSuccess?: () => void;
}

export default function EnterpriseDocumentUpload({
  businessId,
  requirements,
  defaultRequirementId,
  defaultDocType,
  onUploadSuccess,
}: EnterpriseDocumentUploadProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedRequirementId, setSelectedRequirementId] = useState<string>(
    defaultRequirementId || ''
  );
  const [docType, setDocType] = useState<string>(defaultDocType || '');
  const [notes, setNotes] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const MAX_FILE_SIZE_MB = 10;
  const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
  ];

  const handleRequirementChange = (reqId: string) => {
    setSelectedRequirementId(reqId);
    const found = requirements.find((r) => r.id === reqId);
    if (found && !docType) {
      setDocType(found.title);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate size (10 MB max)
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setErrorMessage(
        `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum allowed limit of ${MAX_FILE_SIZE_MB} MB.`
      );
      return false;
    }

    // Validate format
    const isValidType =
      ALLOWED_MIME_TYPES.includes(file.type) ||
      /\.(pdf|png|jpg|jpeg)$/i.test(file.name);

    if (!isValidType) {
      setErrorMessage(
        'Invalid file format. Please upload an official PDF document or high-resolution PNG/JPG image.'
      );
      return false;
    }

    setSelectedFile(file);
    return true;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!businessId) {
      setErrorMessage('MSME business profile identifier is missing.');
      return;
    }

    if (!selectedRequirementId && requirements.length > 0) {
      setErrorMessage('Please select the compliance requirement this document fulfills.');
      return;
    }

    if (!selectedFile) {
      setErrorMessage('Please select or drag & drop a valid compliance document file.');
      return;
    }

    startTransition(async () => {
      try {
        setUploadProgress(25);
        const formData = new FormData();
        formData.append('businessId', businessId);
        formData.append('requirementId', selectedRequirementId);
        formData.append('docType', docType || 'ExportComplianceEvidence');
        formData.append('notes', notes);
        formData.append('file', selectedFile);

        setUploadProgress(65);
        await uploadDocumentAction(formData);
        setUploadProgress(100);

        setSuccessMessage(
          'Document uploaded successfully. Status: Platform Verification Pending. Blocker remains active until authorized review is completed.'
        );
        setSelectedFile(null);
        setNotes('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (onUploadSuccess) onUploadSuccess();
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to upload compliance document.');
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center font-bold">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 font-serif">
              Upload Compliance Document
            </h4>
            <p className="text-[11px] text-slate-500">
              Submit proof for platform verification & dispatch compliance.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
          Max 10 MB
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Requirement Selection */}
        {requirements.length > 0 && (
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Applicable Requirement <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedRequirementId}
              onChange={(e) => handleRequirementChange(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50/50 text-slate-800 text-xs font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
              required
            >
              <option value="">-- Choose Requirement to Fulfill --</option>
              {requirements.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} — [{r.status.toUpperCase()}]
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Document Label */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Document Name / Classification <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            placeholder="e.g. Certificate of Origin (India-UAE CEPA) or FSSAI License"
            className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50/50 text-slate-800 text-xs font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
            required
          />
        </div>

        {/* Drag & Drop Upload Zone */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            File Attachment (PDF, JPG, PNG) <span className="text-red-500">*</span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
            onChange={handleFileChange}
            className="hidden"
            id="enterprise-file-upload-input"
          />

          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-150 ${
                dragActive
                  ? 'border-orange-500 bg-orange-50/60'
                  : 'border-slate-300 hover:border-orange-400 bg-slate-50/40 hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shadow-xs">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 text-xs">
                    Click to browse
                  </span>{' '}
                  <span className="text-slate-500 text-xs">or drag and drop here</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Supported formats: PDF, JPG, PNG &bull; Maximum file size: 10 MB
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-xs truncate max-w-[200px] sm:max-w-xs">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready for upload
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isPending && (
                <div className="space-y-1 pt-1">
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-orange-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Uploading & verifying integrity...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Explanatory Notes */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Reference / Audit Notes <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="e.g. Issued by Export Inspection Agency, reference serial EIA/DEL/2026/089"
            className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50/50 text-slate-800 text-xs font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
          />
        </div>

        {/* Status Messages */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-start gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold">{successMessage}</span>
              <p className="text-[11px] text-amber-700">
                A verification task has been assigned to the authorized review partner.
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending || !selectedFile}
          className={`w-full py-2.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs ${
            isPending || !selectedFile
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-orange-600 hover:bg-orange-700 text-white cursor-pointer active:scale-[0.99]'
          }`}
        >
          {isPending ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Submitting for Platform Verification...
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5" />
              Submit Document for Verification
            </>
          )}
        </button>
      </form>
    </div>
  );
}
