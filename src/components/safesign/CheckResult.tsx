
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Copy,
  FileSearch,
  Printer,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import type { Language } from "./language";

type CheckMode = "verify" | "match" | "token";

interface CheckResultProps {
  response: Record<string, unknown>;
  mode: CheckMode;
  language: Language;
}

const resultCopy: Record<
  "en" | "pcm",
  {
    result: string;
    status: string;
    transaction: string;
    token: string;
    payment: string;
    details: string;
    rawResponse: string;
    copy: string;
    copied: string;
    print: string;
    matched: string;
    mismatched: string;
    pending: string;
    confirming: string;
    notFound: string;
    unverifiable: string;
    trusted: string;
    unverified: string;
    riskDetected: string;
    noRiskFlags: string;
    partialData: string;
    noData: string;
    success: string;
    failed: string;
    unknown: string;
    yes: string;
    no: string;
  }
> = {
  en: {
    result: "Check result",
    status: "Status",
    transaction: "Transaction details",
    token: "Token security details",
    payment: "Payment comparison",
    details: "Report details",
    rawResponse: "Full API response",
    copy: "Copy report",
    copied: "Copied",
    print: "Print report",
    matched: "Payment matched",
    mismatched: "Payment mismatched",
    pending: "Pending",
    confirming: "Confirming",
    notFound: "Not found",
    unverifiable: "Unverifiable",
    trusted: "Trusted",
    unverified: "Unverified",
    riskDetected: "Risk detected",
    noRiskFlags: "No risk flags returned",
    partialData: "Partial data",
    noData: "No data available",
    success: "Successful",
    failed: "Failed",
    unknown: "Unknown",
    yes: "Yes",
    no: "No",
  },
  pcm: {
    result: "Check result",
    status: "Status",
    transaction: "Transaction details",
    token: "Token security details",
    payment: "Payment comparison",
    details: "Report details",
    rawResponse: "Full API response",
    copy: "Copy report",
    copied: "Don copy",
    print: "Print report",
    matched: "Payment match",
    mismatched: "Payment no match",
    pending: "Pending",
    confirming: "Dey confirm",
    notFound: "No find am",
    unverifiable: "No fit verify",
    trusted: "Trusted",
    unverified: "Never verify",
    riskDetected: "Risk dey",
    noRiskFlags: "No risk flags return",
    partialData: "Partial data",
    noData: "No data",
    success: "Successful",
    failed: "Failed",
    unknown: "Unknown",
    yes: "Yes",
    no: "No",
  },
};

function isObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function humanize(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function getStatus(response: Record<string, unknown>) {
  const report = isObject(response.report) ? response.report : {};
  const result = isObject(response.result) ? response.result : {};

  const candidates = [
    response.result,
    response.status,
    result.status,
    result.matchStatus,
    report.status,
    report.trustStatus,
    report.transactionStatus,
    report.executionStatus,
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

function getStatusLabel(status: string, copy: (typeof resultCopy)["en"]) {
  const labels: Record<string, string> = {
    MATCHED: copy.matched,
    MISMATCHED: copy.mismatched,
    PENDING: copy.pending,
    CONFIRMING: copy.confirming,
    NOT_FOUND: copy.notFound,
    UNVERIFIABLE: copy.unverifiable,
    TRUSTED: copy.trusted,
    UNVERIFIED: copy.unverified,
    RISK_DETECTED: copy.riskDetected,
    HIGH_RISK: copy.riskDetected,
    NO_RISK_FLAGS_RETURNED: copy.noRiskFlags,
    PARTIAL_DATA: copy.partialData,
    NO_DATA: copy.noData,
    SUCCESS: copy.success,
    SUCCESSFUL: copy.success,
    FAILED: copy.failed,
    UNKNOWN: copy.unknown,
  };

  return labels[status] || humanize(status);
}

function getStatusStyle(status: string) {
  const goodStatuses = [
    "MATCHED",
    "SUCCESS",
    "SUCCESSFUL",
    "TRUSTED",
    "CONFIRMED",
  ];

  const badStatuses = [
    "MISMATCHED",
    "FAILED",
    "RISK_DETECTED",
    "HIGH_RISK",
    "UNTRUSTED",
  ];

  if (goodStatuses.includes(status)) {
    return {
      className:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
      icon: CheckCircle2,
      indicator: "bg-emerald-400",
    };
  }

  if (badStatuses.includes(status)) {
    return {
      className:
        "border-red-500/30 bg-red-500/10 text-red-300",
      icon: XCircle,
      indicator: "bg-red-400",
    };
  }

  if (
    status === "PENDING" ||
    status === "CONFIRMING" ||
    status === "NO_RISK_FLAGS_RETURNED" ||
    status === "PARTIAL_DATA" ||
    status === "NO_DATA" ||
    status === "UNVERIFIABLE" ||
    status === "UNVERIFIED" ||
    status === "NOT_FOUND"
  ) {
    return {
      className:
        "border-amber-500/30 bg-amber-500/10 text-amber-300",
      icon: AlertTriangle,
      indicator: "bg-amber-400",
    };
  }

  return {
    className:
      "border-white/10 bg-white/5 text-zinc-300",
    icon: Clock3,
    indicator: "bg-zinc-400",
  };
}

const OMIT_KEYS = new Set([
  "success",
  "message",
  "report",
  "result",
  "comparison",
  "token",
  "riskFlags",
  "securityData",
  "transfers",
  "logs",
  "raw",
]);

function FieldList({
  data,
  omit = new Set<string>(),
}: {
  data: Record<string, unknown>;
  omit?: Set<string>;
}) {
  const entries = Object.entries(data).filter(
    ([key, value]) =>
      !omit.has(key) &&
      value !== undefined &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value !== "object",
  );

  if (entries.length === 0) return null;

  return (
    <dl className="divide-y divide-white/[0.06]">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] sm:gap-4"
        >
          <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            {humanize(key)}
          </dt>
          <dd className="break-all text-sm font-medium text-zinc-200">
            {displayValue(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function DataSection({
  title,
  data,
}: {
  title: string;
  data: unknown;
}) {
  if (
    data === undefined ||
    data === null ||
    (Array.isArray(data) && data.length === 0)
  ) {
    return null;
  }

  return (
    <section className="rounded-xl border border-white/[0.07] bg-[#080d0b] p-4">
      <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        {title}
      </h4>

      {Array.isArray(data) ? (
        <div className="space-y-3">
          {data.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"
            >
              <p className="mb-2 text-xs font-semibold text-zinc-500">
                Item {index + 1}
              </p>

              {isObject(item) ? (
                <FieldList data={item} />
              ) : (
                <pre className="overflow-x-auto whitespace-pre-wrap break-all text-xs text-zinc-300">
                  {displayValue(item)}
                </pre>
              )}
            </div>
          ))}
        </div>
      ) : isObject(data) ? (
        <FieldList data={data} />
      ) : (
        <pre className="overflow-x-auto whitespace-pre-wrap break-all text-xs text-zinc-300">
          {displayValue(data)}
        </pre>
      )}
    </section>
  );
}

export default function CheckResult({
  response,
  mode,
  language,
}: CheckResultProps) {
  const copy = resultCopy[language === "pcm" ? "pcm" : "en"];

  const report = isObject(response.report) ? response.report : {};
  const resultObject = isObject(response.result)
    ? response.result
    : {};

  const comparison = isObject(response.comparison)
    ? response.comparison
    : isObject(report.comparison)
      ? report.comparison
      : isObject(resultObject.comparison)
        ? resultObject.comparison
        : null;

  const token = isObject(report.token) ? report.token : null;

  const riskFlags =
    report.riskFlags ??
    response.riskFlags ??
    (token ? token.riskFlags : undefined);

  const securityData =
    report.securityData ??
    response.securityData ??
    (token ? token.securityData : undefined);

  const status = getStatus(response);
  const statusStyle = getStatusStyle(status);
  const StatusIcon = statusStyle.icon;

  const reportForDisplay = {
    ...report,
    ...(Object.keys(resultObject).length > 0
      ? { matchResult: resultObject }
      : {}),
  };

  function formatReportValue(value: unknown, label = ""): string[] {
    if (value === null || value === undefined || value === "") {
      return [];
    }

    if (Array.isArray(value)) {
      return value.flatMap((item, index) =>
        formatReportValue(item, `${label} ${index + 1}`.trim()),
      );
    }

    if (isObject(value)) {
      return Object.entries(value).flatMap(([key, item]) => {
        if (OMIT_KEYS.has(key)) return [];
        return formatReportValue(item, humanize(key));
      });
    }

    return [`${label ? `${label}: ` : ""}${displayValue(value)}`];
  }

  async function copyReport() {
    const lines = [
      "SAFESIGN — VERIFICATION REPORT",
      `Check type: ${humanize(mode)}`,
      `Status: ${getStatusLabel(status, copy)}`,
      "",
      ...formatReportValue(reportForDisplay),
      ...(comparison
        ? ["", "PAYMENT COMPARISON", ...formatReportValue(comparison)]
        : []),
      ...(riskFlags
        ? ["", "RISK FLAGS", ...formatReportValue(riskFlags)]
        : []),
      ...(securityData
        ? ["", "SECURITY DETAILS", ...formatReportValue(securityData)]
        : []),
      "",
      "Generated by SafeSign",
    ];

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = lines.join("\n");
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  }

  const modeLabel = {
    verify: "TRANSACTION VERIFICATION",
    match: "PAYMENT AUTHENTICATION",
    token: "TOKEN SECURITY ANALYSIS",
  }[mode];

  return (
    <div className="space-y-4">
      <div className="safesign-report-print overflow-hidden rounded-2xl border border-emerald-500/15 bg-[#090e0c] shadow-[0_20px_80px_rgba(0,0,0,0.3)]">

        {/* Report header */}
        <div className="relative overflow-hidden border-b border-white/[0.07] p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-500/[0.07] blur-3xl" />

          <div className="relative">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/25 bg-emerald-500/10">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                </div>

                <div>
                  <p className="text-sm font-black tracking-[0.16em] text-white">
                    SAFESIGN
                  </p>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Security intelligence
                  </p>
                </div>
              </div>

              <div className="rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1.5">
                <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-400">
                  {copy.result}
                </span>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <span className="h-px w-6 bg-emerald-500/60" />
              <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-zinc-500">
                {modeLabel}
              </span>
            </div>

            {/* Status */}
            <div
              className={`flex items-start gap-4 rounded-xl border p-4 sm:p-5 ${statusStyle.className}`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-current/20 bg-black/20">
                <StatusIcon className="h-6 w-6" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.indicator}`} />
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-75">
                    {copy.status}
                  </p>
                </div>

                <h3 className="break-words text-xl font-black tracking-tight sm:text-2xl">
                  {getStatusLabel(status, copy)}
                </h3>

                {typeof response.message === "string" && (
                  <p className="mt-2 text-sm leading-relaxed opacity-80">
                    {response.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Report content */}
        <div className="space-y-6 p-5 sm:p-6">

          {mode === "verify" && (
            <section>
              <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-emerald-400">
                <FileSearch className="h-4 w-4" />
                {copy.transaction}
              </h4>

              <div className="rounded-xl border border-white/[0.07] bg-[#080d0b] px-4">
                <FieldList data={report} omit={OMIT_KEYS} />
              </div>
            </section>
          )}

          {mode === "match" && (
            <section className="space-y-4">
              <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                {copy.payment}
              </h4>

              {comparison && (
                <div className="rounded-xl border border-white/[0.07] bg-[#080d0b] px-4">
                  <FieldList data={comparison} />
                </div>
              )}

              <div className="rounded-xl border border-white/[0.07] bg-[#080d0b] px-4">
                <FieldList
                  data={reportForDisplay}
                  omit={new Set([...OMIT_KEYS, "comparison"])}
                />
              </div>

              {Object.keys(resultObject).length > 0 && (
                <DataSection
                  title="Payment match result"
                  data={resultObject}
                />
              )}
            </section>
          )}

          {mode === "token" && (
            <section className="space-y-4">
              <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-emerald-400">
                <ShieldAlert className="h-4 w-4" />
                {copy.token}
              </h4>

              {token && (
                <div className="rounded-xl border border-white/[0.07] bg-[#080d0b] px-4">
                  <FieldList data={token} />
                </div>
              )}

              <div className="rounded-xl border border-white/[0.07] bg-[#080d0b] px-4">
                <FieldList
                  data={report}
                  omit={
                    new Set([
                      ...OMIT_KEYS,
                      "token",
                      "riskFlags",
                      "securityData",
                    ])
                  }
                />
              </div>

              <DataSection title="Risk flags" data={riskFlags} />

              <DataSection title="Security data" data={securityData} />

              {status === "NO_RISK_FLAGS_RETURNED" && (
                <div className="flex gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] p-4 text-amber-300">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold">
                      No risk flags returned
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-amber-200/75">
                      No risk flags were returned by the security provider.
                      This does not prove that the token is safe or authentic.
                      Always review the available security indicators.
                    </p>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Additional report details */}
          <details className="group overflow-hidden rounded-xl border border-white/[0.07] bg-[#080d0b]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300">
                <FileSearch className="h-4 w-4 text-emerald-400" />
                {copy.details}
              </span>

              <span className="text-xs text-zinc-500 transition-transform group-open:rotate-180">
                ↓
              </span>
            </summary>

            <div className="border-t border-white/[0.06] px-4">
              <FieldList
                data={report}
                omit={
                  new Set([
                    ...OMIT_KEYS,
                    "riskFlags",
                    "securityData",
                  ])
                }
              />
            </div>
          </details>

          {/* Report actions */}
          <div className="flex flex-wrap gap-2 border-t border-white/[0.07] pt-5">
            <button
              type="button"
              onClick={copyReport}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.08] px-4 text-xs font-bold text-emerald-300 transition hover:border-emerald-400/50 hover:bg-emerald-500/[0.15]"
            >
              <Copy className="h-4 w-4" />
              {copy.copy}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 text-xs font-bold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.07]"
            >
              <Printer className="h-4 w-4" />
              {copy.print}
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
            <span>SafeSign Security Protocol</span>
            <span>Verification report</span>
          </div>
        </div>
      </div>
    </div>
  );
}
