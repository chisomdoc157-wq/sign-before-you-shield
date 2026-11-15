
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Clock3,
  Fingerprint,
  Globe2,
  ShieldCheck,
  ShieldEllipsis,
  Activity,
  LockKeyhole,
} from "lucide-react";

import { BrandHeader } from "@/components/safesign/BrandHeader";
import CheckForm from "@/components/safesign/CheckForm";
import {
  languages,
  type Language,
} from "@/components/safesign/language";
import { t } from "@/components/safesign/messages";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SafeSign — Web3 Security Console" },
      {
        name: "description",
        content:
          "Verify blockchain transactions, payment authenticity and token security before you sign.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [language, setLanguage] = useState<Language>("en");
  const [languageLoaded, setLanguageLoaded] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("safesign-language");

    if (
      savedLanguage &&
      languages.some((item) => item.code === savedLanguage)
    ) {
      setLanguage(savedLanguage as Language);
    }

    setLanguageLoaded(true);
  }, []);

  useEffect(() => {
    if (languageLoaded) {
      localStorage.setItem("safesign-language", language);
    }
  }, [language, languageLoaded]);

  const copy = t(language);

  const direction =
    languages.find((item) => item.code === language)?.dir ?? "ltr";

  return (
    <div
      dir={direction}
      lang={language}
      className="relative min-h-screen overflow-hidden bg-[#070b09] text-gray-100"
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 size-[420px] rounded-full bg-emerald-500/[0.06] blur-[120px]" />
        <div className="absolute -right-40 top-[420px] size-[420px] rounded-full bg-green-500/[0.05] blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070b09]/20 to-[#070b09]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 sm:px-7 lg:px-10">
        <BrandHeader
          language={language}
          onLanguageChange={setLanguage}
        />

        <main className="flex-1 pb-12 pt-8 sm:pt-12 lg:pt-14">
          {/* Console heading */}
          <section className="mx-auto mb-8 max-w-5xl">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-1.5">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                  Security verification workspace
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500">
                <LockKeyhole className="size-3.5 text-emerald-500/70" />
                <span>On-chain data verification</span>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                  <Activity className="size-4" />
                  {copy.eyebrow}
                </p>

                <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[58px]">
                  {copy.headline}
                  <br />
                  <span className="text-emerald-400">
                    {copy.accent}
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
                  {copy.description}
                </p>
              </div>

              <div className="hidden lg:flex lg:justify-end">
                <div className="relative flex size-28 items-center justify-center rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.04] shadow-[0_0_55px_rgba(16,185,129,0.07)]">
                  <div className="absolute inset-2 rounded-2xl border border-emerald-500/10" />
                  <ShieldEllipsis
                    className="size-14 text-emerald-400"
                    strokeWidth={1.2}
                  />
                  <span className="absolute -bottom-2 rounded-full border border-emerald-500/30 bg-[#0b120e] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-emerald-300">
                    SafeSign
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Workspace indicators */}
          <section className="mx-auto mb-6 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Globe2 className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-500">
                  Network coverage
                </p>
                <p className="mt-1 text-sm font-bold text-gray-200">
                  7 networks
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Fingerprint className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-500">
                  Verification modes
                </p>
                <p className="mt-1 text-sm font-bold text-gray-200">
                  3 security checks
                </p>
              </div>
            </div>

            <div className="col-span-2 flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5 sm:col-span-1">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-500">
                  Security principle
                </p>
                <p className="mt-1 text-sm font-bold text-gray-200">
                  Verify before signing
                </p>
              </div>
            </div>
          </section>

          {/* Main verification workspace */}
          <section className="mx-auto max-w-5xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold tracking-wide text-gray-200">
                  Verification console
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Submit blockchain details for independent verification.
                </p>
              </div>

              <div className="hidden items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-400/70 sm:flex">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Ready
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-[#0b110e]/95 p-3 shadow-[0_20px_80px_rgba(0,0,0,0.35),0_0_45px_rgba(16,185,129,0.035)] sm:p-5">
              <div className="mb-4 flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-red-400/80" />
                  <span className="size-2 rounded-full bg-yellow-400/80" />
                  <span className="size-2 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                    SAFESIGN / CHECK
                  </span>
                </div>

                <span className="text-[9px] font-medium uppercase tracking-widest text-gray-600">
                  Secure workspace
                </span>
              </div>

              <CheckForm language={language} />
            </div>

            <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="flex items-center gap-2 text-[11px] text-gray-500">
                <LockKeyhole className="size-3.5 text-emerald-500/70" />
                Check transaction and contract data before trusting a payment.
              </p>

              <Link
                to="/history"
                className="group inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-4 py-2.5 text-xs font-semibold text-gray-300 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/[0.07] hover:text-emerald-300"
              >
                <Clock3 className="size-3.5" />
                View saved history
                <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </section>
        </main>

        <footer className="border-t border-emerald-500/10 py-5">
          <div className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
            <p className="text-[11px] text-gray-500">
              {copy.footer}
            </p>
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-600">
              SAFESIGN · WEB3 SECURITY
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
