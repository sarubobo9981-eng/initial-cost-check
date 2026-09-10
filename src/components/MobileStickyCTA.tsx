"use client";

import { useEffect, useState } from "react";
import { LINE_URL } from "@config/company";

/**
 * スマホ画面下部に常時固定表示するLINE相談ボタン。
 * 診断前・診断後・問い合わせフォーム表示中を問わず、ページ全体で唯一の固定CTAとして表示する。
 * 入力欄にフォーカスがある間（キーボード表示中）は、入力の邪魔にならないよう一時的に隠す。
 */
export function MobileStickyCTA() {
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    function isTextInput(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement)) return false;
      return target.tagName === "INPUT" || target.tagName === "TEXTAREA";
    }
    function handleFocusIn(e: FocusEvent) {
      if (isTextInput(e.target)) setIsInputFocused(true);
    }
    function handleFocusOut(e: FocusEvent) {
      if (isTextInput(e.target)) setIsInputFocused(false);
    }
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);
    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  if (isInputFocused) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 pt-2.5 backdrop-blur sm:hidden"
      style={{ paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom))" }}
    >
      <a
        href={LINE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded-full bg-[#06C755] py-3 text-center text-sm font-bold text-white"
      >
        LINEで相談する
      </a>
    </div>
  );
}
