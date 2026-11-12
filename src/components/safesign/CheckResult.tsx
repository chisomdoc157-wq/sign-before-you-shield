import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  CircleAlert,
  Clock3,
  ExternalLink,
  Fuel,
  LoaderCircle,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CheckResult as CheckResultData } from "./api.js";
import type { TransactionReportData } from "./chain.js";
import type { Language } from "./language";

const resultCopy = {
  en: {
    safe: "Looks safe",
    risky: "Use caution",
    block: "High risk",
    score: "Risk score",
    scoreHelp: "Higher means more warning signs.",
    demo: "Mock screening",
    checkAnother: "Check another",
    reportTitle: "Transaction Verification Report",
    notFound: "This transaction isn’t on the selected network.",
    reportError: "Couldn’t load transaction details. Try another network or try again.",
    reportLoading: "Loading transaction details…",
    network: "Network",
    status: "Status",
    success: "Confirmed",
    failed: "Failed",
    pending: "Pending",
    from: "From",
    to: "To",
    contractCreation: "Contract creation",
    value: "Amount",
    gas: "Gas used",
    blockNumber: "Block",
    time: "Time",
    noTimestamp: "Not confirmed yet",
    chainData: "Transaction details come from the selected public blockchain network.",
  },
  pcm: {
    safe: "E look safe",
    risky: "Take am easy",
    block: "Risk dey high",
    score: "Risk score",
    scoreHelp: "Higher score mean say warning signs plenty.",
    demo: "Mock check",
    checkAnother: "Check another one",
    reportTitle: "Transaction Verification Report",
    notFound: "We no see this transaction for the network wey you choose.",
    reportError: "We no fit load transaction details. Try another network or try again.",
    reportLoading: "We dey load transaction details…",
    network: "Network",
    status: "Status",
    success: "Confirmed",
    failed: "Failed",
    pending: "Pending",
    from: "From",
    to: "To",
    contractCreation: "Contract creation",
    value: "Amount",
    gas: "Gas used",
    blockNumber: "Block",
    time: "Time",
    noTimestamp: "Dem never confirm am",
    chainData: "Transaction details come from the public blockchain network wey you choose.",
  },
} as const;

interface CheckResultCardProps {
  result: CheckResultData;
  language: Language;
  onCheckAnother: () => void;
}

export function CheckResultCard({ result, language, onCheckAnother }: CheckResultCardProps) {
  const copy = resultCopy[language];
  const tone = {
    safe: { icon: ShieldCheck, banner: "border-primary/40 bg-primary/10 text-primary", bar: "bg-primary" },
    risky: { icon: AlertTriangle, banner: "border-warning/40 bg-warning/10 text-warning", bar: "bg-warning" },
    block: { icon: CircleAlert, banner: "border-destructive/40 bg-destructive/10 text-destructive", bar: "bg-destructive" },
  }[result.verdict];
  const VerdictIcon = tone.icon;

  return (
    <section aria-labelledby="safesign-result-title" className="mt-6 space-y-5" aria-live="polite">
      <div className={`flex items-center gap-3 rounded-lg border px-4 py-4 sm:px-5 ${tone.banner}`}>
        <VerdictIcon aria-hidden="true" className="size-8 shrink-0" />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-semibold" id="safesign-result-title">
            {copy[result.verdict]}
          </h2>
          <p className="mt-1 text-xs font-medium opacity-80">{copy.demo}</p>
        </div>
        <span className="shrink-0 text-2xl font-semibold tabular-nums">{result.score}</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium">{copy.score}</span>
          <span className="text-muted-foreground">{copy.scoreHelp}</span>
        </div>
        <div
          aria-label={`${copy.score}: ${result.score}%`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={result.score}
          className="h-2.5 w-full overflow-hidden rounded-full bg-secondary"
          role="progressbar"
        >
          <div className={`h-full rounded-full transition-[width] ${tone.bar}`} style={{ width: `${result.score}%` }} />
        </div>
      </div>

      <ul className="space-y-3">
        {result.reasons.map((reason, index) => (
          <li className="flex items-start gap-3 text-sm leading-6 text-muted-foreground" key={`${reason}-${index}`}>
            <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${tone.banner}`}>
              {result.verdict === "safe" ? (
                <Check aria-hidden="true" className="size-3.5" />
              ) : result.verdict === "risky" ? (
                <AlertTriangle aria-hidden="true" className="size-3.5" />
              ) : (
                <X aria-hidden="true" className="size-3.5" />
              )}
            </span>
            {reason}
          </li>
        ))}
      </ul>

      <Button className="w-full" onClick={onCheckAnother} type="button" variant="outline">
        {copy.checkAnother}
      </Button>
    </section>
  );
}

interface TransactionReportProps {
  report: TransactionReportData | null;
  loading: boolean;
  error: boolean;
  language: Language;
}

function shortAddress(value: string) {
  return `${value.slice(0, 8)}…${value.slice(-6)}`;
}

function formatEther(valueWei: string) {
  const value = BigInt(valueWei);
  const whole = value / 10n ** 18n;
  const fraction = (value % 10n ** 18n).toString().padStart(18, "0").slice(0, 6).replace(/0+$/, "");
  return `${whole.toString()}${fraction ? `.${fraction}` : ""} ETH`;
}

export function TransactionReport({ report, loading, error, language }: TransactionReportProps) {
  const copy = resultCopy[language];

  if (!loading && !error && !report) return null;

  return (
    <section aria-labelledby="transaction-report-title" className="mt-6 border-t border-border pt-5">
      <h2 className="font-display text-lg font-semibold" id="transaction-report-title">{copy.reportTitle}</h2>
      {loading ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground" role="status">
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          {copy.reportLoading}
        </p>
      ) : error ? (
        <p className="mt-4 text-sm leading-6 text-destructive" role="alert">{copy.reportError}</p>
      ) : report && !report.found ? (
        <p className="mt-4 text-sm leading-6 text-muted-foreground" role="status">{copy.notFound}</p>
      ) : report?.found ? (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            <span className="font-medium">{copy.network}:</span>
            <span className="text-muted-foreground">{report.networkName}</span>
            <span className="text-border" aria-hidden="true">|</span>
            <span className="font-medium">{copy.status}:</span>
            <span className={`inline-flex items-center gap-1.5 font-semibold ${report.status === "success" ? "text-primary" : report.status === "failed" ? "text-destructive" : "text-warning"}`}>
              {report.status === "success" ? <Check aria-hidden="true" className="size-4" /> : report.status === "failed" ? <X aria-hidden="true" className="size-4" /> : <Clock3 aria-hidden="true" className="size-4" />}
              {copy[report.status]}
            </span>
          </div>
          <dl className="grid grid-cols-1 gap-3 border-y border-border py-4 text-sm sm:grid-cols-2">
            <div className="flex min-w-0 items-start gap-2">
              <ArrowUpRight aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0"><dt className="text-muted-foreground">{copy.from}</dt><dd className="break-all font-mono text-xs">{shortAddress(report.from)}</dd></div>
            </div>
            <div className="flex min-w-0 items-start gap-2">
              <ArrowDownLeft aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0"><dt className="text-muted-foreground">{copy.to}</dt><dd className="break-all font-mono text-xs">{report.to ? shortAddress(report.to) : copy.contractCreation}</dd></div>
            </div>
            <div className="flex min-w-0 items-start gap-2">
              <ExternalLink aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div><dt className="text-muted-foreground">{copy.value}</dt><dd>{formatEther(report.valueWei)}</dd></div>
            </div>
            <div className="flex min-w-0 items-start gap-2">
              <Fuel aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div><dt className="text-muted-foreground">{copy.gas}</dt><dd>{report.gasUsed ? BigInt(report.gasUsed).toLocaleString() : "—"}</dd></div>
            </div>
            <div className="flex min-w-0 items-start gap-2">
              <ExternalLink aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div><dt className="text-muted-foreground">{copy.blockNumber}</dt><dd>{report.blockNumber ? BigInt(report.blockNumber).toLocaleString() : "—"}</dd></div>
            </div>
            <div className="flex min-w-0 items-start gap-2">
              <Clock3 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div><dt className="text-muted-foreground">{copy.time}</dt><dd>{report.timestamp ? new Date(report.timestamp).toLocaleString() : copy.noTimestamp}</dd></div>
            </div>
          </dl>
          <p className="text-xs leading-5 text-muted-foreground">{copy.chainData}</p>
        </div>
      ) : null}
    </section>
  );
}