
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Globe,
  LoaderCircle,
  RefreshCw,
  ScanSearch,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { BrandHeader } from "@/components/safesign/BrandHeader";
import type { Language } from "@/components/safesign/language";

import { saveReport } from "@/lib/safesign-storage";

export const Route = createFileRoute("/links")({
  component: LinkScannerPage,
});

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://safe-sign-backend.onrender.com"
).replace(/\/$/, "");

interface LinkStatistics {
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
  timeout: number;
  total: number;
}

interface LinkDetection {
  engine?: string;
  category?: string;
  result?: string;
}

interface LinkReport {
  analysisId: string;
  submittedUrl?: string;
  status: string;
  verdict: string;
  statistics: LinkStatistics;
  detections: LinkDetection[];
  lastAnalysisDate?: number | string | null;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  code?: string;
  report?: LinkReport;
}

const EMPTY_STATISTICS: LinkStatistics = {
  malicious: 0,
  suspicious: 0,
  harmless: 0,
  undetected: 0,
  timeout: 0,
  total: 0,
};

async function requestApi(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const data = (await response.json()) as ApiResponse;

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || `Request failed with status ${response.status}`,
    );
  }

  return data;
}

function getVerdictDetails(verdict: string) {
  switch (verdict?.toUpperCase()) {
    case "MALICIOUS":
      return {
        label: "Malicious URL detected",
        description:
          "VirusTotal reported malicious detections for this URL. Avoid visiting or interacting with it.",
        color: "red",
        icon: ShieldAlert,
      };

    case "SUSPICIOUS":
      return {
        label: "Suspicious URL",
        description:
          "One or more security engines have flagged this URL as suspicious. Treat it with caution.",
        color: "amber",
        icon: AlertTriangle,
      };

    case "NO_KNOWN_THREATS":
      return {
        label: "No known threats detected",
        description:
          "The completed analysis returned no malicious or suspicious detections. This does not guarantee that the URL is safe.",
        color: "emerald",
        icon: ShieldCheck,
      };

    default:
      return {
        label: "Analysis in progress",
        description:
          "VirusTotal is still processing this URL. The result is not ready yet.",
        color: "blue",
        icon: Clock3,
      };
  }
}

function isAnalysisComplete(status?: string) {
  return status?.toLowerCase() === "completed";
}

function formatAnalysisDate(value?: number | string | null) {
  if (!value) return "Not available";

  const date =
    typeof value === "number"
      ? new Date(value * 1000)
      : new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function StatCard({
  label,
  value,
  description,
  color,
}: {
  label: string;
  value: number;
  description: string;
  color: string;
}) {
  const colorStyles: Record<string, string> = {
    red: "text-red-400 border-red-500/20 bg-red-500/[0.06]",
    amber: "text-amber-400 border-amber-500/20 bg-amber-500/[0.06]",
    emerald:
      "text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.06]",
    gray: "text-gray-300 border-white/10 bg-white/[0.03]",
  };

  return (
    <div className="bg-[#0b110e] border border-white/[0.08] p-4 rounded-xl">
      <div className="flex gap-2 items-center justify-between">
        <span className="font-medium text-gray-400 text-xs">{label}</span>
        <span
          className={`rounded-lg border px-2 py-1 text-xs font-bold ${colorStyles[color]}`}
        >
          {value}
        </span>
      </div>
      <p className="mt-3 text-[11px] text-gray-500">{description}</p>
    </div>
  );
}

function LinkScannerPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [url, setUrl] = useState("");
  const [report, setReport] = useState<LinkReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState("");
  const [pollError, setPollError] = useState("");
  const reportCreatedAt = useRef("");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("safesign-language");

    if (savedLanguage) {
      setLanguage(savedLanguage as Language);
    }
  }, []);

  useEffect(() => {
    if (!report?.analysisId || isAnalysisComplete(report.status)) {
      setPolling(false);
      return;
    }

    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    setPolling(true);

    const pollAnalysis = async () => {
      try {
        const query = new URLSearchParams({
          analysisId: report.analysisId,
        });

        const response = await requestApi(
          `/api/links/analysis?${query.toString()}`,
        );

        if (!active || !response.report) return;
        setReport(response.report);
        persistLinkReport(response.report, "URL scan analysis updated.");
        setPollError("");

        if (!isAnalysisComplete(response.report.status)) {
          timer = setTimeout(pollAnalysis, 4000);
        } else {
          setPolling(false);
        }
      } catch (err) {
        if (!active) return;

        setPollError(
          err instanceof Error
            ? err.message
            : "Could not retrieve the latest analysis.",
        );
        setPolling(false);
      }
    };

    timer = setTimeout(pollAnalysis, 4000);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [report?.analysisId, report?.status]);

  const handleLanguageChange = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    localStorage.setItem("safesign-language", nextLanguage);
  };
  const persistLinkReport = (
    nextReport: LinkReport,
    message = "URL scan result updated.",
  ) => {
    void saveReport({
      id: `link-${nextReport.analysisId}`,
      mode: "link",
      network: "web",
      title: "URL security scan",
      searchText: nextReport.submittedUrl || url,
      createdAt: reportCreatedAt.current || new Date().toISOString(), ,
      response: {
        success: true,
        message,
        report: nextReport,
      },
    }).catch((err) => {
      console.error("Could not update URL scan history:", err);
    });
  };
  const handleScan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const submittedUrl = url.trim();

    if (!submittedUrl) {
      setError("Enter a URL to scan.");
      return;
    }
    

    try {
      const parsedUrl = new URL(submittedUrl);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        setError("Only HTTP and HTTPS URLs are supported.");
        return;
      }
    } catch {
      setError("Enter a valid URL, including https:// or http://.");
      return;
    }

    setLoading(true);
    setError("");
    setPollError("");
    setReport(null);

    reportCreatedAt.current = new Date().toISOString();

    try {
      const response = await requestApi("/api/links/scan", {
        method: "POST",
        body: JSON.stringify({ url: submittedUrl }),
      });

      if (!response.report) {
        throw new Error("The scanner returned an empty report.");
      }

      setReport(response.report);

      persistLinkReport(
  response.report,
  response.message || "URL scan submitted.",
);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The URL scan could not be completed.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRetryAnalysis = async () => {
    if (!report?.analysisId) return;

    setPollError("");
    setPolling(true);

    try {
      const query = new URLSearchParams({
        analysisId: report.analysisId,
      });

      const response = await requestApi(
        `/api/links/analysis?${query.toString()}`,
      );

      if (response.report) {
        setReport(response.report);
        persistLinkReport(response.report, "URL scan analysis updated.");
        setPolling(!isAnalysisComplete(response.report.status));
      }
    } catch (err) {
      setPollError(
        err instanceof Error
          ? err.message
          : "Could not retrieve the analysis.",
      );
      setPolling(false);
    }
  };

  const completed = isAnalysisComplete(report?.status);
  const verdict = report ? getVerdictDetails(report.verdict) : null;
  const VerdictIcon = verdict?.icon;

  const statistics = report?.statistics ?? EMPTY_STATISTICS;

  return (
    <div className="bg-[#070b09] min-h-screen text-gray-100">
      <div className="lg:px-8 max-w-7xl mx-auto px-4 sm:px-6">
        <BrandHeader
          language={language}
          onLanguageChange={handleLanguageChange}
        />

        <main className="pb-16">
          <div className="flex flex-wrap gap-3 items-center justify-between py-6">
            <Link
              to="/"
              className="font-medium gap-2 hover:text-emerald-300 inline-flex items-center text-gray-400 text-xs transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back to workspace
            </Link>

            <Link
              to="/history"
              className="font-medium gap-2 hover:text-emerald-300 inline-flex items-center text-gray-400 text-xs transition-colors"
            >
              <Clock3 className="size-4" />
              Scan history
              <ArrowUpRight className="size-3" />
            </Link>
          </div>

          <section className="bg-[#0a100d] border border-emerald-500/15 overflow-hidden p-6 relative rounded-2xl sm:p-9">
            <div className="-right-20 -top-28 absolute bg-emerald-500/[0.07] blur-3xl pointer-events-none rounded-full size-80" />

            <div className="relative">
              <div className="bg-emerald-500/[0.07] border border-emerald-500/20 font-bold gap-2 inline-flex items-center mb-5 px-3 py-1.5 rounded-full text-[10px] text-emerald-300 tracking-[0.18em] uppercase">
                <Globe className="size-3.5" />
                Threat intelligence
              </div>

              <div className="max-w-2xl">
                <h1 className="font-bold sm:text-4xl text-3xl text-white tracking-tight">
                  Link <span className="text-emerald-400">Scanner</span>
                </h1>

                <p className="leading-6 mt-3 sm:text-base text-gray-400 text-sm">
                  Inspect suspicious URLs before connecting your wallet,
                  opening a dApp, or interacting with an unfamiliar Web3
                  platform.
                </p>
              </div>

              <form
                onSubmit={handleScan}
                className="max-w-3xl mt-8 relative"
              >
                <label
                  htmlFor="scan-url"
                  className="block font-semibold mb-2 text-gray-400 text-xs tracking-wider uppercase"
                >
                  Website or dApp URL
                </label>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="bg-[#050907] border border-white/10 flex flex-1 focus-within:border-emerald-500/50 gap-3 items-center min-w-0 px-4 rounded-xl transition-colors">
                    <Globe className="shrink-0 size-5 text-emerald-500/70" />

                    <input
                      id="scan-url"
                      type="url"
                      value={url}
                      onChange={(event) => setUrl(event.target.value)}
                      placeholder="https://example.com"
                      autoComplete="url"
                      className="bg-transparent h-14 min-w-0 outline-none placeholder:text-gray-600 text-sm text-white w-full"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || polling}
                    className="bg-emerald-500 border border-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-50 font-bold gap-2 h-14 hover:bg-emerald-400 inline-flex items-center justify-center px-7 rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.12)] text-[#04110b] text-sm transition-all"
                  >
                    {loading ? (
                      <>
                        <LoaderCircle className="animate-spin size-4" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <ScanSearch className="size-4" />
                        Scan URL
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="bg-red-500/[0.06] border border-red-500/20 flex gap-2 items-start mt-4 p-3 rounded-lg text-red-300 text-xs">
                    <AlertTriangle className="mt-0.5 shrink-0 size-4" />
                    {error}
                  </div>
                )}

                <p className="flex gap-2 items-start leading-5 mt-4 text-[11px] text-gray-500">
                  <AlertTriangle className="mt-0.5 shrink-0 size-3.5 text-amber-500/70" />
                  Submitted URLs are shared with VirusTotal for analysis and
                  may be accessible to its security community. Do not submit
                  private or confidential links.
                </p>
              </form>
            </div>
          </section>

          <section className="gap-4 grid mt-7 sm:grid-cols-3">
            <div className="bg-[#0b110e] border border-white/[0.08] p-5 rounded-xl">
              <div className="flex gap-3 items-center">
                <div className="bg-emerald-500/[0.07] border border-emerald-500/20 flex items-center justify-center rounded-xl size-10">
                  <ShieldCheck className="size-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-200 text-sm">
                    Threat detection
                  </p>
                  <p className="mt-1 text-gray-500 text-xs">
                    Multiple security engines
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#0b110e] border border-white/[0.08] p-5 rounded-xl">
              <div className="flex gap-3 items-center">
                <div className="bg-emerald-500/[0.07] border border-emerald-500/20 flex items-center justify-center rounded-xl size-10">
                  <ActivityIcon />
                </div>
                <div>
                  <p className="font-semibold text-gray-200 text-sm">
                    Live analysis
                  </p>
                  <p className="mt-1 text-gray-500 text-xs">
                    Results retrieved from VirusTotal
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#0b110e] border border-white/[0.08] p-5 rounded-xl">
              <div className="flex gap-3 items-center">
                <div className="bg-emerald-500/[0.07] border border-emerald-500/20 flex items-center justify-center rounded-xl size-10">
                  <ShieldAlert className="size-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-200 text-sm">
                    Risk awareness
                  </p>
                  <p className="mt-1 text-gray-500 text-xs">
                    Malicious and suspicious findings
                  </p>
                </div>
              </div>
            </div>
          </section>

          {report && verdict && VerdictIcon && (
            <section className="mt-8 space-y-5">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <div>
                  <h2 className="font-bold text-lg text-white">
                    Scan report
                  </h2>
                  <p className="mt-1 text-gray-500 text-xs">
                    URL threat intelligence results
                  </p>
                </div>

                <span className="bg-white/[0.04] border border-white/10 font-semibold gap-2 inline-flex items-center px-3 py-1.5 rounded-full text-[10px] text-gray-300 tracking-wider uppercase">
                  <span className="bg-emerald-400 rounded-full size-1.5" />
                  VirusTotal
                </span>
              </div>

              <div
                className={`rounded-2xl border p-5 sm:p-6 ${
                  verdict.color === "red"
                    ? "border-red-500/25 bg-red-500/[0.06]"
                    : verdict.color === "amber"
                      ? "border-amber-500/25 bg-amber-500/[0.06]"
                      : verdict.color === "emerald"
                        ? "border-emerald-500/25 bg-emerald-500/[0.06]"
                        : "border-blue-500/25 bg-blue-500/[0.06]"
                }`}
              >
                <div className="flex gap-4 items-start">
                  <div
                    className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${
                      verdict.color === "red"
                        ? "bg-red-500/10 text-red-400"
                        : verdict.color === "amber"
                          ? "bg-amber-500/10 text-amber-400"
                          : verdict.color === "emerald"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-blue-500/10 text-blue-400"
                    }`}
                  >
                    <VerdictIcon className="size-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-white">
                      {verdict.label}
                    </h3>
                    <p className="leading-6 max-w-2xl mt-2 text-gray-400 text-xs">
                      {verdict.description}
                    </p>

                    <div className="flex flex-wrap gap-2 items-center mt-4">
                      <span className="bg-black/20 border border-white/10 font-semibold px-2.5 py-1 rounded-md text-[10px] text-gray-300 tracking-wider uppercase">
                        {report.status.replace(/[_-]/g, " ")}
                      </span>

                      {polling && (
                        <span className="bg-blue-500/[0.06] border border-blue-500/20 gap-1.5 inline-flex items-center px-2.5 py-1 rounded-md text-[10px] text-blue-300">
                          <LoaderCircle className="animate-spin size-3" />
                          Checking for updates
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="gap-3 grid lg:grid-cols-4 sm:grid-cols-2">
                <StatCard
                  label="Malicious"
                  value={statistics.malicious}
                  description="Engines identifying malicious activity"
                  color="red"
                />
                <StatCard
                  label="Suspicious"
                  value={statistics.suspicious}
                  description="Engines reporting suspicious behaviour"
                  color="amber"
                />
                <StatCard
                  label="Harmless"
                  value={statistics.harmless}
                  description="Engines reporting no threat"
                  color="emerald"
                />
                <StatCard
                  label="Undetected"
                  value={statistics.undetected}
                  description="Engines with no detection verdict"
                  color="gray"
                />
              </div>

              <div className="bg-[#0b110e] border border-white/[0.08] p-5 rounded-xl">
                <h3 className="font-semibold text-sm text-white">
                  Scan information
                </h3>

                <div className="gap-4 grid mt-4 sm:grid-cols-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-[10px] text-gray-500 tracking-wider uppercase">
                      Submitted URL
                    </p>
                    <p className="break-all mt-2 text-emerald-300 text-xs">
                      {report.submittedUrl || url}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-[10px] text-gray-500 tracking-wider uppercase">
                      Last analysis
                    </p>
                    <p className="mt-2 text-gray-300 text-xs">
                      {formatAnalysisDate(report.lastAnalysisDate)}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="font-semibold text-[10px] text-gray-500 tracking-wider uppercase">
                      Analysis ID
                    </p>
                    <p className="break-all font-mono mt-2 text-[11px] text-gray-400">
                      {report.analysisId}
                    </p>
                  </div>
                </div>
              </div>

              {report.detections?.length > 0 && (
                <div className="bg-[#0b110e] border border-white/[0.08] overflow-hidden rounded-xl">
                  <div className="border-b border-white/[0.07] px-5 py-4">
                    <h3 className="font-semibold text-sm text-white">
                      Security engine detections
                    </h3>
                    <p className="mt-1 text-gray-500 text-xs">
                      Engines that reported malicious or suspicious findings
                    </p>
                  </div>

                  <div className="divide-white/[0.06] divide-y">
                    {report.detections.map((detection, index) => (
                      <div
                        key={`${detection.engine || "engine"}-${index}`}
                        className="flex flex-wrap gap-3 items-center justify-between px-5 py-4"
                      >
                        <div>
                          <p className="font-semibold text-gray-200 text-xs">
                            {detection.engine || "Security engine"}
                          </p>
                          <p className="mt-1 text-[11px] text-gray-500">
                            {detection.result || "Detection reported"}
                          </p>
                        </div>

                        <span
                          className={`rounded-md border px-2 py-1 text-[10px] font-semibold uppercase ${
                            detection.category === "malicious"
                              ? "border-red-500/20 bg-red-500/[0.06] text-red-300"
                              : "border-amber-500/20 bg-amber-500/[0.06] text-amber-300"
                          }`}
                        >
                          {detection.category || "Flagged"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pollError && (
                <div className="bg-amber-500/[0.05] border border-amber-500/20 flex flex-wrap gap-3 items-center justify-between p-4 rounded-xl">
                  <p className="flex gap-2 items-start text-amber-300 text-xs">
                    <AlertTriangle className="mt-0.5 shrink-0 size-4" />
                    {pollError}
                  </p>

                  <button
                    type="button"
                    onClick={handleRetryAnalysis}
                    className="border border-amber-500/20 font-semibold gap-2 hover:bg-amber-500/10 inline-flex items-center px-3 py-2 rounded-lg text-amber-300 text-xs"
                  >
                    <RefreshCw className="size-3.5" />
                    Retry
                  </button>
                </div>
              )}

              {!completed && !polling && !pollError && (
                <div className="bg-blue-500/[0.05] border border-blue-500/20 flex gap-3 items-center justify-between p-4 rounded-xl">
                  <p className="text-blue-300 text-xs">
                    Analysis is still pending. SafeSign will check for the
                    completed result automatically.
                  </p>
                  <LoaderCircle className="animate-spin shrink-0 size-4 text-blue-400" />
                </div>
              )}

              {completed && (
                <div className="bg-[#0b110e] border border-white/[0.08] flex flex-wrap gap-3 items-center justify-between p-4 rounded-xl">
                  <p className="text-gray-400 text-xs">
                    Analysis completed. Review the findings before interacting
                    with this website.
                  </p>

                  <a
                    href={`https://www.virustotal.com/gui/url/${encodeURIComponent(
                      report.analysisId,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold gap-2 hover:text-emerald-200 inline-flex items-center text-emerald-300 text-xs transition-colors"
                  >
                    View on VirusTotal
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              )}
            </section>
          )}

          {!report && !loading && (
            <section className="bg-white/[0.015] border border-dashed border-white/10 mt-8 px-5 py-10 rounded-xl text-center">
              <div className="bg-emerald-500/[0.05] border border-emerald-500/15 flex items-center justify-center mx-auto rounded-2xl size-14">
                <ScanSearch className="size-6 text-emerald-400/80" />
              </div>

              <h2 className="font-semibold mt-4 text-gray-200 text-sm">
                Ready to inspect a URL?
              </h2>
              <p className="leading-6 max-w-md mt-2 mx-auto text-gray-500 text-xs">
                Enter a website or decentralised application URL above. Your
                scan results will appear here when the analysis is available.
              </p>
            </section>
          )}

          <div className="flex flex-wrap gap-x-5 gap-y-2 items-center justify-center mt-8 text-[10px] text-gray-600">
            <span className="gap-1.5 inline-flex items-center">
              <CheckCircle2 className="size-3 text-emerald-500/70" />
              Read-only URL inspection
            </span>
            <span className="gap-1.5 inline-flex items-center">
              <XCircle className="size-3 text-gray-600" />
              No wallet connection required
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}

function ActivityIcon() {
  return <RefreshCw className="size-5 text-emerald-400" />;
}
