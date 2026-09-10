"use client";

import { FormEvent, useState } from "react";
import { ReplyMethod } from "@/types/contact";
import { LINE_URL } from "@config/company";

interface FormState {
  name: string;
  email: string;
  phone: string;
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
  propertyName: "",
  propertyUrl: "",
  currentAgency: "",
  desiredMoveInDate: "",
  message: "",
  agreed: false,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubmitStatus = "idle" | "submitting" | "success" | "error";

const REPLY_METHODS: { id: ReplyMethod; label: string }[] = [
  { id: "email", label: "メールアドレス" },
  { id: "line", label: "LINE" },
  { id: "phone", label: "電話番号" },
];

function inputClass(hasError: boolean) {
  return `w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-1 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-500"
      : "border-slate-300 focus:border-teal-600 focus:ring-teal-600"
  }`;
}

export function ContactForm() {
  const [values, setValues] = useState<FormState>(INITIAL_STATE);
  const [replyMethod, setReplyMethod] = useState<ReplyMethod>("email");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [submitError, setSubmitError] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (replyMethod === "email") {
      if (!values.email.trim()) {
        nextErrors.email = "メールアドレスを入力してください。";
      } else if (!EMAIL_PATTERN.test(values.email)) {
        nextErrors.email = "メールアドレスの形式が正しくありません。";
      }
    }
    if (replyMethod === "phone" && !values.phone.trim()) {
      nextErrors.phone = "電話番号を入力してください。";
    }

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
      body.append("replyMethod", replyMethod);
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
          お名前<span className="ml-1 text-slate-400">任意</span>
        </label>
        <input
          id="name"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          className={inputClass(false)}
        />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-semibold text-slate-800">
          返信先 <span className="text-red-500">必須</span>
        </p>
        <div className="grid grid-cols-3 gap-2">
          {REPLY_METHODS.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => setReplyMethod(method.id)}
              className={`rounded-full py-2 text-xs font-semibold transition ${
                replyMethod === method.id
                  ? "bg-teal-700 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {method.label}
            </button>
          ))}
        </div>

        <div className="mt-3">
          {replyMethod === "email" && (
            <input
              type="email"
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="example@mail.com"
              aria-label="メールアドレス"
              className={inputClass(!!errors.email)}
            />
          )}
          {replyMethod === "phone" && (
            <input
              type="tel"
              value={values.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="090-1234-5678"
              aria-label="電話番号"
              className={inputClass(!!errors.phone)}
            />
          )}
          {replyMethod === "line" && (
            <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-500">
              LINEでのご相談は、下部の「公式LINEから相談する」ボタンからそのままトーク画面へ進みます。
            </p>
          )}
        </div>

        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="propertyName" className="mb-1.5 block text-sm font-semibold text-slate-800">
          物件名<span className="ml-1 text-slate-400">任意</span>
        </label>
        <input
          id="propertyName"
          value={values.propertyName}
          onChange={(e) => update("propertyName", e.target.value)}
          className={inputClass(false)}
        />
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
          気になること<span className="ml-1 text-slate-400">任意</span>
        </label>
        <textarea
          id="message"
          rows={4}
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="例：仲介手数料や24時間サポートの費用について確認したいです。"
          className={inputClass(false)}
        />
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

      {replyMethod !== "line" && (
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
      )}

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      {replyMethod === "line" ? (
        <a
          href={LINE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-full bg-[#06C755] py-3.5 text-center text-sm font-bold text-white hover:brightness-95"
        >
          公式LINEから相談する
        </a>
      ) : (
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-full bg-teal-700 py-3.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {status === "submitting" ? "送信中…" : "この内容で送信する"}
        </button>
      )}
    </form>
  );
}
