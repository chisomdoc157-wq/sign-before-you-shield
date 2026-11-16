
import { useState } from "react";

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
    nativeTransfers: string;
    tokenTransfers: string;
    nativeTransfer: string;
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
    nativeTransfers: "Native currency transfers",
    tokenTransfers: "Token transfers",
    nativeTransfer: "Top-level native transfer",
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
    nativeTransfers: "Native currency transfers",
    tokenTransfers: "Token transfers",
    nativeTransfer: "Main native transfer",
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

  const result = isObject(response.result)
    ? response.result
    : {};

  const candidates = [
    response.result,
    response.status,
    response.matchStatus,
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

function getStatusLabel(
  status: string,
  copy: (typeof resultCopy)["en"],
) {
  const labels: Record<string, string> = {
    MATCHED: copy.matched,
    MISMATCHED: copy.mismatched,
    PENDING: copy.pending,
    PENDING_RECEIPT: copy.pending,
    CONFIRMING: copy.confirming,
    NOT_FOUND: copy.notFound,
    UNVERIFIABLE: copy.unverifiable,
    TRUSTED: copy.trusted,
    VERIFIED: copy.trusted,
    UNVERIFIED: copy.unverified,
    FAKE: copy.riskDetected,
    UNTRUSTED: copy.riskDetected,
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
    "VERIFIED",
    "CONFIRMED",
  ];

  const badStatuses = [
    "MISMATCHED",
    "FAILED",
    "RISK_DETECTED",
    "HIGH_RISK",
    "UNTRUSTED",
    "FAKE",
    "REJECTED",
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
    [
      "PENDING",
      "PENDING_RECEIPT",
      "CONFIRMING",
      "NO_RISK_FLAGS_RETURNED",
      "PARTIAL_DATA",
      "NO_DATA",
      "UNVERIFIABLE",
      "UNVERIFIED",
      "NOT_FOUND",
      "NOT_SUPPORTED",
      "UNAVAILABLE",
    ].includes(status)
  ) {
    return {
      className:
        "border-amber-500/30 bg-amber-500/10 text-amber-300",
      icon: AlertTriangle,
      indicator: "bg-amber-400",
    };
  }

  return {
    className: "border-white/10 bg-white/5 text-zinc-300",
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
    <dl className="divide-white/[0.06] divide-y">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="gap-1 grid grid-cols-1 py-3 sm:gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]"
        >
          <dt className="font-medium text-xs text-zinc-500 tracking-wider uppercase">
            {humanize(key)}
          </dt>

          <dd className="break-all font-medium text-sm text-zinc-200">
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
    <section className="bg-[#080d0b] border border-white/[0.07] p-4 rounded-xl">
      <h4 className="flex font-bold gap-2 items-center mb-3 text-emerald-400 text-xs tracking-wider uppercase">
        <span className="bg-emerald-400 h-1.5 rounded-full w-1.5" />
        {title}
      </h4>

      {Array.isArray(data) ? (
        <div className="space-y-3">
          {data.map((item, index) => (
            <div
              key={index}
              className="bg-white/[0.02] border border-white/[0.06] p-3 rounded-lg"
            >
              <p className="font-semibold mb-2 text-xs text-zinc-500">
                Item {index + 1}
              </p>

              {isObject(item) ? (
                <FieldList data={item} />
              ) : (
                <pre className="break-all overflow-x-auto text-xs text-zinc-300 whitespace-pre-wrap">
                  {displayValue(item)}
                </pre>
              )}
            </div>
          ))}
        </div>
      ) : isObject(data) ? (
        <FieldList data={data} />
      ) : (
        <pre className="break-all overflow-x-auto text-xs text-zinc-300 whitespace-pre-wrap">
          {displayValue(data)}
        </pre>
      )}
    </section>
  );
}

function TransactionTransferSections({
  report,
  copy,
}: {
  report: Record<string, unknown>;
  copy: (typeof resultCopy)["en"];
}) {
  return (
    <>
      <DataSection
        title={copy.nativeTransfer}
        data={report.nativeTransfer}
      />

      <DataSection
        title={copy.nativeTransfers}
        data={report.nativeTransfers}
      />

      <DataSection
        title={copy.tokenTransfers}
        data={report.tokenTransfers}
      />
    </>
  );
}

export default function CheckResult({
  response,
  mode,
  language,
}: CheckResultProps) {
  const copy = resultCopy[language === "pcm" ? "pcm" : "en"];

  const [hasCopied, setHasCopied] = useState(false);

  const report = isObject(response.report)
    ? response.report
    : {};

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

  const token = isObject(report.token)
    ? report.token
    : null;

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

  async function copyReport() {
    const reportText = [
      "SAFESIGN — SECURITY REPORT",
      `Check type: ${humanize(mode)}`,
      `Status: ${getStatusLabel(status, copy)}`,
      "",
      "FULL API RESPONSE",
      JSON.stringify(response, null, 2),
      "",
      "Generated by SafeSign",
    ].join("\n");

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(reportText);
      } else {
        throw new Error("Clipboard API unavailable");
      }

      setHasCopied(true);
      window.setTimeout(() => setHasCopied(false), 2000);
    } catch {
      try {
        const textarea = document.createElement("textarea");

        textarea.value = reportText;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);
        textarea.select();

        const successful = document.execCommand("copy");

        document.body.removeChild(textarea);

        if (!successful) {
          throw new Error("Copy operation failed");
        }

        setHasCopied(true);
        window.setTimeout(() => setHasCopied(false), 2000);
      } catch {
        window.alert("Unable to copy the report. Please try again.");
      }
    }
  }

  const modeLabel = {
    verify: "TRANSACTION VERIFICATION",
    match: "PAYMENT AUTHENTICATION",
    token: "TOKEN SECURITY ANALYSIS",
  }[mode];

  return (
    <div className="space-y-4">
      <div className="bg-[#090e0c] border border-emerald-500/15 overflow-hidden rounded-2xl safesign-report-print shadow-[0_20px_80px_rgba(0,0,0,0.3)]">

        {/* Report header */}
        <div className="border-b border-white/[0.07] overflow-hidden p-5 relative sm:p-6">
          <div className="-right-20 -top-24 absolute bg-emerald-500/[0.07] blur-3xl h-64 pointer-events-none rounded-full w-64" />

          <div className="relative">
            <div className="flex gap-3 items-center justify-between mb-6">
              <div className="flex gap-2.5 items-center">
                <div className="bg-emerald-500/10 border border-emerald-500/25 flex h-9 items-center justify-center rounded-lg w-9">
                  <ShieldCheck className="h-5 text-emerald-400 w-5" />
                </div>

                <div>
                  <p className="font-black text-sm text-white tracking-[0.16em]">
                    SAFESIGN
                  </p>

                  <p className="font-semibold text-[9px] text-zinc-500 tracking-[0.2em] uppercase">
                    Security intelligence
                  </p>
                </div>
              </div>

              <div className="bg-emerald-500/[0.06] border border-emerald-500/20 px-3 py-1.5 rounded-full">
                <span className="font-bold text-[9px] text-emerald-400 tracking-[0.14em] uppercase">
                  {copy.result}
                </span>
              </div>
            </div>

            <div className="flex gap-2 items-center mb-4">
              <span className="bg-emerald-500/60 h-px w-6" />

              <span className="font-bold text-[10px] text-zinc-500 tracking-[0.17em] uppercase">
                {modeLabel}
              </span>
            </div>

            {/* Status */}
            <div
              className={`flex items-start gap-4 rounded-xl border p-4 sm:p-5 ${statusStyle.className}`}
            >
              <div className="bg-black/20 border border-current/20 flex h-11 items-center justify-center rounded-xl shrink-0 w-11">
                <StatusIcon className="h-6 w-6" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex gap-2 items-center mb-1">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${statusStyle.indicator}`}
                  />

                  <p className="font-bold opacity-75 text-[10px] tracking-[0.15em] uppercase">
                    {copy.status}
                  </p>
                </div>

                <h3 className="break-words font-black sm:text-2xl text-xl tracking-tight">
                  {getStatusLabel(status, copy)}
                </h3>

                {typeof response.message === "string" && (
                  <p className="leading-relaxed mt-2 opacity-80 text-sm">
                    {response.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Report content */}
        <div className="p-5 sm:p-6 space-y-6">

          {/* Transaction verification */}
          {mode === "verify" && (
            <section className="space-y-4">
              <h4 className="flex font-bold gap-2 items-center mb-3 text-emerald-400 text-xs tracking-[0.12em] uppercase">
                <FileSearch className="h-4 w-4" />
                {copy.transaction}
              </h4>

              <div className="bg-[#080d0b] border border-white/[0.07] px-4 rounded-xl">
                <FieldList
                  data={report}
                  omit={OMIT_KEYS}
                />
              </div>

              <TransactionTransferSections
                report={report}
                copy={copy}
              />
            </section>
          )}

          {/* Payment matching */}
          {mode === "match" && (
            <section className="space-y-4">
              <h4 className="flex font-bold gap-2 items-center mb-3 text-emerald-400 text-xs tracking-[0.12em] uppercase">
                <CheckCircle2 className="h-4 w-4" />
                {copy.payment}
              </h4>

              {comparison && (
                <div className="bg-[#080d0b] border border-white/[0.07] px-4 rounded-xl">
                  <FieldList data={comparison} />
                </div>
              )}

              <div className="bg-[#080d0b] border border-white/[0.07] px-4 rounded-xl">
                <FieldList
                  data={reportForDisplay}
                  omit={
                    new Set([
                      ...OMIT_KEYS,
                      "comparison",
                    ])
                  }
                />
              </div>

              {Object.keys(resultObject).length > 0 && (
                <DataSection
                  title="Payment match result"
                  data={resultObject}
                />
              )}

              <TransactionTransferSections
                report={report}
                copy={copy}
              />

              {typeof response.assetAuthenticity === "string" && (
                <div className="bg-amber-500/[0.06] border border-amber-500/25 p-4 rounded-xl">
                  <p className="font-bold text-amber-400 text-xs tracking-wider uppercase">
                    Asset authenticity
                  </p>

                  <p className="font-semibold mt-2 text-amber-200 text-sm">
                    {humanize(response.assetAuthenticity)}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Token security */}
          {mode === "token" && (
            <section className="space-y-4">
              <h4 className="flex font-bold gap-2 items-center mb-3 text-emerald-400 text-xs tracking-[0.12em] uppercase">
                <ShieldAlert className="h-4 w-4" />
                {copy.token}
              </h4>

              {token && (
                <div className="bg-[#080d0b] border border-white/[0.07] px-4 rounded-xl">
                  <FieldList data={token} />
                </div>
              )}

              <div className="bg-[#080d0b] border border-white/[0.07] px-4 rounded-xl">
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

              <DataSection
                title="Risk flags"
                data={riskFlags}
              />

              <DataSection
                title="Security data"
                data={securityData}
              />

              {status === "NO_RISK_FLAGS_RETURNED" && (
                <div className="bg-amber-500/[0.07] border border-amber-500/25 flex gap-3 p-4 rounded-xl text-amber-300">
                  <AlertTriangle className="h-5 mt-0.5 shrink-0 w-5" />

                  <div>
                    <p className="font-bold text-sm">
                      No risk flags returned
                    </p>

                    <p className="leading-relaxed mt-1 text-amber-200/75 text-xs">
                      No risk flags were returned by the security
                      provider. This does not prove that the token
                      is safe or authentic. Always review the
                      available security indicators.
                    </p>
                  </div>
                </div>
              )}

              {status === "NO_DATA" && (
                <div className="bg-amber-500/[0.07] border border-amber-500/25 flex gap-3 p-4 rounded-xl text-amber-300">
                  <AlertTriangle className="h-5 mt-0.5 shrink-0 w-5" />

                  <div>
                    <p className="font-bold text-sm">
                      Security information unavailable
                    </p>

                    <p className="leading-relaxed mt-1 text-amber-200/75 text-xs">
                      The security provider returned no security
                      record for this contract. The absence of
                      information must not be interpreted as proof
                      of safety.
                    </p>
                  </div>
                </div>
              )}

              {status === "PARTIAL_DATA" && (
                <div className="bg-amber-500/[0.07] border border-amber-500/25 flex gap-3 p-4 rounded-xl text-amber-300">
                  <AlertTriangle className="h-5 mt-0.5 shrink-0 w-5" />

                  <div>
                    <p className="font-bold text-sm">
                      Partial security information
                    </p>

                    <p className="leading-relaxed mt-1 text-amber-200/75 text-xs">
                      The security provider returned incomplete
                      information. Some risks may not have been
                      evaluated.
                    </p>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Full API response */}
          <details className="bg-[#080d0b] border border-white/[0.07] group overflow-hidden rounded-xl">
            <summary className="cursor-pointer flex gap-3 items-center justify-between list-none p-4">
              <span className="flex font-bold gap-2 items-center text-xs text-zinc-300 tracking-wider uppercase">
                <FileSearch className="h-4 text-emerald-400 w-4" />
                {copy.details}
              </span>

              <span className="group-open:rotate-180 text-xs text-zinc-500 transition-transform">
                ↓
              </span>
            </summary>

            <div className="border-t border-white/[0.06] p-4">
              <p className="font-bold mb-3 text-[10px] text-emerald-400 tracking-wider uppercase">
                {copy.rawResponse}
              </p>

              <pre className="bg-black/30 break-all font-mono leading-relaxed max-h-[500px] overflow-auto p-3 rounded-lg text-[10px] text-zinc-300 whitespace-pre-wrap">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          </details>

          {/* Report actions */}
          <div className="border-t border-white/[0.07] flex flex-wrap gap-2 pt-5">
            <button
              type="button"
              onClick={() => void copyReport()}
              className="bg-emerald-500/[0.08] border border-emerald-500/25 font-bold gap-2 h-10 hover:bg-emerald-500/[0.15] hover:border-emerald-400/50 inline-flex items-center px-4 rounded-lg text-emerald-300 text-xs transition"
            >
              <Copy className="h-4 w-4" />
              {hasCopied ? copy.copied : copy.copy}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="bg-white/[0.03] border border-white/10 font-bold gap-2 h-10 hover:bg-white/[0.07] hover:border-white/20 inline-flex items-center px-4 rounded-lg text-xs text-zinc-300 transition"
            >
              <Printer className="h-4 w-4" />
              {copy.print}
            </button>
          </div>

          <div className="flex font-semibold gap-3 items-center justify-between text-[9px] text-zinc-600 tracking-[0.14em] uppercase">
            <span>SafeSign Security Protocol</span>
            <span>Verification report</span>
          </div>
        </div>
      </div>
    </div>
  );
}
