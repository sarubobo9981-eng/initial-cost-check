import { CostCategory } from "@/types/initialCost";

/** AI/OCRが抽出した費用項目（確定前・レビュー対象）。amountは読み取れなかった場合0（推測では埋めない） */
export interface ExtractedCostItem {
  id: string;
  label: string;
  amount: number;
  category?: CostCategory;
  /** 抽出の確信度（0〜1） */
  confidence?: number;
  /** 見積書に記載されていた原文（確認用） */
  originalText?: string;
}

export interface EstimateAnalysisResult {
  items: ExtractedCostItem[];
  monthlyRent?: number;
  rawText?: string;
}

/** この値未満のconfidenceは「要確認」としてUI上で強調する */
export const LOW_CONFIDENCE_THRESHOLD = 0.6;

export type AnalysisStepId = "checking_files" | "reading_text" | "organizing_items";
export type AnalysisStepStatus = "pending" | "in_progress" | "done" | "error";

export interface AnalysisStepState {
  id: AnalysisStepId;
  label: string;
  status: AnalysisStepStatus;
}
