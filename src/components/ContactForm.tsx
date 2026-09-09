"use client";

import { FormEvent, useState } from "react";

interface FormState {
  name: string;
  email: string;
  phone: string;
  lineId: string;
  propertyName: string;
  propertyUrl: string;
  currentAgency: string;
  desiredMoveInDate: string;
  message: string;
  agreed: boolean;
}

const INITIAL_STATE: FormState = {
  name: "",
  email: "",
  phone: "",
  lineId: "",
  propertyName: "",
  propertyUrl: "",
  currentAgency: "",
  desiredMoveInDate: "",
  message: "",
  agreed: false,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubmitStatus = "idle" | "submitting" | "success" | "error";

function inputClass(hasError: boolean) {
  return `w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-1 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-500"
      : "border-slate-300 focus:border-teal-600 focus:ring-teal-600"
  }`;
}

export function ContactForm() {
  const [values, setValues] = useState<FormState>(INITIAL_STATE);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [submitError, setSubmitError] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!values.name.trim()) nextErrors.name = "お名前を入力してください。";
    if (!values.email.trim()) {
      nextErrors.email = "メールアドレスを入力してください。";
    } else if (!EMAIL_PATTERN.test(values.email)) {
      nextErrors.email = "メールアドレスの形式が正しくありません。";
    }
    if (!values.propertyName.trim()) nextErrors.propertyName = "物件名を入力してください。";
    if (!values.message.trim()) nextErrors.message = "相談内容を入力してください。";
    if (!values.agreed) nextErrors.agreed = "個人情報の取扱いへの同意が必要です。";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setStatus("submitting");
    setSubmitError("");
    try {
      const body = new FormData();
      body.append("name", values.name);
      body.append("email", values.email);
      body.append("phone", values.phone);
      body.append("lineId", values.lineId);
      body.append("propertyName", values.propertyName);
      body.append("propertyUrl", values.propertyUrl);
      body.append("currentAgency", values.currentAgency);
      body.append("desiredMoveInDate", values.desiredMoveInDate);
      body.append("message", values.message);
      body.append("agreedToPrivacyPolicy", String(values.agreed));
      if (file) body.append("attachment", file);

      const res = await fetch("/api/contact", { method: "POST", body });
      if (!res.ok) {
        setStatus("error");
        setSubmitError("送信に失敗しました。時間をおいて再度お試しください。");
        return;
      }
      setStatus("success");
      setValues(INITIAL_STATE);
      setFile(null);
    } catch {
      setStatus("error");
      setSubmitError("通信エラーが発生しました。時間をおいて再度お試しください。");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 text-center">
        <p className="text-base font-bold text-teal-800">お問い合わせありがとうございます</p>
        <p className="mt-2 text-sm leading-relaxed text-teal-700">
          内容を確認のうえ、担当者よりご連絡いたします。今しばらくお待ちください。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-slate-800">
          お名前 <span className="text-red-500">必須</span>
        </label>
        <input
          id="name"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          className={inputClass(!!errors.name)}
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-800">
          メールアドレス <span className="text-red-500">必須</span>
        </label>
        <input
          id="email"
          type="email"
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          className={inputClass(!!errors.email)}
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-slate-800">
            電話番号<span className="ml-1 text-slate-400">任意</span>
          </label>
          <input
            id="phone"
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputClass(false)}
          />
        </div>
        <div>
          <label htmlFor="lineId" className="mb-1.5 block text-sm font-semibold text-slate-800">
            LINE ID<span className="ml-1 text-slate-400">任意</span>
          </label>
          <input
            id="lineId"
            value={values.lineId}
            onChange={(e) => update("lineId", e.target.value)}
            className={inputClass(false)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="propertyName" className="mb-1.5 block text-sm font-semibold text-slate-800">
          物件名 <span className="text-red-500">必須</span>
        </label>
        <input
          id="propertyName"
          value={values.propertyName}
          onChange={(e) => update("propertyName", e.target.value)}
          className={inputClass(!!errors.propertyName)}
        />
        {errors.propertyName && <p className="mt-1 text-xs text-red-600">{errors.propertyName}</p>}
      </div>

      <div>
        <label htmlFor="propertyUrl" className="mb-1.5 block text-sm font-semibold text-slate-800">
          物件URL<span className="ml-1 text-slate-400">任意</span>
        </label>
        <input
          id="propertyUrl"
          value={values.propertyUrl}
          onChange={(e) => update("propertyUrl", e.target.value)}
          placeholder="https://"
          className={inputClass(false)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="currentAgency" className="mb-1.5 block text-sm font-semibold text-slate-800">
            現在の不動産会社<span className="ml-1 text-slate-400">任意</span>
          </label>
          <input
            id="currentAgency"
            value={values.currentAgency}
            onChange={(e) => update("currentAgency", e.target.value)}
            className={inputClass(false)}
          />
        </div>
        <div>
          <label
            htmlFor="desiredMoveInDate"
            className="mb-1.5 block text-sm font-semibold text-slate-800"
          >
            希望入居日<span className="ml-1 text-slate-400">任意</span>
          </label>
          <input
            id="desiredMoveInDate"
            type="date"
            value={values.desiredMoveInDate}
            onChange={(e) => update("desiredMoveInDate", e.target.value)}
            className={inputClass(false)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-slate-800">
          相談内容 <span className="text-red-500">必須</span>
        </label>
        <textarea
          id="message"
          rows={4}
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="例：仲介手数料や24時間サポートの費用について確認したいです。"
          className={inputClass(!!errors.message)}
        />
        {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
      </div>

      <div>
        <label htmlFor="attachment" className="mb-1.5 block text-sm font-semibold text-slate-800">
          見積書添付<span className="ml-1 text-slate-400">任意</span>
        </label>
        <input
          id="attachment"
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700"
        />
      </div>

      <div>
        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={values.agreed}
            onChange={(e) => update("agreed", e.target.checked)}
            className="mt-0.5 h-4 w-4 flex-none rounded border-slate-300 text-teal-700 focus:ring-teal-600"
          />
          <span>
            <a href="/privacy" className="underline underline-offset-2 hover:text-teal-700">
              個人情報の取扱い
            </a>
            に同意する <span className="text-red-500">必須</span>
          </span>
        </label>
        {errors.agreed && <p className="mt-1 text-xs text-red-600">{errors.agreed}</p>}
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-teal-700 py-3.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {status === "submitting" ? "送信中…" : "この内容で送信する"}
      </button>
    </form>
  );
}
