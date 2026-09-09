import {
  EstimateFile,
  EstimateSourceType,
  ESTIMATE_ACCEPTED_IMAGE_TYPES,
  ESTIMATE_ACCEPTED_MIME_TYPES,
  MAX_ESTIMATE_FILE_SIZE_BYTES,
} from "@/types/estimateFile";

export interface EstimateFileValidationError {
  file: File;
  message: string;
}

export interface BuildEstimateFilesResult {
  files: EstimateFile[];
  errors: EstimateFileValidationError[];
}

function generateId(): string {
  return `estimate-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function validateFile(file: File): string | null {
  if (!ESTIMATE_ACCEPTED_MIME_TYPES.includes(file.type)) {
    return "対応していないファイル形式です。JPEG・PNG・PDFのいずれかをご利用ください。";
  }
  if (file.size > MAX_ESTIMATE_FILE_SIZE_BYTES) {
    return "ファイルサイズが大きすぎます（10MBまで）。";
  }
  return null;
}

/**
 * ブラウザから選択・撮影された File[] を、UIで扱う EstimateFile[] に変換する。
 * 画像はプレビュー用のObject URLを発行する（PDFは発行しない）。
 */
export function buildEstimateFiles(
  rawFiles: File[],
  sourceType: EstimateSourceType
): BuildEstimateFilesResult {
  const files: EstimateFile[] = [];
  const errors: EstimateFileValidationError[] = [];

  for (const file of rawFiles) {
    const errorMessage = validateFile(file);
    if (errorMessage) {
      errors.push({ file, message: errorMessage });
      continue;
    }
    const isImage = ESTIMATE_ACCEPTED_IMAGE_TYPES.includes(file.type);
    files.push({
      id: generateId(),
      file,
      sourceType,
      previewUrl: isImage ? URL.createObjectURL(file) : undefined,
    });
  }

  return { files, errors };
}

export function revokeEstimateFile(file: EstimateFile): void {
  if (file.previewUrl) {
    URL.revokeObjectURL(file.previewUrl);
  }
}
