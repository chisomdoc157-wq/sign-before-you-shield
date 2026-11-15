import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Clock, Search, Trash2 } from "lucide-react";

import CheckResult from "@/components/safesign/CheckResult";
import {
  deleteReport,
  getReports,
  type SavedReport,
} from "@/lib/safesign-storage";
import type { Language } from "@/components/safesign/language";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "SafeSign — History" },
      { name: "description", content: "Your saved SafeSign reports." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {

    const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("safesign-language");

    if (savedLanguage) {
      setLanguage(savedLanguage as Language);
    }
  }, []);
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [selected, setSelected] = useState<SavedReport | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getReports()
      .then(setReports)
      .catch(() => setError("Could not load saved reports on this browser."))
      .finally(() => setLoading(false));
  }, []);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return reports;

    return reports.filter((report) =>
      [
        report.title,
        report.network,
        report.mode,
        report.searchText,
        report.createdAt,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [reports, search]);

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Delete this saved report from this browser?",
    );

    if (!confirmed) return;

    try {
      await deleteReport(id);
      setReports((current) => current.filter((item) => item.id !== id));

      if (selected?.id === id) {
        setSelected(null);
      }
    } catch {
      setError("Could not delete this report. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to SafeSign
        </Link>

        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            SafeSign
          </p>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            Your history
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Reports saved on this browser. No account required.
          </p>
        </div>

        <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-card px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search hash, address, network or check type..."
            className="h-12 w-full bg-transparent text-sm outline-none"
          />
        </div>

        {error && (
          <p className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {loading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Loading your saved reports...
          </p>
        ) : filteredReports.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <Clock className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <h2 className="font-semibold">
              {reports.length === 0
                ? "No saved reports yet"
                : "No matching reports"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {reports.length === 0
                ? "Your completed checks will appear here automatically."
                : "Try another transaction hash, address or network."}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredReports.map((report) => (
              <article
                key={report.id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <button
                  type="button"
                  onClick={() => setSelected(report)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="font-semibold">{report.title}</p>
                  <p className="mt-1 text-xs capitalize text-muted-foreground">
                    {report.network.replaceAll("_", " ")} · {report.mode}
                  </p>
                  <p className="mt-2 break-all font-mono text-xs text-muted-foreground">
                    {report.searchText}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(report.createdAt).toLocaleString()}
                  </p>
                </button>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelected(report)}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                  >
                    Open report
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete(report.id)}
                    aria-label="Delete saved report"
                    className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {selected && (
          <section className="mt-10 border-t border-border pt-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold">Saved report</h2>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Close report
              </button>
            </div>

            <CheckResult
             response={selected.response}
             mode={selected.mode}
             language={language}
            />
          </section>
        )}
      </div>
    </main>
  );
  }
