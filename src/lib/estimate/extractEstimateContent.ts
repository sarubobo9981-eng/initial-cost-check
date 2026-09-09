import { getOcrProvider } from "@/lib/ocr/ocrService";
import { OcrResult } from "@/types/initialCost";
import { NormalizedEstimateFile } from "@/lib/estimate/normalizeEstimateFiles";

/**
 * 見積書解析パイプライン 2段階目: extractEstimateContent
 *
 * 画像・PDFいずれの入力方式でも、ここでOcrProviderへ委譲する。
 * 「PDFの場合はこの処理」「画像の場合はこの処理」という分岐はUI側では行わず、
 * このサービス層（および将来のOcrProvider実装）に閉じ込める。
 *
 * 複数ページ・複数枚のファイルはページ間の関連性をAIが認識できるよう、
 * 1回のOcrProvider呼び出しにまとめて渡す（ファイルごとに分割して呼び出さない）。
 */
export async function extractEstimateContent(files: NormalizedEstimateFile[]): Promise<OcrResult> {
  const provider = getOcrProvider();
  return provider.extract(files.map((file) => ({ buffer: file.buffer, mimeType: file.mimeType })));
}
