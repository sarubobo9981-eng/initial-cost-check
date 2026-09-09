"use client";

import { useRef, useState } from "react";
import { EstimateSourceType, ESTIMATE_ACCEPTED_IMAGE_TYPES, ESTIMATE_ACCEPTED_PDF_TYPE } from "@/types/estimateFile";
import { EstimateCameraInput } from "@/components/estimate/EstimateCameraInput";
import { EstimateFileInput } from "@/components/estimate/EstimateFileInput";

interface EstimateUploadOptionsProps {
  onFilesSelected: (files: File[], sourceType: EstimateSourceType) => void;
  onBack: () => void;
  hasExistingFiles: boolean;
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 17 5-5 3 3 4-4 4 4" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3.5h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3.5V8h4M9 13h6M9 16.5h6" />
    </svg>
  );
}

export function EstimateUploadOptions({
  onFilesSelected,
  onBack,
  hasExistingFiles,
}: EstimateUploadOptionsProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files ?? []);
    const images = dropped.filter((f) => ESTIMATE_ACCEPTED_IMAGE_TYPES.includes(f.type));
    const pdfs = dropped.filter((f) => f.type === ESTIMATE_ACCEPTED_PDF_TYPE);
    if (images.length > 0) onFilesSelected(images, "image");
    if (pdfs.length > 0) onFilesSelected(pdfs, "pdf");
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`space-y-3 rounded-xl p-1 transition ${isDragging ? "bg-teal-50 ring-2 ring-teal-400" : ""}`}
    >
      {hasExistingFiles && (
        <button
          type="button"
          onClick={onBack}
          className="mb-1 text-xs font-semibold text-slate-400 hover:text-slate-600"
        >
          ← 一覧に戻る
        </button>
      )}

      <button
        type="button"
        onClick={() => cameraRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-teal-700 py-4 text-base font-bold text-white hover:bg-teal-800"
      >
        <CameraIcon /> 今すぐ撮影
      </button>
      <button
        type="button"
        onClick={() => photoRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-100 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-200"
      >
        <ImageIcon /> 写真から選ぶ
      </button>
      <button
        type="button"
        onClick={() => pdfRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-100 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-200"
      >
        <DocumentIcon /> PDFを選ぶ
      </button>

      <p className="hidden pt-1 text-center text-xs text-slate-400 sm:block">
        またはここに画像・PDFをドラッグ&ドロップ
      </p>

      <EstimateCameraInput ref={cameraRef} onCapture={(files) => onFilesSelected(files, "camera")} />
      <EstimateFileInput
        ref={photoRef}
        accept={ESTIMATE_ACCEPTED_IMAGE_TYPES.join(",")}
        multiple
        onSelect={(files) => onFilesSelected(files, "image")}
      />
      <EstimateFileInput
        ref={pdfRef}
        accept={ESTIMATE_ACCEPTED_PDF_TYPE}
        multiple
        onSelect={(files) => onFilesSelected(files, "pdf")}
      />
    </div>
  );
}
