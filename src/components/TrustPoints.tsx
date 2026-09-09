const TRUST_POINTS = [
  { title: "完全無料", description: "診断・ご相談はすべて無料です" },
  { title: "情報は診断だけに使用", description: "無断で第三者に提供することはありません" },
  { title: "無理な営業はしません", description: "気になる点だけご確認いただければ十分です" },
];

export function TrustPoints() {
  return (
    <section className="bg-slate-50 px-6 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-md">
        <h2 className="text-center text-xl font-bold text-slate-900">安心してお使いください</h2>
        <ul className="mt-10 space-y-6">
          {TRUST_POINTS.map((point) => (
            <li key={point.title} className="flex items-start gap-3">
              <span className="mt-0.5 flex-none text-teal-700">✓</span>
              <div>
                <p className="font-semibold text-slate-900">{point.title}</p>
                <p className="text-sm text-slate-500">{point.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
