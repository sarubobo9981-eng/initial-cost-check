export function Hero() {
  return (
    <section className="bg-teal-50 px-6 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-20">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-2xl font-bold leading-snug text-slate-900 sm:text-3xl">
          その初期費用、
          <br />
          払う前にチェック。
        </h1>
        <p className="mt-3 text-sm text-slate-500 sm:text-base">
          不動産屋でもらった
          <br />
          見積書を撮るだけ。
        </p>
        <a
          href="#diagnosis"
          className="mt-6 block w-full rounded-full bg-teal-700 px-8 py-4 text-base font-bold text-white shadow-sm shadow-teal-900/10 hover:bg-teal-800"
        >
          見積書を撮る・選ぶ
        </a>
        <p className="mt-2.5 text-xs text-slate-400">写真・PDF対応　手入力もOK</p>
      </div>
    </section>
  );
}
