/**
 * 初期費用診断まわりの型定義
 * 計算処理(src/lib)とUI(src/components)の両方から参照する共通の型。
 */

export type CostCategory =
  | "brokerage_fee" // 仲介手数料
  | "deposit" // 敷金
  | "key_money" // 礼金
  | "advance_rent" // 前家賃・日割り家賃
  | "management_fee" // 管理費・共益費
  | "guarantee_company" // 保証会社利用料
  | "fire_insurance" // 火災保険料
  | "key_exchange" // 鍵交換費用
  | "disinfection" // 消毒施工費
  | "cleaning_fee" // 清掃費
  | "support_service" // 24時間サポート等の任意サービス
  | "other"; // その他

export interface CostCategoryMeta {
  id: CostCategory;
  label: string;
  /** 主要項目として最初から表示するか（false の場合は「その他の費用を追加」から選択） */
  isPrimary: boolean;
  /** 入力欄の補足説明 */
  helpText?: string;
}

export interface InitialCostItem {
  id: string;
  category: CostCategory;
  label: string;
  amount: number;
  /** ユーザーが自由入力で追加した項目か */
  isCustom?: boolean;
  /** AI解析による抽出の確信度（0〜1）。手入力の場合はundefined */
  confidence?: number;
  /** AI解析元の見積書に記載されていた原文（確認用の参考表示） */
  originalText?: string;
}

export interface InitialCostForm {
  /** 月額家賃（仲介手数料の上限判定などに使用） */
  monthlyRent: number;
  items: InitialCostItem[];
}

/** 見直せる可能性の性質。reviewable=金額に見直しの余地がある可能性、info=金額は断定しないが確認を推奨 */
export type FindingConfidence = "reviewable" | "info";

export interface ReviewFinding {
  itemId: string;
  itemLabel: string;
  category: CostCategory;
  currentAmount: number;
  /** 見直せる可能性のある金額（削減を確約するものではない） */
  reviewableAmount: number;
  reason: string;
  confidence: FindingConfidence;
}

export interface DiagnosisResult {
  totalCurrent: number;
  totalReviewable: number;
  /** 見直しの余地を反映した概算金額（保証値ではない） */
  estimatedWithUs: number;
  /** 現在の合計と概算金額の差額 */
  difference: number;
  findings: ReviewFinding[];
  categoryTotals: Partial<Record<CostCategory, number>>;
}

/** OCR/AI解析サービス層が返す抽出結果の型 */
export interface OcrExtractedItem {
  label: string;
  /** 金額を読み取れなかった場合はnull（推測で埋めない） */
  amount: number | null;
  category?: CostCategory;
  /** 抽出の確信度（0〜1） */
  confidence?: number;
  /** 見積書に記載されていた原文 */
  originalText?: string;
}

export interface OcrResult {
  items: OcrExtractedItem[];
  /** 見積書に記載された月額家賃（読み取れた場合） */
  monthlyRent?: number | null;
  rawText?: string;
  /** 解析対象が賃貸初期費用の見積書として認識できたか（プロバイダによってはundefined） */
  isEstimate?: boolean;
  /** isEstimateがfalseの場合の理由 */
  rejectionReason?: string;
}
