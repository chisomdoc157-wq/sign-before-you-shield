
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
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
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

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

/* -------------------------------------------------------
   SAFESIGN CINEMATIC INTRO
------------------------------------------------------- */

type SafeSignIntroProps = {
  onComplete: () => void;
  reducedMotion: boolean;
};

function SafeSignIntro({
  onComplete,
  reducedMotion,
}: SafeSignIntroProps) {
  const features = [
    "TRANSACTION VERIFICATION",
    "TOKEN INTELLIGENCE",
    "WALLET SECURITY",
  ];

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="SafeSign introduction"
      className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center overflow-hidden bg-[#030805] px-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: reducedMotion ? 1 : 1.035,
        filter: reducedMotion ? "blur(0px)" : "blur(10px)",
      }}
      transition={{
        duration: reducedMotion ? 0.2 : 0.7,
        ease: "easeInOut",
      }}
    >
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.13),transparent_65%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.035)_1px,transparent_1px)] bg-[size:45px_45px]" />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030805]" />

        <motion.div
          className="absolute -left-40 top-1/4 size-[400px] rounded-full bg-emerald-500/[0.08] blur-[120px]"
          animate={
            reducedMotion
              ? undefined
              : { x: [0, 50, 0], y: [0, 30, 0] }
          }
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute -right-40 bottom-1/4 size-[400px] rounded-full bg-green-400/[0.07] blur-[120px]"
          animate={
            reducedMotion
              ? undefined
              : { x: [0, -45, 0], y: [0, -35, 0] }
          }
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Floating network particles */}
        {Array.from({ length: 18 }, (_, index) => {
          const left = (index * 47 + 9) % 100;
          const top = (index * 67 + 13) % 100;

          return (
            <motion.span
              key={index}
              className="absolute size-1 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.9)]"
              style={{
                left: `${left}%`,
                top: `${top}%`,
              }}
              animate={
                reducedMotion
                  ? undefined
                  : {
                      y: [0, -16, 0],
                      opacity: [0.15, 0.8, 0.15],
                      scale: [0.8, 1.3, 0.8],
                    }
              }
              transition={{
                duration: 2.8 + (index % 3),
                repeat: Infinity,
                delay: (index % 8) * 0.18,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>

      {/* Skip button */}
      <motion.button
        type="button"
        onClick={onComplete}
        className="absolute right-5 top-5 z-20 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300 transition-colors hover:border-emerald-400/50 hover:bg-emerald-500/15"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reducedMotion ? 0 : 1.2 }}
      >
        Skip intro <span className="ml-1">→</span>
      </motion.button>

      {/* Main intro content */}
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
        {/* Animated shield */}
        <motion.div
          className="relative mb-9 flex size-32 items-center justify-center sm:size-40"
          initial={{
            opacity: 0,
            scale: reducedMotion ? 1 : 0.55,
            y: reducedMotion ? 0 : 25,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          transition={{
            duration: reducedMotion ? 0.2 : 1.1,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {/* Outer rotating ring */}
          <motion.div
            className="absolute inset-0 rounded-full border border-dashed border-emerald-400/20"
            animate={
              reducedMotion ? undefined : { rotate: 360 }
            }
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Inner ring */}
          <motion.div
            className="absolute inset-3 rounded-full border border-emerald-400/20"
            animate={
              reducedMotion ? undefined : { rotate: -360 }
            }
            transition={{
              duration: 16,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Glow */}
          <motion.div
            className="absolute inset-5 rounded-full bg-emerald-400/20 blur-2xl"
            animate={
              reducedMotion
                ? undefined
                : {
                    scale: [0.85, 1.2, 0.85],
                    opacity: [0.4, 0.9, 0.4],
                  }
            }
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Shield container */}
          <div className="relative flex size-20 items-center justify-center rounded-[26px] border border-emerald-400/40 bg-[#07150e] shadow-[0_0_55px_rgba(16,185,129,0.22)] sm:size-24">
            <ShieldEllipsis
              className="size-12 text-emerald-300 sm:size-14"
              strokeWidth={1.25}
            />

            <motion.span
              className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-[#07150e] bg-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.9)]"
              animate={
                reducedMotion
                  ? undefined
                  : { scale: [1, 1.4, 1] }
              }
              transition={{
                duration: 1.8,
                repeat: Infinity,
              }}
            />
          </div>
        </motion.div>

        {/* Brand name */}
        <motion.p
          className="mb-3 text-[10px] font-bold uppercase tracking-[0.45em] text-emerald-400 sm:text-xs"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reducedMotion ? 0 : 0.45 }}
        >
          THE WEB3 SECURITY LAYER
        </motion.p>

        <motion.h1
          className="text-5xl font-black tracking-[-0.06em] text-white sm:text-7xl"
          initial={{
            opacity: 0,
            y: reducedMotion ? 0 : 25,
            filter: reducedMotion ? "blur(0px)" : "blur(12px)",
          }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          transition={{
            delay: reducedMotion ? 0 : 0.65,
            duration: reducedMotion ? 0.2 : 1,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          Safe<span className="text-emerald-400">Sign</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="mt-5 max-w-xl text-sm leading-7 text-gray-400 sm:text-base"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reducedMotion ? 0 : 1.1 }}
        >
          Your transactions deserve more than trust.
          <br />
          <span className="font-semibold text-emerald-300">
            Verify before you sign.
          </span>
        </motion.p>

        {/* Animated light beam */}
        <motion.div
          className="relative mt-9 h-px w-full max-w-md overflow-hidden bg-emerald-500/15"
          initial={{ opacity: 0, scaleX: 0.3 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: reducedMotion ? 0 : 1.3 }}
        >
          {!reducedMotion && (
            <motion.div
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-emerald-300 to-transparent"
              animate={{ x: ["-120%", "420%"] }}
              transition={{
                duration: 2.3,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          )}
        </motion.div>

        {/* Capability highlights */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {features.map((feature, index) => (
            <motion.div
              key={feature}
              className="rounded-full border border-emerald-500/15 bg-emerald-500/[0.045] px-3 py-2 text-[8px] font-bold tracking-[0.12em] text-emerald-200/80 sm:text-[9px]"
              initial={{
                opacity: 0,
                y: reducedMotion ? 0 : 12,
              }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: reducedMotion ? 0 : 1.5 + index * 0.2,
              }}
            >
              <span className="mr-1.5 text-emerald-400">✦</span>
              {feature}
            </motion.div>
          ))}
        </div>

        {/* Progress indicator */}
        <motion.div
          className="mt-12 w-full max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reducedMotion ? 0 : 1.5 }}
        >
          <div className="mb-2 flex items-center justify-between text-[8px] font-bold uppercase tracking-[0.2em] text-gray-500">
            <span>Entering security workspace</span>
            <span className="text-emerald-400">SAFESIGN</span>
          </div>

          <div className="h-1 overflow-hidden rounded-full bg-white/[0.07]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-700 via-emerald-400 to-green-200 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: reducedMotion ? 1.5 : 6.8,
                ease: "linear",
              }}
            />
          </div>
        </motion.div>

        <motion.p
          className="mt-5 text-[8px] font-medium uppercase tracking-[0.25em] text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reducedMotion ? 0 : 2 }}
        >
          SECURITY STARTS BEFORE THE SIGNATURE
        </motion.p>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------
   MAIN SAFESIGN HOMEPAGE
------------------------------------------------------- */

function Index() {
  const [language, setLanguage] = useState<Language>("en");

  const [requestedMode, setRequestedMode] = useState<
    "verify" | "match" | "token" | undefined
  >(undefined);

  const [languageLoaded, setLanguageLoaded] = useState(false);

  const [introChecked, setIntroChecked] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);

  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = Boolean(prefersReducedMotion);

  /* Check whether the visitor has already seen the intro */
  useEffect(() => {
    let alreadySeen = false;
    let forceIntro = false;

    try {
      alreadySeen =
        window.localStorage.getItem("safesign-intro-seen-v1") === "true";
    } catch {
      alreadySeen = false;
    }

    const params = new URLSearchParams(window.location.search);
    forceIntro = params.get("intro") === "1";

    if (forceIntro) {
      params.delete("intro");

      const remainingQuery = params.toString();

      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}${remainingQuery ? `?${remainingQuery}` : ""}${window.location.hash}`,
      );
    }

    setIntroVisible(forceIntro || !alreadySeen);
    setIntroChecked(true);
  }, []);

  /* Finish the intro and remember that it has been shown */
  const finishIntro = useCallback(() => {
    try {
      window.localStorage.setItem("safesign-intro-seen-v1", "true");
    } catch {
      // The homepage remains usable if storage is unavailable.
    }

    setIntroVisible(false);
  }, []);

  /* Automatically enter the homepage after the intro */
  useEffect(() => {
    if (!introVisible) return;

    const duration = reducedMotion ? 1800 : 7200;

    const timer = window.setTimeout(finishIntro, duration);

    return () => window.clearTimeout(timer);
  }, [introVisible, reducedMotion, finishIntro]);

  function openTokenScanner() {
    setRequestedMode("token");

    document
      .getElementById("safesign-check-form")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  }

  /* Preserve direct navigation to the token scanner */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("scanner") === "token") {
      setRequestedMode("token");
      window.history.replaceState({}, "", "/");
    }
  }, []);

  useEffect(() => {
    if (requestedMode === "token") {
      document
        .getElementById("safesign-check-form")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }
  }, [requestedMode]);

  /* Language preference */
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
    <>
      {/* Cinematic introduction overlay */}
      <AnimatePresence>
        {introVisible && (
          <SafeSignIntro
            key="safesign-intro"
            onComplete={finishIntro}
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>

      {/* Existing SafeSign homepage */}
      <div
        dir={direction}
        lang={language}
        className={`relative min-h-screen w-full overflow-x-clip bg-[#070b09] text-gray-100 transition-opacity duration-500 ${
          introChecked ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
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

              <div
                id="safesign-check-form"
                className="bg-[#0b110e]/95 border border-emerald-500/20 p-3 rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.35),0_0_45px_rgba(16,185,129,0.035)] sm:p-5"
              >
                <div className="border-b border-white/[0.06] flex items-center justify-between mb-4 pb-3">
                  <div className="flex gap-2 items-center">
                    <span className="bg-red-400/80 rounded-full size-2" />
                    2" />
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
    </>
  );
}
