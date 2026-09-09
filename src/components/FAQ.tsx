const FAQS = [
  {
    q: "本当に無料で使えますか？",
    a: "はい、診断のご利用・ご相談は無料です。会員登録も不要です。",
  },
  {
    q: "見積書がなくても診断できますか？",
    a: "はい。金額を一つずつ手入力していただいても診断できます。",
  },
  {
    q: "必ず初期費用が安くなりますか？",
    a: "いいえ。「見直せる可能性のある項目」を確認しやすくするものであり、金額の削減を保証するものではありません。",
  },
  {
    q: "相談すると必ず契約しなければいけませんか？",
    a: "いいえ。見積もりの確認だけでも問題ございません。お気軽にご相談ください。",
  },
];

export function FAQ() {
  return (
    <section className="bg-white px-6 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-md">
        <h2 className="text-center text-xl font-bold text-slate-900">よくある質問</h2>
        <div className="mt-8 divide-y divide-slate-100">
          {FAQS.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 marker:content-none">
                <span className="flex items-center justify-between gap-3">
                  <span>{item.q}</span>
                  <span className="flex-none text-slate-300 transition group-open:rotate-45">＋</span>
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
