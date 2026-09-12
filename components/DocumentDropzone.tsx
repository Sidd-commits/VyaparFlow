'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';

export interface DocumentDropzoneProps {
  name?: string;
  label?: string;
  description?: string;
  required?: boolean;
  maxSizeMb?: number;
  accept?: string;
  defaultFileName?: string;
  defaultFileSize?: number;
  status?: 'not_uploaded' | 'uploading' | 'under_review' | 'verified' | 'rejected' | string;
  rejectionReason?: string;
  onFileChange?: (file: File | null) => void;
  className?: string;
}

export default function DocumentDropzone({
  name = 'file',
  label = 'Upload Document',
  description = 'Upload official certificate or proof document.',
  required = false,
  maxSizeMb = 10,
  accept = '.pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg',
  defaultFileName,
  defaultFileSize,
  status = 'not_uploaded',
  rejectionReason,
  onFileChange,
  className = '',
}: DocumentDropzoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const validateFile = (file: File): boolean => {
    setErrorMessage(null);

    // Validate size
    if (file.size > maxSizeMb * 1024 * 1024) {
      setErrorMessage(
        `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum allowed limit of ${maxSizeMb} MB.`
      );
      return false;
    }

    // Validate format
    const isValidFormat =
      /\.(pdf|png|jpg|jpeg)$/i.test(file.name) ||
      file.type === 'application/pdf' ||
      file.type.startsWith('image/');

    if (!isValidFormat) {
      setErrorMessage('Invalid file type. Please select a valid PDF, JPG, or PNG document.');
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      if (onFileChange) onFileChange(file);
    }
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
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileChange) onFileChange(null);
  };

  const hasFile = !!selectedFile || !!defaultFileName;
  const displayName = selectedFile?.name || defaultFileName;
  const displaySize = selectedFile
    ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
    : defaultFileSize
    ? `${(defaultFileSize / 1024).toFixed(0)} KB`
    : null;

  return (
    <div className={`space-y-2 text-xs ${className}`}>
      {/* Header Label */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="block font-bold text-slate-900">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <span className="text-[10px] font-semibold text-slate-500">
            PDF, JPG or PNG &bull; Max {maxSizeMb} MB
          </span>
        </div>
      )}

      {description && <p className="text-[11px] text-slate-500 leading-normal">{description}</p>}

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        name={name}
        accept={accept}
        onChange={handleChange}
        className="hidden"
        tabIndex={-1}
      />

      {/* Upload Zone / Selected File Card */}
      {!hasFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 sm:p-6 text-center cursor-pointer transition-all duration-150 ${
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
              <span className="font-bold text-slate-800 text-xs">Click to browse</span>{' '}
              <span className="text-slate-500 text-xs">or drag and drop here</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Supported files: PDF, JPG, PNG &bull; Maximum file size: {maxSizeMb} MB
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-xs truncate max-w-[220px] sm:max-w-xs">
                  {displayName}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  {displaySize && <span>{displaySize}</span>}
                  <span>&bull;</span>
                  <span className="text-emerald-700 font-semibold">
                    {selectedFile ? 'Selected for upload' : 'Uploaded'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors cursor-pointer"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status Indicator Bar */}
          {status && status !== 'not_uploaded' && (
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px]">
              <span className="text-slate-500 font-medium">Compliance Verification Status:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                  status === 'verified'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : status === 'rejected'
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {status === 'verified' ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> Approved / Verified
                  </>
                ) : status === 'rejected' ? (
                  <>
                    <AlertCircle className="w-3 h-3" /> Rejected
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3" /> Verification Pending
                  </>
                )}
              </span>
            </div>
          )}

          {rejectionReason && status === 'rejected' && (
            <p className="text-[11px] text-red-700 bg-red-50 p-2 rounded-lg border border-red-200">
              <strong>Rejection Reason:</strong> {rejectionReason}
            </p>
          )}
        </div>
      )}

      {/* Validation Error Message */}
      {errorMessage && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
