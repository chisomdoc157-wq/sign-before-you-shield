
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

  const candidates = [
    response.status,
    result.status,
    result.matchStatus,
    data.status,
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
  if (
    ["MATCHED", "SUCCESS", "SUCCESSFUL", "TRUSTED", "CONFIRMED"].includes(
      status,
    )
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

function HistoryPage() {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [selected, setSelected] = useState<SavedReport | null>(null);
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

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

  async function handleDelete(report: SavedReport) {
    const confirmed = window.confirm(
      `Delete this saved report?\n\n${report.title || getModeLabel(report.mode)}\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await deleteReport(report.id);

      setReports((current) =>
        current.filter((item) => item.id !== report.id),
      );

      if (selected?.id === report.id) {
        setSelected(null);
      }
    } catch {
      window.alert("Could not delete this report. Please try again.");
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
    <main className="relative min-h-screen overflow-hidden bg-[#070b09] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(16,185,129,0.12),transparent_55%)]" />
      <div className="safesign-grid pointer-events-none fixed inset-0 opacity-20" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        {/* Top navigation */}
        <header className="mb-10 flex items-center justify-between gap-4 border-b border-white/[0.07] pb-5">
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 transition group-hover:bg-emerald-500/20">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>

            <div>
              <p className="text-sm font-black tracking-[0.17em] text-white">
                SAFESIGN
              </p>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Web3 security protocol
              </p>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs font-semibold text-zinc-300 transition hover:border-emerald-500/30 hover:text-emerald-300 sm:px-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to scanner</span>
          </Link>
        </header>

        {/* Page heading */}
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-px w-6 bg-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
              Local intelligence archive
            </span>
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Report <span className="text-emerald-400">history</span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
                Review your previous transaction checks, payment comparisons
                and token security reports.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Database className="h-4 w-4 text-emerald-500" />
              Stored locally on this device
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.10] to-transparent p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Total reports
              </span>
              <History className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-black tabular-nums text-white">
              {reports.length}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Transactions
              </span>
              <FileSearch className="h-4 w-4 text-zinc-400" />
            </div>
            <p className="text-3xl font-black tabular-nums text-white">
              {verificationCount}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Payment checks
              </span>
              <ShieldCheck className="h-4 w-4 text-zinc-400" />
            </div>
            <p className="text-3xl font-black tabular-nums text-white">
              {matchCount}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Token scans
              </span>
              <ShieldCheck className="h-4 w-4 text-zinc-400" />
            </div>
            <p className="text-3xl font-black tabular-nums text-white">
              {tokenCount}
            </p>
          </div>
        </section>

        {/* Search */}
        <section className="mb-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by transaction, network, token, or check type..."
              className="h-12 w-full rounded-xl border border-white/10 bg-[#0c120f] pl-11 pr-11 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </section>

        {/* Report list */}
        <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a100d]/90">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-white">
                Saved reports
              </h2>
              <p className="mt-1 text-[11px] text-zinc-500">
                {filteredReports.length}{" "}
                {filteredReports.length === 1 ? "record" : "records"} found
              </p>
            </div>

            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
              IndexedDB archive
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-400" />
              <p className="text-sm text-zinc-500">
                Loading your saved reports...
              </p>
            </div>
          ) : loadError ? (
            <div className="p-8 text-center">
              <AlertTriangle className="mx-auto mb-3 h-7 w-7 text-amber-400" />
              <p className="text-sm text-amber-300">{loadError}</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07]">
                {search ? (
                  <Search className="h-6 w-6 text-emerald-400" />
                ) : (
                  <History className="h-6 w-6 text-emerald-400" />
                )}
              </div>

              <h3 className="text-base font-bold text-white">
                {search ? "No matching reports" : "Your archive is empty"}
              </h3>

              <p className="mt-2 max-w-sm text-xs leading-relaxed text-zinc-500">
                {search
                  ? "Try a different search term or clear your search."
                  : "Completed checks will automatically appear here. Run a transaction verification or token security check to get started."}
              </p>

              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-5 rounded-lg border border-emerald-500/25 px-4 py-2 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/10"
                >
                  Clear search
                </button>
              ) : (
                <Link
                  to="/"
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-xs font-bold text-[#04100a] transition hover:bg-emerald-400"
                >
                  Start a security check
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
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
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div className="flex min-w-0 gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/[0.07]">
                          {report.mode === "token" ? (
                            <ShieldCheck className="h-5 w-5 text-emerald-400" />
                          ) : (
                            <FileSearch className="h-5 w-5 text-emerald-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-bold text-zinc-100">
                            {report.title || getModeLabel(report.mode)}
                          </h3>

                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-zinc-500">
                            <span>{getModeLabel(report.mode)}</span>
                            <span className="text-zinc-700">•</span>
                            <span className="uppercase">
                              {report.network}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${appearance.style}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${appearance.dot}`} />
                              {appearance.label}
                            </span>

                            <span className="inline-flex items-center gap-1 text-[10px] text-zinc-600">
                              <Clock3 className="h-3 w-3" />
                              {formatDate(report.createdAt)}
                            </span>
                          </div>

                          {report.searchText && (
                            <p className="mt-2 truncate font-mono text-[10px] text-zinc-600">
                              {report.searchText}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 pl-[52px] sm:pl-0">
                        <button
                          type="button"
                          onClick={() =>
                            setSelected(isSelected ? null : report)
                          }
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.07] px-3 text-[10px] font-bold text-emerald-300 transition hover:bg-emerald-500/[0.15]"
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
                          onClick={() => void handleDelete(report)}
                          aria-label={`Delete ${report.title || "saved report"}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] text-zinc-500 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-5 border-t border-emerald-500/10 pt-5">
                        <CheckResult
                          response={report.response}
                          mode={report.mode}
                          language={language}
                        />
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-white/[0.06] py-5 text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-600 sm:flex-row">
          <span>SafeSign · Web3 Security Protocol</span>
          <span>Private local report storage</span>
        </footer>
      </div>
    </main>
  );
}
      
