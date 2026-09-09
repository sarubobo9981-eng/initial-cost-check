import { CostCategoryMeta } from "@/types/initialCost";

/**
 * 費用カテゴリのメタ情報（表示名・入力フォームでの扱い）。
 * UIと計算ロジックの両方から参照する唯一の定義元。
 */
export const COST_CATEGORIES: CostCategoryMeta[] = [
  {
    id: "brokerage_fee",
    label: "仲介手数料",
    isPrimary: true,
    helpText: "不動産会社に支払う仲介手数料",
  },
  {
    id: "deposit",
    label: "敷金",
    isPrimary: true,
  },
  {
    id: "key_money",
    label: "礼金",
    isPrimary: true,
  },
  {
    id: "advance_rent",
    label: "前家賃・日割り家賃",
    isPrimary: true,
  },
  {
    id: "management_fee",
    label: "管理費・共益費",
    isPrimary: true,
  },
  {
    id: "guarantee_company",
    label: "保証会社利用料",
    isPrimary: true,
  },
  {
    id: "fire_insurance",
    label: "火災保険料",
    isPrimary: true,
  },
  {
    id: "key_exchange",
    label: "鍵交換費用",
    isPrimary: false,
  },
  {
    id: "disinfection",
    label: "消毒施工費",
    isPrimary: false,
    helpText: "室内消毒・抗菌施工などの費用",
  },
  {
    id: "cleaning_fee",
    label: "清掃費",
    isPrimary: false,
    helpText: "入居時クリーニング代等",
  },
  {
    id: "support_service",
    label: "24時間サポート・安心サポート等",
    isPrimary: false,
    helpText: "24時間サポートや駆けつけサービスなどの任意加入サービス",
  },
  {
    id: "other",
    label: "その他",
    isPrimary: false,
  },
];

export function getCategoryLabel(id: string): string {
  return COST_CATEGORIES.find((c) => c.id === id)?.label ?? "その他";
}

export const PRIMARY_CATEGORIES = COST_CATEGORIES.filter((c) => c.isPrimary);
export const OPTIONAL_CATEGORIES = COST_CATEGORIES.filter((c) => !c.isPrimary);
