/**
 * 見積書取り込み（カメラ撮影・写真選択・PDF選択）まわりの型定義
 */

export type EstimateSourceType = "camera" | "image" | "pdf";

export interface EstimateFile {
  id: string;
  file: File;
  sourceType: EstimateSourceType;
  /** 画像プレビュー用のObject URL（PDFの場合は未設定） */
  previewUrl?: string;
}

// 最低限対応する形式（JPEG/JPG/PNG/PDF）。
// HEIC/HEIFはブラウザでのプレビュー表示・デコードが端末依存のため現時点では未対応。
// 将来対応する際は、ここに "image/heic" / "image/heif" を追加し、
// normalizeEstimateFiles() 側でJPEG等への変換処理を挟む想定。
export const ESTIMATE_ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];
export const ESTIMATE_ACCEPTED_PDF_TYPE = "application/pdf";
export const ESTIMATE_ACCEPTED_MIME_TYPES = [...ESTIMATE_ACCEPTED_IMAGE_TYPES, ESTIMATE_ACCEPTED_PDF_TYPE];

// 将来対応予定の形式（未有効化・参照用）
export const ESTIMATE_FUTURE_IMAGE_TYPES = ["image/heic", "image/heif"];

/**
 * アップロード上限値（本番公開前の安全対策）。
 * すべてここに集約し、クライアント側の事前チェック・サーバー側の検証の両方から参照する。
 */
export const MAX_ESTIMATE_FILES = 10; // 画像枚数上限
export const MAX_ESTIMATE_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 1ファイルあたり10MB
export const MAX_TOTAL_UPLOAD_BYTES = 30 * 1024 * 1024; // 合計アップロード容量30MB
export const MAX_PDF_PAGES = 20; // PDF1ファイルあたりの最大ページ数
