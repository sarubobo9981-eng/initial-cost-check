import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { DiagnosisFlow } from "@/components/DiagnosisFlow";
import { HowItWorks } from "@/components/HowItWorks";
import { TrustPoints } from "@/components/TrustPoints";
import { FAQ } from "@/components/FAQ";
import { ContactForm } from "@/components/ContactForm";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";
import { MobileStickyCTA } from "@/components/MobileStickyCTA";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <DiagnosisFlow />
        <HowItWorks />
        <TrustPoints />
        <FAQ />
        <section id="contact" className="bg-slate-50 px-6 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-lg">
            <h2 className="text-center text-xl font-bold text-slate-900">初期費用について相談する</h2>
            <p className="mt-2 text-center text-sm text-slate-500">
              担当者が内容を確認のうえ、折り返しご連絡いたします。
            </p>
            <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-6">
              <ContactForm />
            </div>
          </div>
        </section>
        <FinalCTA />
      </main>
      <Footer />
      <MobileStickyCTA />
    </>
  );
}
