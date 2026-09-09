"use client";

import { formatNumber, parseYenInput } from "@/lib/format";

interface YenInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  ariaLabel?: string;
}

export function YenInput({ id, value, onChange, placeholder, ariaLabel }: YenInputProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 focus-within:border-teal-600 focus-within:ring-1 focus-within:ring-teal-600">
      <span className="text-sm text-slate-400">¥</span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        aria-label={ariaLabel}
        placeholder={placeholder ?? "0"}
        value={value === 0 ? "" : formatNumber(value)}
        onChange={(e) => onChange(parseYenInput(e.target.value))}
        className="w-full min-w-0 bg-transparent text-right text-base font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-300"
      />
    </div>
  );
}
