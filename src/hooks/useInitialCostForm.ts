"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { InitialCostForm, InitialCostItem } from "@/types/initialCost";
import { calculateInitialCost } from "@/lib/calculateInitialCost";
import { createDefaultItems } from "@/lib/defaultItems";

const STORAGE_KEY = "initial-cost-form-v1";

function createEmptyForm(): InitialCostForm {
  return { monthlyRent: 0, items: createDefaultItems() };
}

function loadFormFromStorage(): InitialCostForm {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as InitialCostForm;
      if (parsed && Array.isArray(parsed.items) && typeof parsed.monthlyRent === "number") {
        return parsed;
      }
    }
  } catch {
    // 保存データが壊れている場合はデフォルトにフォールバック
  }
  return createEmptyForm();
}

/**
 * 診断フォームの状態管理フック。
 * ページ内タブ切り替えやスクロールで入力値が消えないよう、sessionStorageに保持する。
 * サーバー/クライアントのレンダリング不一致を避けるため、初回はデフォルト値でマウントし、
 * マウント後にsessionStorageの値を反映する。
 */
export function useInitialCostForm() {
  const [form, setForm] = useState<InitialCostForm>(createEmptyForm);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // サーバー/クライアントのレンダリング不一致を避けるため、マウント後に一度だけ
    // sessionStorageの値を読み込んで反映する（意図的な同期的setState）。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(loadFormFromStorage());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      // ストレージが利用できない環境では無視
    }
  }, [form, isHydrated]);

  const setMonthlyRent = useCallback((value: number) => {
    setForm((prev) => ({ ...prev, monthlyRent: value }));
  }, []);

  const updateItemAmount = useCallback((id: string, amount: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, amount } : item)),
    }));
  }, []);

  const addItem = useCallback((item: InitialCostItem) => {
    setForm((prev) => ({ ...prev, items: [...prev.items, item] }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setForm((prev) => ({ ...prev, items: prev.items.filter((item) => item.id !== id) }));
  }, []);

  const replaceForm = useCallback((next: InitialCostForm) => {
    setForm(next);
  }, []);

  const resetForm = useCallback(() => {
    setForm(createEmptyForm());
  }, []);

  const diagnosis = useMemo(() => calculateInitialCost(form), [form]);

  return {
    form,
    diagnosis,
    setMonthlyRent,
    updateItemAmount,
    addItem,
    removeItem,
    replaceForm,
    resetForm,
  };
}
