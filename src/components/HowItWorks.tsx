const STEPS = [
  { title: "見積書を撮る・アップロードする", description: "写真でもPDFでもOKです" },
  { title: "内容を自動で整理", description: "合計と内訳をすぐに確認できます" },
  { title: "気になる点を相談する", description: "LINEやフォームで気軽に" },
];

export function HowItWorks() {
  return (
    <section className="bg-white px-6 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-md">
        <h2 className="text-center text-xl font-bold text-slate-900">使い方は3ステップ</h2>
        <ol className="mt-10 space-y-6">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex items-center gap-4">
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
                {index + 1}
              </span>
              <div>
                <p className="font-semibold text-slate-900">{step.title}</p>
                <p className="text-sm text-slate-500">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
