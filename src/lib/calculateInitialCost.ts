import {
  CostCategory,
  DiagnosisResult,
  FindingConfidence,
  InitialCostForm,
  InitialCostItem,
  ReviewFinding,
} from "@/types/initialCost";

/**
 * 初期費用の診断ロジック（重要）
 *
 * 方針:
 * 1. 実際の契約条件・物件条件を確認できない状態で、断定的に「削減できます」とは表示しない。
 * 2. 各ルールは「見直せる可能性のある金額」を算出し、必ず確認を促す理由(reason)とセットで返す。
 * 3. confidence:"reviewable" は概算合計の計算に使用する。
 *    confidence:"info" は金額を合計に含めず、確認を促す情報提示のみに使う。
 * 4. ルールを追加・修正する場合は、この1ファイル内で完結するようにする。
 *
 * ここでの結果はあくまで「見直せる可能性のある金額」の目安であり、
 * 減額を保証するものではない。UI側にも必ず免責文言を表示すること。
 */

// 宅地建物取引業法上、仲介手数料は原則として賃料の1ヶ月分＋消費税が上限の目安とされる
const BROKERAGE_FEE_RENT_MONTHS = 1;
const CONSUMPTION_TAX_RATE = 0.1;

// 任意サービスに該当する可能性が高いカテゴリ
const OPTIONAL_SERVICE_CATEGORIES: CostCategory[] = ["support_service", "disinfection"];

// 自由入力の項目名から任意サービスを推測するためのキーワード
const OPTIONAL_SERVICE_KEYWORDS = [
  "サポート",
  "消毒",
  "抗菌",
  "除菌",
  "安心",
  "少額短期保険",
  "書類作成",
  "事務手数料",
  "光触媒",
  "あんしん",
  "24時間",
];

function round(value: number): number {
  return Math.round(value);
}

type FindingRule = (item: InitialCostItem, form: InitialCostForm) => ReviewFinding | null;

/**
 * ルール1: 仲介手数料の上限チェック
 * 家賃1ヶ月分＋消費税を上限の目安とし、超過分を「見直せる可能性のある金額」とする。
 * 家賃が未入力の場合は判定不能のため対象外とする。
 */
const brokerageFeeRule: FindingRule = (item, form) => {
  if (item.category !== "brokerage_fee") return null;
  if (form.monthlyRent <= 0 || item.amount <= 0) return null;

  const cap = round(form.monthlyRent * BROKERAGE_FEE_RENT_MONTHS * (1 + CONSUMPTION_TAX_RATE));
  if (item.amount <= cap) return null;

  return {
    itemId: item.id,
    itemLabel: item.label,
    category: item.category,
    currentAmount: item.amount,
    reviewableAmount: item.amount - cap,
    reason:
      "仲介手数料は宅地建物取引業法上、原則として家賃1ヶ月分＋消費税が上限の目安とされています。上限を超える差額分は、契約条件を確認できる可能性があります。",
    confidence: "reviewable",
  };
};

/**
 * ルール2: 任意サービス・オプション費用の検出
 * 24時間サポートや消毒施工費などは、契約上任意加入であるケースが多いカテゴリ・項目名を検出し、
 * 金額全額を「見直せる可能性のある金額」として提示する（加入自体を否定するものではない）。
 */
const optionalServiceRule: FindingRule = (item) => {
  if (item.amount <= 0) return null;

  const isOptionalCategory = OPTIONAL_SERVICE_CATEGORIES.includes(item.category);
  const matchesKeyword = OPTIONAL_SERVICE_KEYWORDS.some((keyword) => item.label.includes(keyword));
  if (!isOptionalCategory && !matchesKeyword) return null;

  return {
    itemId: item.id,
    itemLabel: item.label,
    category: item.category,
    currentAmount: item.amount,
    reviewableAmount: item.amount,
    reason:
      "契約上、加入が任意となっているサービス・オプションであるケースがあります。必要性や加入の要否を確認できる可能性があります。",
    confidence: "reviewable",
  };
};

/**
 * ルール3: 火災保険料の情報提示
 * 保険会社を自分で選べる場合があるため、金額の断定はせず確認を促す情報のみを提示する。
 * (confidence:"info" のため概算合計には反映しない)
 */
const fireInsuranceInfoRule: FindingRule = (item) => {
  if (item.category !== "fire_insurance" || item.amount <= 0) return null;

  return {
    itemId: item.id,
    itemLabel: item.label,
    category: item.category,
    currentAmount: item.amount,
    reviewableAmount: 0,
    reason:
      "火災保険は不動産会社の指定ではなく、ご自身で保険会社・プランを選べる場合があります。契約内容を確認できる可能性があります。",
    confidence: "info",
  };
};

/**
 * 適用するルールの一覧。上から順に評価し、1項目につき最初にヒットしたルールのみ適用する
 * （同一項目に対して複数の見直し提案を重複表示しないため）。
 */
const FINDING_RULES: FindingRule[] = [brokerageFeeRule, optionalServiceRule, fireInsuranceInfoRule];

function buildFindings(items: InitialCostItem[], form: InitialCostForm): ReviewFinding[] {
  const findings: ReviewFinding[] = [];
  for (const item of items) {
    for (const rule of FINDING_RULES) {
      const finding = rule(item, form);
      if (finding) {
        findings.push(finding);
        break;
      }
    }
  }
  return findings;
}

function sumByConfidence(findings: ReviewFinding[], confidence: FindingConfidence): number {
  return findings
    .filter((f) => f.confidence === confidence)
    .reduce((sum, f) => sum + f.reviewableAmount, 0);
}

export function calculateInitialCost(form: InitialCostForm): DiagnosisResult {
  const items = form.items.filter((item) => item.amount > 0);
  const totalCurrent = items.reduce((sum, item) => sum + item.amount, 0);

  const findings = buildFindings(items, form);
  const totalReviewable = sumByConfidence(findings, "reviewable");
  const estimatedWithUs = Math.max(totalCurrent - totalReviewable, 0);
  const difference = totalCurrent - estimatedWithUs;

  const categoryTotals: Partial<Record<CostCategory, number>> = {};
  for (const item of items) {
    categoryTotals[item.category] = (categoryTotals[item.category] ?? 0) + item.amount;
  }

  return {
    totalCurrent,
    totalReviewable,
    estimatedWithUs,
    difference,
    findings,
    categoryTotals,
  };
}
