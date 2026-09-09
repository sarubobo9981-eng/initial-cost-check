import { OcrResult } from "@/types/initialCost";
import { EstimateAnalysisResult, ExtractedCostItem } from "@/types/estimateAnalysis";

/**
 * 見積書解析パイプライン 3段階目: parseEstimateWithAI
 *
 * OcrProviderの抽出結果をアプリ内の EstimateAnalysisResult へ整形する。
 * 金額を読み取れなかった項目（amount: null）は 0 として扱う
 * （0円はUI上「未入力」として表示され、ユーザーが手動で埋められる）。
 *
 * isEstimate:false（見積書として認識できない）の判定は、
 * この関数を呼び出す前にAPI Route側でハンドリングする。
 */
function generateItemId(): string {
  return `extracted-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function parseEstimateWithAI(ocrResult: OcrResult): EstimateAnalysisResult {
  const items: ExtractedCostItem[] = ocrResult.items.map((item) => ({
    id: generateItemId(),
    label: item.label,
    amount: item.amount ?? 0,
    category: item.category,
    confidence: item.confidence,
    originalText: item.originalText,
  }));

  return {
    items,
    monthlyRent: ocrResult.monthlyRent ?? undefined,
    rawText: ocrResult.rawText,
  };
}
