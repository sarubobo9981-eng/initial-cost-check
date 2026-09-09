"use client";

import { useEffect, useState } from "react";
import { EstimateFile, EstimateSourceType, MAX_ESTIMATE_FILES } from "@/types/estimateFile";
import { AnalysisStepState } from "@/types/estimateAnalysis";
import { EstimateAnalysisResult } from "@/types/estimateAnalysis";
import { InitialCostForm } from "@/types/initialCost";
import { buildEstimateFiles, revokeEstimateFile } from "@/lib/estimate/estimateFileFactory";
import {
  analyzeEstimateFiles,
  EstimateAnalysisNotConfiguredError,
  EstimateAnalysisRejectedError,
  EstimateAnalysisRateLimitedError,
  EstimateAnalysisError,
} from "@/lib/estimate/estimateAnalysisClient";
import { EstimateUploadOptions } from "@/components/estimate/EstimateUploadOptions";
import { EstimateFileList } from "@/components/estimate/EstimateFileList";
import { EstimateImagePreview } from "@/components/estimate/EstimateImagePreview";
import { EstimateAnalysisStatus } from "@/components/estimate/EstimateAnalysisStatus";
import { ExtractedCostEditor } from "@/components/estimate/ExtractedCostEditor";

type Phase = "options" | "confirm" | "files" | "analyzing" | "review";

const INITIAL_STEPS: AnalysisStepState[] = [
  { id: "checking_files", label: "ファイルを確認中", status: "pending" },
  { id: "reading_text", label: "文字を読み取り中", status: "pending" },
  { id: "organizing_items", label: "費用項目を整理中", status: "pending" },
];

interface EstimateInputProps {
  onComplete: (form: InitialCostForm) => void;
  onManualFallback: () => void;
}

export function EstimateInput({ onComplete, onManualFallback }: EstimateInputProps) {
  const [phase, setPhase] = useState<Phase>("options");
  const [files, setFiles] = useState<EstimateFile[]>([]);
  const [pendingFiles, setPendingFiles] = useState<EstimateFile[]>([]);
  const [optionsError, setOptionsError] = useState("");
  const [steps, setSteps] = useState<AnalysisStepState[]>(INITIAL_STEPS);
  const [analysisResult, setAnalysisResult] = useState<EstimateAnalysisResult | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | undefined>(undefined);
  const [analysisFailed, setAnalysisFailed] = useState(false);
  const [reviewNotice, setReviewNotice] = useState<string | undefined>(undefined);

  // アンマウント時に発行済みのObject URLを解放する
  useEffect(() => {
    return () => {
      files.forEach(revokeEstimateFile);
      pendingFiles.forEach(revokeEstimateFile);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilesSelected(rawFiles: File[], sourceType: EstimateSourceType) {
    setOptionsError("");
    const remainingSlots = MAX_ESTIMATE_FILES - files.length;
    if (remainingSlots <= 0) {
      setOptionsError(`アップロードできる見積書は最大${MAX_ESTIMATE_FILES}枚までです。`);
      return;
    }
    const { files: built, errors } = buildEstimateFiles(rawFiles.slice(0, remainingSlots), sourceType);
    if (errors.length > 0) {
      setOptionsError(errors[0].message);
    }
    if (built.length === 0) return;
    setPendingFiles(built);
    setPhase("confirm");
  }

  function confirmPending() {
    setFiles((prev) => [...prev, ...pendingFiles]);
    setPendingFiles([]);
    setPhase("files");
  }

  function retakePending() {
    pendingFiles.forEach(revokeEstimateFile);
    setPendingFiles([]);
    setPhase("options");
  }

  function removeFile(id: string) {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) revokeEstimateFile(target);
      return prev.filter((f) => f.id !== id);
    });
  }

  function moveFile(id: string, direction: "left" | "right") {
    setFiles((prev) => {
      const index = prev.findIndex((f) => f.id === id);
      const targetIndex = direction === "left" ? index - 1 : index + 1;
      if (index < 0 || targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }

  async function startAnalysis() {
    setPhase("analyzing");
    setAnalysisFailed(false);
    setNoticeMessage(undefined);
    setSteps([
      { id: "checking_files", label: "ファイルを確認中", status: "in_progress" },
      { id: "reading_text", label: "文字を読み取り中", status: "pending" },
      { id: "organizing_items", label: "費用項目を整理中", status: "pending" },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 300));
    setSteps([
      { id: "checking_files", label: "ファイルを確認中", status: "done" },
      { id: "reading_text", label: "文字を読み取り中", status: "in_progress" },
      { id: "organizing_items", label: "費用項目を整理中", status: "pending" },
    ]);

    try {
      const result = await analyzeEstimateFiles(files);
      setSteps([
        { id: "checking_files", label: "ファイルを確認中", status: "done" },
        { id: "reading_text", label: "文字を読み取り中", status: "done" },
        { id: "organizing_items", label: "費用項目を整理中", status: "done" },
      ]);
      setAnalysisResult(result);
      setPhase("review");
    } catch (error) {
      const message =
        error instanceof EstimateAnalysisNotConfiguredError ||
        error instanceof EstimateAnalysisRejectedError ||
        error instanceof EstimateAnalysisRateLimitedError ||
        error instanceof EstimateAnalysisError
          ? error.message
          : "解析中にエラーが発生しました。";
      setSteps([
        { id: "checking_files", label: "ファイルを確認中", status: "done" },
        { id: "reading_text", label: "文字を読み取り中", status: "error" },
        { id: "organizing_items", label: "費用項目を整理中", status: "pending" },
      ]);
      setNoticeMessage(message);
      setAnalysisFailed(true);
    }
  }

  function continueWithoutAnalysis() {
    setAnalysisResult(null);
    setReviewNotice(noticeMessage ?? "自動読み取りができなかったため、金額をご入力ください。");
    setPhase("review");
  }

  function handleConfirmReview(form: InitialCostForm) {
    files.forEach(revokeEstimateFile);
    onComplete(form);
  }

  const hasExistingFiles = files.length > 0;

  if (phase === "options") {
    return (
      <div className="space-y-3">
        {!hasExistingFiles && (
          <p className="text-center text-sm font-semibold text-slate-800">
            どうやって見積書を送りますか？
          </p>
        )}
        <EstimateUploadOptions
          onFilesSelected={handleFilesSelected}
          onBack={() => setPhase("files")}
          hasExistingFiles={hasExistingFiles}
        />
        {optionsError && <p className="text-xs text-red-600">{optionsError}</p>}
        {!hasExistingFiles && (
          <button
            type="button"
            onClick={onManualFallback}
            className="block w-full text-center text-xs font-semibold text-slate-400 underline underline-offset-2 hover:text-teal-700"
          >
            手入力でもチェックできます
          </button>
        )}
      </div>
    );
  }

  if (phase === "confirm") {
    return (
      <div className="space-y-4">
        <p className="text-sm font-semibold text-slate-800">この写真を使いますか？</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {pendingFiles.map((file) => (
            <EstimateImagePreview key={file.id} file={file} />
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={retakePending}
            className="flex-1 rounded-full border border-slate-300 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            撮り直す・選び直す
          </button>
          <button
            type="button"
            onClick={confirmPending}
            className="flex-1 rounded-full bg-teal-700 py-3 text-sm font-bold text-white hover:bg-teal-800"
          >
            この写真を使う
          </button>
        </div>
      </div>
    );
  }

  if (phase === "files") {
    return (
      <div className="space-y-4">
        <EstimateFileList files={files} onRemove={removeFile} onMove={moveFile} onAddMore={() => setPhase("options")} />
        <button
          type="button"
          onClick={startAnalysis}
          disabled={files.length === 0}
          className="w-full rounded-full bg-teal-700 py-3.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-40"
        >
          この内容を解析する（{files.length}枚）
        </button>
      </div>
    );
  }

  if (phase === "analyzing") {
    return (
      <EstimateAnalysisStatus
        steps={steps}
        noticeMessage={noticeMessage}
        actions={
          analysisFailed ? (
            <>
              <button
                type="button"
                onClick={startAnalysis}
                className="rounded-full border border-slate-300 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                もう一度試す
              </button>
              <button
                type="button"
                onClick={continueWithoutAnalysis}
                className="rounded-full bg-teal-700 py-2.5 text-sm font-bold text-white hover:bg-teal-800"
              >
                手入力で続ける
              </button>
            </>
          ) : undefined
        }
      />
    );
  }

  return (
    <ExtractedCostEditor
      analysisResult={analysisResult}
      noticeMessage={analysisResult === null ? reviewNotice : undefined}
      onConfirm={handleConfirmReview}
      onBack={() => setPhase("files")}
    />
  );
}
