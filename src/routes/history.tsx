
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Clock3,
  Database,
  FileSearch,
  History,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

import CheckResult from "@/components/safesign/CheckResult";
import type { Language } from "@/components/safesign/language";
import {
  deleteReport,
  getReports,
  type SavedReport,
} from "@/lib/safesign-storage";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

function getModeLabel(mode: SavedReport["mode"]) {
  const labels: Record<SavedReport["mode"], string> = {
    verify: "Transaction verification",
    match: "Payment authentication",
    token: "Token security",
    link: "URL security scan",
  };
  return labels[mode] ?? "Security check";
}

function getReportStatus(report: SavedReport) {
  const response = report.response;
  const result =
    response.result &&
    typeof response.result === "object" &&
    !Array.isArray(response.result)
      ? (response.result as Record<string, unknown>)
      : {};

  const data =
    response.report &&
    typeof response.report === "object" &&
    !Array.isArray(response.report)
      ? (response.report as Record<string, unknown>)
      : {};
  if (
    report.mode === "link" &&
    typeof data.verdict === "string"
  ) {
    return data.verdict.toUpperCase().replace(/[\s-]+/g, "_");
  }
  const candidates = [
    response.status,
    result.status,
    result.matchStatus,
    data.status,
    data.verdict,
    data.trustStatus,
    data.transactionStatus,
    data.executionStatus,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.toUpperCase().replace(/[\s-]+/g, "_");
    }
  }

  if (response.success === true) return "SUCCESS";
  if (response.success === false) return "FAILED";

  return "UNKNOWN";
}

function getStatusAppearance(status: string) {
  if [
    "MATCHED",
    "SUCCESS",
    "SUCCESSFUL",
    "TRUSTED",
    "CONFIRMED",
    "NO_KNOWN_THREATS",
  ].includes(status)
  ) {
    return {
      label: status.replace(/_/g, " "),
      style: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
      dot: "bg-emerald-400",
    };
  }

  if (
    [
      "MISMATCHED",
      "FAILED",
      "RISK_DETECTED",
      "HIGH_RISK",
      "UNTRUSTED",
    ].includes(status)
  ) {
    return {
      label: status.replace(/_/g, " "),
      style: "border-red-500/25 bg-red-500/10 text-red-300",
      dot: "bg-red-400",
    };
  }

  return {
    label: status.replace(/_/g, " "),
    style: "border-amber-500/25 bg-amber-500/10 text-amber-300",
    dot: "bg-amber-400",
  };
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function LinkHistoryResult({
  response,
}: {
  response: Record<string, unknown>;
}) {
  const report =
    response.report &&
    typeof response.report === "object" &&
    !Array.isArray(response.report)
      ? (response.report as Record<string, unknown>)
      : {};

  const statistics =
    report.statistics &&
    typeof report.statistics === "object"
      ? (report.statistics as Record<string, unknown>)
      : {};

  const verdict = String(report.verdict || "PENDING").toUpperCase();
  const status = String(report.status || "Unknown");
  const submittedUrl = String(report.submittedUrl || "Not available");
  const analysisId = String(report.analysisId || "Not available");

  const lastAnalysis = report.lastAnalysisDate;
  const analysisDate =
    typeof lastAnalysis === "number"
      ? formatDate(new Date(lastAnalysis * 1000).toISOString())
      : typeof lastAnalysis === "string"
        ? formatDate(lastAnalysis)
        : "Not available";

  const isMalicious = verdict === "MALICIOUS";
  const isSuspicious = verdict === "SUSPICIOUS";
  const isClean = verdict === "NO_KNOWN_THREATS";

  const verdictStyle = isMalicious
    ? "border-red-500/25 bg-red-500/10 text-red-300"
    : isSuspicious
      ? "border-amber-500/25 bg-amber-500/10 text-amber-300"
      : isClean
        ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
        : "border-blue-500/25 bg-blue-500/10 text-blue-300";

  const stats = [
    { label: "Malicious", value: statistics.malicious ?? 0 },
    { label: "Suspicious", value: statistics.suspicious ?? 0 },
    { label: "Harmless", value: statistics.harmless ?? 0 },
    { label: "Undetected", value: statistics.undetected ?? 0 },
  ];

  return (
    <div className="space-y-4">
      <div className={`rounded-xl border p-4 ${verdictStyle}`}>
        <p className="font-bold text-sm">
          {isMalicious
            ? "Malicious URL detected"
            : isSuspicious
              ? "Suspicious URL"
              : isClean
                ? "No known threats detected"
                : "Analysis pending"}
        </p>

        <p className="leading-5 mt-2 opacity-80 text-xs">
          {isClean
            ? "No malicious or suspicious detections were returned. This does not guarantee that the URL is safe."
            : isMalicious
              ? "Security engines detected malicious activity. Avoid visiting or interacting with this URL."
              : isSuspicious
                ? "One or more security engines flagged this URL. Treat it with caution."
                : "The security analysis is not yet complete."}
        </p>
      </div>

      <div className="gap-3 grid grid-cols-2 sm:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className="bg-[#070c09] border border-white/[0.08] p-3 rounded-xl"
          >
            <p className="text-[10px] text-zinc-500">{item.label}</p>
            <p className="font-bold mt-2 text-2xl text-white">
              {String(item.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-[#070c09] border border-white/[0.08] p-4 rounded-xl">
        <p className="font-bold mb-3 text-white text-xs">
          Scan information
        </p>

        <div className="space-y-3 text-xs">
          <div>
            <p className="text-zinc-500">Submitted URL</p>
            <p className="break-all mt-1 text-emerald-300">
              {submittedUrl}
            </p>
          </div>

          <div className="gap-3 grid sm:grid-cols-2">
            <div>
              <p className="text-zinc-500">Analysis status</p>
              <p className="mt-1 text-zinc-200">
                {status.replace(/[_-]/g, " ")}
              </p>
            </div>

            <div>
              <p className="text-zinc-500">Last analysis</p>
              <p className="mt-1 text-zinc-200">{analysisDate}</p>
            </div>
          </div>

          <div>
            <p className="text-zinc-500">Analysis ID</p>
            <p className="break-all font-mono mt-1 text-[10px] text-zinc-400">
              {analysisId}
            </p>
          </div>
        </div>

        {analysisId !== "Not available" && (
          <a
            href={`https://www.virustotal.com/gui/url/${encodeURIComponent(analysisId)}`}
            target="_blank"
            rel="noreferrer"
            className="font-semibold gap-2 hover:text-emerald-200 inline-flex items-center mt-4 text-emerald-300 text-xs"
          >
            View on VirusTotal
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      <p className="leading-5 text-[10px] text-zinc-500">
        VirusTotal results are threat-intelligence signals, not a guarantee
        that a website is safe. Always verify unfamiliar websites before
        connecting a wallet or signing transactions.
      </p>
    </div>
  );
}

function HistoryPage() {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [selected, setSelected] = useState<SavedReport | null>(null);
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<SavedReport | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("safesign-language");

    if (savedLanguage) {
      setLanguage(savedLanguage as Language);
    }

    let active = true;

    async function loadReports() {
      try {
        const savedReports = await getReports();

        if (active) {
          setReports(savedReports);
          setLoadError("");
        }
      } catch {
        if (active) {
          setLoadError(
            "Your local report history could not be loaded. Please refresh and try again.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadReports();

    return () => {
      active = false;
    };
  }, []);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return reports;

    return reports.filter((report) => {
      const searchable = [
        report.title,
        report.network,
        report.mode,
        report.searchText,
        getModeLabel(report.mode),
        getReportStatus(report),
        formatDate(report.createdAt),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [reports, search]);

  async function handleDelete() {
    if (!deleteTarget || deleting) return;

    setDeleting(true);
    setDeleteError("");

    try {
      await deleteReport(deleteTarget.id);

      setReports((current) =>
        current.filter((item) => item.id !== deleteTarget.id),
      );

      if (selected?.id === deleteTarget.id) {
        setSelected(null);
      }

      setDeleteTarget(null);
    } catch {
      setDeleteError("Could not delete this report. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  const verificationCount = reports.filter(
    (report) => report.mode === "verify",
  ).length;

  const matchCount = reports.filter(
    (report) => report.mode === "match",
  ).length;

  const tokenCount = reports.filter(
    (report) => report.mode === "token",
  ).length;

  return (
    <main className="bg-[#070b09] min-h-screen overflow-hidden relative text-zinc-100">
      <div className="bg-[radial-gradient(ellipse_at_50%_-20%,rgba(16,185,129,0.12),transparent_55%)] fixed inset-0 pointer-events-none" />
      <div className="fixed inset-0 opacity-20 pointer-events-none safesign-grid" />

      <div className="lg:px-8 max-w-7xl mx-auto px-4 py-5 relative sm:px-6 w-full">
        {/* Top navigation */}
        <header className="border-b border-white/[0.07] flex gap-4 items-center justify-between mb-10 pb-5">
          <Link to="/" className="flex gap-3 group items-center">
            <div className="bg-emerald-500/10 border border-emerald-500/25 flex group-hover:bg-emerald-500/20 h-10 items-center justify-center rounded-xl transition w-10">
              <ShieldCheck className="h-5 text-emerald-400 w-5" />
            </div>

            <div>
              <p className="font-black text-sm text-white tracking-[0.17em]">
                SAFESIGN
              </p>
              <p className="font-semibold text-[9px] text-zinc-500 tracking-[0.2em] uppercase">
                Web3 security protocol
              </p>
            </div>
          </Link>

          <Link
            to="/"
            className="bg-white/[0.03] border border-white/10 font-semibold gap-2 h-10 hover:border-emerald-500/30 hover:text-emerald-300 inline-flex items-center px-3 rounded-lg sm:px-4 text-xs text-zinc-300 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to scanner</span>
          </Link>
        </header>

        {/* Page heading */}
        <section className="mb-8">
          <div className="flex gap-2 items-center mb-3">
            <span className="bg-emerald-500 h-px w-6" />
            <span className="font-bold text-[10px] text-emerald-400 tracking-[0.2em] uppercase">
              Local intelligence archive
            </span>
          </div>

          <div className="flex flex-col gap-4 justify-between sm:flex-row sm:items-end">
            <div>
              <h1 className="font-black sm:text-4xl text-3xl text-white tracking-tight">
                Report <span className="text-emerald-400">history</span>
              </h1>

              <p className="leading-relaxed max-w-xl mt-3 text-sm text-zinc-400">
                Review your previous transaction checks, payment comparisons
                and token security reports.
              </p>
            </div>

            <div className="flex gap-2 items-center text-xs text-zinc-500">
              <Database className="h-4 text-emerald-500 w-4" />
              Stored locally on this device
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="gap-3 grid grid-cols-2 lg:grid-cols-4 mb-7">
          <div className="bg-gradient-to-br border border-emerald-500/20 from-emerald-500/[0.10] p-4 rounded-xl to-transparent">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-[10px] text-zinc-400 tracking-wider uppercase">
                Total reports
              </span>
              <History className="h-4 text-emerald-400 w-4" />
            </div>
            <p className="font-black tabular-nums text-3xl text-white">
              {reports.length}
            </p>
          </div>

          <div className="bg-white/[0.025] border border-white/[0.07] p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-[10px] text-zinc-500 tracking-wider uppercase">
                Transactions
              </span>
              <FileSearch className="h-4 text-zinc-400 w-4" />
            </div>
            <p className="font-black tabular-nums text-3xl text-white">
              {verificationCount}
            </p>
          </div>

          <div className="bg-white/[0.025] border border-white/[0.07] p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-[10px] text-zinc-500 tracking-wider uppercase">
                Payment checks
              </span>
              <ShieldCheck className="h-4 text-zinc-400 w-4" />
            </div>
            <p className="font-black tabular-nums text-3xl text-white">
              {matchCount}
            </p>
          </div>

          <div className="bg-white/[0.025] border border-white/[0.07] p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-[10px] text-zinc-500 tracking-wider uppercase">
                Token scans
              </span>
              <ShieldCheck className="h-4 text-zinc-400 w-4" />
            </div>
            <p className="font-black tabular-nums text-3xl text-white">
              {tokenCount}
            </p>
          </div>
        </section>

        {/* Search */}
        <section className="mb-5">
          <div className="relative">
            <Search className="-translate-y-1/2 absolute h-4 left-4 pointer-events-none text-zinc-500 top-1/2 w-4" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by transaction, network, token, or check type..."
              className="bg-[#0c120f] border border-white/10 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10 h-12 outline-none pl-11 placeholder:text-zinc-600 pr-11 rounded-xl text-sm text-zinc-200 transition w-full"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="-translate-y-1/2 absolute flex h-8 hover:bg-white/5 hover:text-white items-center justify-center right-3 rounded-lg text-zinc-500 top-1/2 transition w-8"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </section>

        {/* Report list */}
        <section className="bg-[#0a100d]/90 border border-white/[0.08] overflow-hidden rounded-2xl">
          <div className="border-b border-white/[0.07] flex flex-wrap gap-3 items-center justify-between px-5 py-4">
            <div>
              <h2 className="font-bold text-sm text-white">
                Saved reports
              </h2>
              <p className="mt-1 text-[11px] text-zinc-500">
                {filteredReports.length}{" "}
                {filteredReports.length === 1 ? "record" : "records"} found
              </p>
            </div>

            <span className="bg-emerald-500/[0.07] border border-emerald-500/20 font-bold px-3 py-1 rounded-full text-[9px] text-emerald-400 tracking-wider uppercase">
              IndexedDB archive
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3 items-center justify-center min-h-56 p-8 text-center">
              <div className="animate-spin border-2 border-emerald-500/20 border-t-emerald-400 h-7 rounded-full w-7" />
              <p className="text-sm text-zinc-500">
                Loading your saved reports...
              </p>
            </div>
          ) : loadError ? (
            <div className="p-8 text-center">
              <AlertTriangle className="h-7 mb-3 mx-auto text-amber-400 w-7" />
              <p className="text-amber-300 text-sm">{loadError}</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-64 px-6 py-12 text-center">
              <div className="bg-emerald-500/[0.07] border border-emerald-500/20 flex h-14 items-center justify-center mb-4 rounded-2xl w-14">
                {search ? (
                  <Search className="h-6 text-emerald-400 w-6" />
                ) : (
                  <History className="h-6 text-emerald-400 w-6" />
                )}
              </div>

              <h3 className="font-bold text-base text-white">
                {search ? "No matching reports" : "Your archive is empty"}
              </h3>

              <p className="leading-relaxed max-w-sm mt-2 text-xs text-zinc-500">
                {search
                  ? "Try a different search term or clear your search."
                  : "Completed checks will automatically appear here. Run a transaction verification or token security check to get started."}
              </p>

              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="border border-emerald-500/25 font-bold hover:bg-emerald-500/10 mt-5 px-4 py-2 rounded-lg text-emerald-400 text-xs transition"
                >
                  Clear search
                </button>
              ) : (
                <Link
                  to="/"
                  className="bg-emerald-500 font-bold gap-2 hover:bg-emerald-400 inline-flex items-center mt-5 px-4 py-2.5 rounded-lg text-[#04100a] text-xs transition"
                >
                  Start a security check
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-white/[0.06] divide-y">
              {filteredReports.map((report) => {
                const status = getReportStatus(report);
                const appearance = getStatusAppearance(status);
                const isSelected = selected?.id === report.id;

                return (
                  <article
                    key={report.id}
                    className={`p-4 transition sm:px-5 ${
                      isSelected ? "bg-emerald-500/[0.045]" : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex flex-col gap-4 justify-between sm:flex-row sm:items-center">
                      <div className="flex gap-3 min-w-0">
                        <div className="bg-emerald-500/[0.07] border border-emerald-500/15 flex h-10 items-center justify-center rounded-xl shrink-0 w-10">
                          {report.mode === "token" ? (
                            <ShieldCheck className="h-5 text-emerald-400 w-5" />
                          ) : (
                            <FileSearch className="h-5 text-emerald-400 w-5" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-zinc-100 truncate">
                            {report.title || getModeLabel(report.mode)}
                          </h3>

                          <div className="flex flex-wrap gap-x-3 gap-y-1 items-center mt-1.5 text-[10px] text-zinc-500">
                            <span>{getModeLabel(report.mode)}</span>
                            <span className="text-zinc-700">•</span>
                            <span className="uppercase">
                              {report.network}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 items-center mt-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${appearance.style}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${appearance.dot}`} />
                              {appearance.label}
                            </span>

                            <span className="gap-1 inline-flex items-center text-[10px] text-zinc-600">
                              <Clock3 className="h-3 w-3" />
                              {formatDate(report.createdAt)}
                            </span>
                          </div>

                          {report.searchText && (
                            <p className="font-mono mt-2 text-[10px] text-zinc-600 truncate">
                              {report.searchText}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 items-center pl-[52px] shrink-0 sm:pl-0">
                        <button
                          type="button"
                          onClick={() =>
                            setSelected(isSelected ? null : report)
                          }
                          className="bg-emerald-500/[0.07] border border-emerald-500/25 font-bold gap-2 h-9 hover:bg-emerald-500/[0.15] inline-flex items-center px-3 rounded-lg text-[10px] text-emerald-300 transition"
                        >
                          {isSelected ? "Close report" : "View report"}
                          {isSelected ? (
                            <X className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError("");
                            setDeleteTarget(report);
                          }}
                          aria-label={`Delete ${report.title || "saved report"}`}
                          className="border border-white/[0.07] flex h-9 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300 items-center justify-center rounded-lg text-zinc-500 transition w-9"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="border-emerald-500/10 border-t mt-5 pt-5">
                        {report.mode === "link" ? (
                          <LinkHistoryResult response={report.response} />
                        ) : (
                          <CheckResult
                            response={report.response}
                            mode={report.mode}
                            language={language}
                          />
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

          {deleteTarget && (
  <div className="backdrop-blur-sm bg-black/75 fixed flex inset-0 items-center justify-center p-4 z-50">
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="bg-[#0b110e] border border-white/10 max-w-md p-6 rounded-2xl shadow-2xl w-full"
    >
      <div className="flex gap-4 items-start justify-between">
        <div className="bg-red-500/10 border border-red-500/20 flex h-11 items-center justify-center rounded-xl w-11">
          <Trash2 className="h-5 text-red-400 w-5" />
        </div>

        <button
          type="button"
          onClick={() => {
            setDeleteTarget(null);
            setDeleteError("");
          }}
          disabled={deleting}
          aria-label="Close confirmation"
          className="hover:bg-white/5 hover:text-white p-2 rounded-lg text-zinc-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <h2
        id="delete-dialog-title"
        className="font-bold mt-5 text-lg text-white"
      >
        Delete this report?
      </h2>

      <p className="break-words mt-2 text-sm text-zinc-400">
        {deleteTarget.title || getModeLabel(deleteTarget.mode)}
      </p>

      <p className="leading-5 mt-2 text-xs text-zinc-500">
        This report will be permanently removed from this device.
        This action cannot be undone.
      </p>

      {deleteError && (
        <p className="bg-red-500/[0.06] border border-red-500/20 mt-4 p-3 rounded-lg text-red-300 text-xs">
          {deleteError}
        </p>
      )}

      <div className="flex gap-3 justify-end mt-6">
        <button
          type="button"
          disabled={deleting}
          onClick={() => {
            setDeleteTarget(null);
            setDeleteError("");
          }}
          className="border border-white/10 disabled:opacity-50 font-semibold hover:bg-white/5 px-4 py-2.5 rounded-lg text-xs text-zinc-300"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={deleting}
          onClick={() => void handleDelete()}
          className="bg-red-500 disabled:opacity-50 font-bold gap-2 hover:bg-red-400 inline-flex items-center px-4 py-2.5 rounded-lg text-white text-xs"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {deleting ? "Deleting..." : "Delete report"}
        </button>
      </div>
    </div>
  </div>
)}
        <footer className="border-t border-white/[0.06] flex flex-col font-semibold gap-2 items-center justify-between mt-8 py-5 sm:flex-row text-[9px] text-zinc-600 tracking-[0.15em] uppercase">
          <span>SafeSign · Web3 Security Protocol</span>
          <span>Private local report storage</span>
        </footer>
      </div>
    </main>
  );
}
      
