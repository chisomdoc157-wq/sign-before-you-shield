
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
  Wallet,
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

      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "SafeSign" },
      {
        property: "og:title",
        content: "SafeSign — Web3 Security Console",
      },
      {
        property: "og:description",
        content:
          "Verify transactions. Match payments. Check token security. Make safer Web3 decisions with SafeSign.",
      },
      {
        property: "og:url",
        content: "https://sign-before-you-shield.vercel.app/",
      },
      {
        property: "og:image",
        content:
          "https://sign-before-you-shield.vercel.app/safesign-preview.png",
      },
      {
        property: "og:image:secure_url",
        content:
          "https://sign-before-you-shield.vercel.app/safesign-preview.png",
      },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "SafeSign Web3 Security Preview",
      },

      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "SafeSign — Web3 Security Console",
      },
      {
        name: "twitter:description",
        content:
          "Verify transactions. Match payments. Check token security.",
      },
      {
        name: "twitter:image",
        content:
          "https://sign-before-you-shield.vercel.app/safesign-preview.png",
      },
    ],
  }),
  component: Index,
});
function Index() {
  const [language, setLanguage] = useState<Language>("en");
  const [requestedMode, setRequestedMode] = useState<
    "verify" | "match" | "token" | undefined
  >(undefined);

  function openTokenScanner() {
  setRequestedMode("token");

    document
      .getElementById("safesign-check-form")
    ?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
}
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
      className="bg-[#070b09] min-h-screen overflow-hidden relative text-gray-100"
    >
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="-left-40 absolute bg-emerald-500/[0.06] blur-[120px] rounded-full size-[420px] top-20" />
        <div className="-right-40 absolute bg-green-500/[0.05] blur-[120px] rounded-full size-[420px] top-[420px]" />
        <div className="absolute bg-[linear-gradient(rgba(16,185,129,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.035)_1px,transparent_1px)] bg-[size:48px_48px] inset-0" />
        <div className="absolute bg-gradient-to-b from-transparent inset-0 to-[#070b09] via-[#070b09]/20" />
      </div>

      <div className="flex flex-col lg:px-10 max-w-[1440px] min-h-screen mx-auto px-4 relative sm:px-7 w-full z-10">
        <BrandHeader
          language={language}
          onLanguageChange={setLanguage}
          onTokenScannerClick={openTokenScanner}
        />

        <main className="flex-1 lg:pt-14 pb-12 pt-8 sm:pt-12">
          {/* Console heading */}
          <section className="max-w-5xl mb-8 mx-auto">
            <div className="flex flex-wrap gap-3 items-center justify-between mb-5">
              <div className="bg-emerald-500/[0.07] border border-emerald-500/20 gap-2 inline-flex items-center px-3 py-1.5 rounded-full">
                <span className="flex relative size-2">
                  <span className="absolute animate-ping bg-emerald-400 inline-flex opacity-50 rounded-full size-full" />
                  <span className="bg-emerald-400 inline-flex relative rounded-full size-2" />
                </span>
                <span className="font-bold text-[10px] text-emerald-300 tracking-[0.2em] uppercase">
                  Security verification workspace
                </span>
              </div>

              <div className="flex font-medium gap-2 items-center text-[10px] text-gray-500 tracking-[0.16em] uppercase">
                <LockKeyhole className="size-3.5 text-emerald-500/70" />
                <span>On-chain data verification</span>
              </div>
            </div>

            <div className="gap-8 grid lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="flex font-semibold gap-2 items-center mb-3 text-emerald-400 text-xs tracking-[0.2em] uppercase">
                  <Activity className="size-4" />
                  {copy.eyebrow}
                </p>

                <h1 className="font-bold font-display leading-[1.08] lg:text-[58px] max-w-3xl sm:text-5xl text-4xl text-white tracking-tight">
                  {copy.headline}
                  <br />
                  <span className="text-emerald-400">
                    {copy.accent}
                  </span>
                </h1>

                <p className="leading-7 max-w-2xl mt-5 sm:text-base text-gray-400 text-sm">
                  {copy.description}
                </p>
              </div>

              <div className="hidden lg:flex lg:justify-end">
                <div className="bg-emerald-500/[0.04] border border-emerald-500/20 flex items-center justify-center relative rounded-3xl shadow-[0_0_55px_rgba(16,185,129,0.07)] size-28">
                  <div className="absolute border border-emerald-500/10 inset-2 rounded-2xl" />
                  <ShieldEllipsis
                    className="size-14 text-emerald-400"
                    strokeWidth={1.2}
                  />
                  <span className="-bottom-2 absolute bg-[#0b120e] border border-emerald-500/30 font-bold px-3 py-1 rounded-full text-[9px] text-emerald-300 tracking-widest uppercase">
                    SafeSign
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Workspace indicators */}
          <section className="gap-3 grid grid-cols-2 max-w-5xl mb-6 mx-auto sm:grid-cols-3">
            <div className="bg-white/[0.025] border border-white/[0.07] flex gap-3 items-center p-3.5 rounded-xl">
              <div className="bg-emerald-500/10 flex items-center justify-center rounded-lg shrink-0 size-9 text-emerald-400">
                <Globe2 className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[9px] text-gray-500 tracking-widest uppercase">
                  Network coverage
                </p>
                <p className="font-bold mt-1 text-gray-200 text-sm">
                  7 networks
                </p>
              </div>
            </div>

            <div className="bg-white/[0.025] border border-white/[0.07] flex gap-3 items-center p-3.5 rounded-xl">
              <div className="bg-emerald-500/10 flex items-center justify-center rounded-lg shrink-0 size-9 text-emerald-400">
                <Fingerprint className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[9px] text-gray-500 tracking-widest uppercase">
                  Verification modes
                </p>
                <p className="font-bold mt-1 text-gray-200 text-sm">
                  3 security checks
                </p>
              </div>
            </div>

            <div className="bg-white/[0.025] border border-white/[0.07] col-span-2 flex gap-3 items-center p-3.5 rounded-xl sm:col-span-1">
              <div className="bg-emerald-500/10 flex items-center justify-center rounded-lg shrink-0 size-9 text-emerald-400">
                <ShieldCheck className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[9px] text-gray-500 tracking-widest uppercase">
                  Security principle
                </p>
                <p className="font-bold mt-1 text-gray-200 text-sm">
                  Verify before signing
                </p>
              </div>
            </div>
          </section>

          {/* Main verification workspace */}
          <section className="max-w-5xl mx-auto">
            <div className="flex gap-3 items-center justify-between mb-3">
              <div>
                <h2 className="font-bold text-gray-200 text-sm tracking-wide">
                  Verification console
                </h2>
                <p className="mt-1 text-gray-500 text-xs">
                  Submit blockchain details for independent verification.
                </p>
              </div>

              <div className="font-semibold gap-1.5 hidden items-center sm:flex text-[10px] text-emerald-400/70 tracking-widest uppercase">
                <span className="bg-emerald-400 rounded-full size-1.5" />
                Ready
              </div>
            </div>

            <div className="bg-[#0b110e]/95 border border-emerald-500/20 p-3 rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.35),0_0_45px_rgba(16,185,129,0.035)] sm:p-5">
              <div className="border-b border-white/[0.06] flex items-center justify-between mb-4 pb-3">
                <div className="flex gap-2 items-center">
                  <span className="bg-red-400/80 rounded-full size-2" />
                  <span className="bg-yellow-400/80 rounded-full size-2" />
                  <span className="bg-emerald-400/80 rounded-full size-2" />
                  <span className="font-semibold ml-2 text-[9px] text-gray-500 tracking-[0.2em] uppercase">
                    SAFESIGN / CHECK
                  </span>
                </div>

                <span className="font-medium text-[9px] text-gray-600 tracking-widest uppercase">
                  Secure workspace
                </span>
              </div>

              <CheckForm
                language={language}
                requestedMode={requestedMode}
              />
            </div>

            {/* Navigation links */}
            <div className="flex flex-col gap-3 items-center justify-between mt-5 sm:flex-row">
              <p className="flex gap-2 items-center text-[11px] text-gray-500">
                <LockKeyhole className="size-3.5 text-emerald-500/70" />
                Check transaction and contract data before trusting a payment.
              </p>

              <div className="flex flex-wrap gap-2">
                <Link
                  to="/wallet"
                  className="bg-emerald-500/10 border border-emerald-500/30 font-semibold gap-2 hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:text-emerald-300 inline-flex items-center px-4 py-2.5 rounded-lg text-emerald-400 text-xs transition-all"
                >
                  <Wallet className="size-3.5" />
                  Wallet Check
                  <ArrowUpRight className="size-3.5" />
                </Link>

                <Link
                  to="/history"
                  className="bg-white/[0.035] border border-white/10 font-semibold gap-2 group hover:bg-emerald-500/[0.07] hover:border-emerald-500/40 hover:text-emerald-300 inline-flex items-center px-4 py-2.5 rounded-lg text-gray-300 text-xs transition-all"
                >
                  <Clock3 className="size-3.5" />
                  View saved history
                  <ArrowUpRight className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 size-3.5 transition-transform" />
                </Link>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-emerald-500/10 border-t py-5">
          <div className="flex flex-col gap-2 items-center justify-between sm:flex-row sm:text-left text-center">
            <p className="text-[11px] text-gray-500">
              {copy.footer}
            </p>
            <p className="font-semibold text-[9px] text-gray-600 tracking-[0.18em] uppercase">
              SAFESIGN · WEB3 SECURITY
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}