import { EstimateAnalysisResult } from "@/types/estimateAnalysis";
import { InitialCostForm, InitialCostItem } from "@/types/initialCost";
import { createDefaultItems } from "@/lib/defaultItems";

/**
 * 解析結果(EstimateAnalysisResult)を、手入力と同じ InitialCostForm へ変換する。
 *
 * 手入力 / 写真 / カメラ撮影 / PDF のいずれの経路でも、
 * 最終的にはこの関数を通じて同じ InitialCostForm 型に統合される。
 */
export function mapAnalysisResultToForm(result: EstimateAnalysisResult): InitialCostForm {
  const extractedItems: InitialCostItem[] = result.items.map((item) => ({
    id: item.id,
    category: item.category ?? "other",
    label: item.label,
    amount: item.amount,
    isCustom: !item.category,
    confidence: item.confidence,
    originalText: item.originalText,
  }));

  // 抽出できなかった主要カテゴリは、金額0の入力欄として補っておく（編集しやすくするため）
  const extractedCategories = new Set(extractedItems.map((item) => item.category));
  const missingPrimaryDefaults = createDefaultItems().filter(
    (defaultItem) => !extractedCategories.has(defaultItem.category)
  );

  return {
    monthlyRent: result.monthlyRent ?? 0,
    items: [...missingPrimaryDefaults, ...extractedItems],
  };
}
