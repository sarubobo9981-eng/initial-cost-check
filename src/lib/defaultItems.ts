import { InitialCostItem, CostCategory } from "@/types/initialCost";
import { COST_CATEGORIES, PRIMARY_CATEGORIES } from "@/lib/costCategories";

/** 最初に表示する主要項目（金額はすべて0からスタート） */
export function createDefaultItems(): InitialCostItem[] {
  return PRIMARY_CATEGORIES.map((cat) => ({
    id: cat.id,
    category: cat.id,
    label: cat.label,
    amount: 0,
  }));
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** 「その他の費用を追加」からカテゴリを選んで項目を追加する場合 */
export function createItemFromCategory(categoryId: CostCategory): InitialCostItem {
  const meta = COST_CATEGORIES.find((c) => c.id === categoryId);
  return {
    id: generateId(categoryId),
    category: meta?.id ?? "other",
    label: meta?.label ?? "その他",
    amount: 0,
  };
}

/** 自由入力で項目名を追加する場合 */
export function createCustomItem(label: string): InitialCostItem {
  return {
    id: generateId("custom"),
    category: "other",
    label: label.trim() || "その他の費用",
    amount: 0,
    isCustom: true,
  };
}
