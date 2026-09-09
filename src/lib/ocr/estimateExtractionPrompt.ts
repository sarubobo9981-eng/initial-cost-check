import { z } from "zod";

/**
 * Claudeへの見積書解析依頼まわりの定義（プロンプト・JSON Schema）を1ファイルに集約。
 * コスト対策のため、system promptは短く・明確にし、user contentは最小限にとどめる。
 */

export const ESTIMATE_SYSTEM_PROMPT = `あなたは日本の賃貸物件「初期費用見積書」を読み取る専門アシスタントです。
与えられた画像・PDF（複数ページの場合あり）から、費用項目と金額を正確に抽出してください。

厳守事項:
- 記載のない項目・金額を推測や補完で埋めてはいけません。読み取れない場合は amount と originalText を null にしてください。
- 誤読の可能性がある場合、confidence は 0.0〜1.0 の範囲で低めに設定してください（1.0=明確に印字され読み違いなし、0.5=判読やや困難、0.0=記載なし/不明）。
- 与えられた資料が賃貸初期費用の見積書だと判断できない場合は isEstimate を false にし、rejectionReason に簡潔な理由を日本語で記載してください。
- 出力は指定されたJSON Schemaに厳密に従い、それ以外のテキストを含めないでください。`;

export const ESTIMATE_USER_INSTRUCTION =
  "以下の資料は同一の初期費用見積書の1枚〜複数ページです。内容を統合し、指定のJSON Schemaに従って抽出してください。";

const costFieldSchema = z
  .object({
    amount: z.number().nullable(),
    confidence: z.number(),
    originalText: z.string().nullable(),
  })
  .nullable();

const otherCostItemSchema = z.object({
  name: z.string(),
  amount: z.number().nullable(),
  confidence: z.number(),
  originalText: z.string().nullable(),
});

export const EstimateExtractionSchema = z.object({
  isEstimate: z.boolean(),
  rejectionReason: z.string().nullable(),
  rent: costFieldSchema,
  managementFee: costFieldSchema,
  deposit: costFieldSchema,
  keyMoney: costFieldSchema,
  brokerageFee: costFieldSchema,
  guaranteeFee: costFieldSchema,
  fireInsurance: costFieldSchema,
  keyExchangeFee: costFieldSchema,
  supportFee: costFieldSchema,
  disinfectionFee: costFieldSchema,
  cleaningFee: costFieldSchema,
  otherCosts: z.array(otherCostItemSchema),
});

export type EstimateExtraction = z.infer<typeof EstimateExtractionSchema>;
