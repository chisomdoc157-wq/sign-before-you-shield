
import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ShieldCheck,
  Activity,
  Globe2,
  LockKeyhole,
} from "lucide-react";

type StartupMode = "boot" | "cinematic" | "loader" | "ready";

const INTRO_REPEAT_AFTER_MS =30 * 60 * 1000;
const INTRO_STORAGE_KEY = "safesign-last-cinematic-intro";
const LEGACY_INTRO_KEY = "safesign-intro-seen-v1";

export function StartupExperience({
  children,
}: {
  children: ReactNode;
}) {
  const [mode, setMode] = useState<StartupMode>("boot");
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;

  useEffect(() => {
    let forceIntro = false;

    try {
      const params = new URLSearchParams(window.location.search);
      forceIntro = params.get("intro") === "1";

      if (forceIntro) {
        params.delete("intro");

        const query = params.toString();
        const cleanUrl =
          window.location.pathname +
          (query ? `?${query}` : "") +
          window.location.hash;

        window.history.replaceState(
          window.history.state,
          "",
          cleanUrl,
        );
      }

      const lastIntro = Number(
        localStorage.getItem(INTRO_STORAGE_KEY) || 0,
      );

      const shouldShowIntro =
        forceIntro ||
        !lastIntro ||
        Date.now() - lastIntro >= INTRO_REPEAT_AFTER_MS;

      setMode(shouldShowIntro ? "cinematic" : "loader");
    } catch {
      setMode("cinematic");
    }
  }, []);

  const finishStartup = (completedIntro: boolean) => {
    if (completedIntro) {
      try {
        localStorage.setItem(
          INTRO_STORAGE_KEY,
          String(Date.now()),
        );

        // Prevent the old homepage intro from appearing again.
        localStorage.setItem(LEGACY_INTRO_KEY, "true");
      } catch {
        // Startup should still continue if storage is unavailable.
      }
    }

    setMode("ready");
  };

  useEffect(() => {
    if (mode !== "cinematic" && mode !== "loader") return;

    const duration =
      mode === "cinematic"
        ? reducedMotion
          ? 4200
          : 7600
        : reducedMotion
          ? 500
          : 1400;

    const timer = window.setTimeout(() => {
      finishStartup(mode === "cinematic");
    }, duration);

    return () => window.clearTimeout(timer);
  }, [mode, reducedMotion]);

  if (mode === "ready") {
    return <>{children}</>;
  }

  const isCinematic = mode === "cinematic";
  const isBooting = mode === "boot";

  return (
    <div
      className="bg-[#030a08] fixed flex inset-0 items-center justify-center min-h-screen overflow-hidden text-white z-[99999]"
      style={{
        background:
          "radial-gradient(ellipse at 50% 45%, #103d2b 0%, #071a13 42%, #030a08 100%)",
      }}
    >
      {/* Background atmosphere */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(52,211,153,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={
          reducedMotion
            ? { opacity: 0.35 }
            : { opacity: [0.15, 0.4, 0.15] }
        }
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(circle at center, rgba(16,185,129,0.2), transparent 55%)",
        }}
      />

        {isCinematic && (
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 24 }, (_, index) => (
          <motion.span
            key={index}
            className="absolute bg-emerald-300 h-1 rounded-full w-1"
            style={{
              left: `${(index * 37) % 100}%`,
              top: `${(index * 53) % 100}%`,
            }}
            animate={
              reducedMotion
                ? { opacity: 0.35 }
                : {
                    y: [-12, 12, -12],
                    opacity: [0.1, 0.8, 0.1],
                  }
            }
            transition={{
              duration: 3 + (index % 4),
              repeat: Infinity,
              delay: (index % 6) * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      )}

      <div className="flex flex-col items-center max-w-xl px-6 relative text-center w-full z-10">
        {/* Cinematic shield */}
        <div className="flex h-44 items-center justify-center mb-8 relative w-44">
          {isCinematic && (
            <>
              <motion.div
                className="absolute border border-emerald-400/20 inset-0 rounded-full"
                animate={reducedMotion ? {} : { rotate: 360 }}
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              <motion.div
                className="absolute border border-dashed border-emerald-300/30 inset-4 rounded-full"
                animate={reducedMotion ? {} : { rotate: -360 }}
                transition={{
                  duration: 25,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              <motion.div
                className="absolute border border-emerald-400/20 inset-7 rounded-full"
                animate={
                  reducedMotion
                    ? { opacity: 0.6 }
                    : {
                        scale: [0.92, 1.08, 0.92],
                        opacity: [0.3, 0.8, 0.3],
                      }
                }
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </>
          )}

          <motion.div
            className="bg-emerald-400/10 border border-emerald-300/40 flex h-24 items-center justify-center relative rounded-[28px] shadow-[0_0_70px_rgba(16,185,129,0.3)] w-24"
            initial={isBooting ? false : { scale: 0.65, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <ShieldCheck
              size={62}
              strokeWidth={1.5}
              className="drop-shadow-[0_0_18px_rgba(52,211,153,0.6)] text-emerald-300"
            />
          </motion.div>
        </div>

        {/* Brand */}
        <motion.div
          initial={isBooting ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: isCinematic ? 0.4 : 0 }}
        >
          <h1 className="font-bold sm:text-5xl text-4xl tracking-[0.22em]">
            SAFE<span className="text-emerald-400">SIGN</span>
          </h1>

          {isCinematic && (
            <motion.p
              className="font-semibold mt-4 text-emerald-300/80 text-xs tracking-[0.35em]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              VERIFY BEFORE YOU TRUST
            </motion.p>
          )}
        </motion.div>

        {/* Cinematic introduction */}
        {isCinematic ? (
          <>
            <motion.p
              className="leading-7 max-w-sm mt-7 text-emerald-50/65 text-sm"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 1 }}
            >
              Your security layer for a safer Web3 experience.
              Check transactions, tokens and links before you trust them.
            </motion.p>

            <motion.div
              className="gap-3 grid grid-cols-3 max-w-md mt-9 w-full"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.8 }}
            >
              <div className="flex flex-col gap-2 items-center">
                <ShieldCheck className="text-emerald-400" size={21} />
                <span className="text-[9px] text-white/55 tracking-wider">
                  TRANSACTIONS
                </span>
              </div>

              <div className="flex flex-col gap-2 items-center">
                <Activity className="text-emerald-400" size={21} />
                <span className="text-[9px] text-white/55 tracking-wider">
                  TOKEN SECURITY
                </span>
              </div>

              <div className="flex flex-col gap-2 items-center">
                <Globe2 className="text-emerald-400" size={21} />
                <span className="text-[9px] text-white/55 tracking-wider">
                  LINK ANALYSIS
                </span>
              </div>
            </motion.div>

            <div className="bg-white/10 h-[2px] mt-12 overflow-hidden rounded-full w-56">
              <motion.div
                className="bg-emerald-400 h-full origin-left rounded-full shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: reducedMotion ? 4.2 : 7.6,
                  ease: "linear",
                }}
              />
            </div>

            <motion.button
              type="button"
              onClick={() => finishStartup(true)}
              className="hover:text-emerald-300 mt-6 text-white/45 text-xs transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
            >
              Skip intro
            </motion.button>
          </>
        ) : (
          <motion.div
            className="flex flex-col gap-4 items-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex gap-2 items-center text-emerald-100/65 text-sm">
              <LockKeyhole size={14} className="text-emerald-400" />
              {isBooting
                ? "Preparing SafeSign"
                : "Initializing your security workspace"}
            </div>

            {!isBooting && (
              <motion.div className="bg-white/10 h-[2px] overflow-hidden rounded-full w-36">
                <motion.div
                  className="bg-emerald-400 h-full rounded-full"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </motion.div>
            )}
          </motion.div>
        )}

        <p className="absolute mt-16 text-[9px] text-white/25 tracking-[0.3em]">
          SAFE WEB3. BETTER DECISIONS.
        </p>
      </div>
    </div>
  );
}
