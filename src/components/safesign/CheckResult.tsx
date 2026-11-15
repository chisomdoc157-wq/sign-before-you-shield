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
        "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
      icon: CheckCircle2,
    };
  }

  if (badStatuses.includes(status)) {
    return {
      className:
        "border-destructive/30 bg-destructive/10 text-destructive",
      icon: XCircle,
    };
  }

  if (
    status === "PENDING" ||
    status === "CONFIRMING" ||
    status === "NO_RISK_FLAGS_RETURNED" ||
    status === "PARTIAL_DATA" ||
    status === "NO_DATA" ||
    status === "UNVERIFIABLE" ||
    status === "UNVERIFIED"
  ) {
    return {
      className:
        "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
      icon: AlertTriangle,
    };
  }

  return {
    className: "border-border bg-muted text-muted-foreground",
    icon: Clock3,
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
    <div className="divide-border divide-y">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="gap-1 grid grid-cols-1 py-3 sm:gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]"
        >
          <dt className="text-muted-foreground text-sm">
            {humanize(key)}
          </dt>
          <dd className="break-all font-medium text-sm">
            {displayValue(value)}
          </dd>
        </div>
      ))}
    </div>
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
    <section className="bg-background border border-border p-4 rounded-xl">
      <h4 className="font-semibold mb-3 text-sm">{title}</h4>

      {Array.isArray(data) ? (
        <div className="space-y-3">
          {data.map((item, index) => (
            <div
              key={index}
              className="bg-muted/50 p-3 rounded-lg"
            >
              <p className="font-semibold mb-2 text-muted-foreground text-xs">
                Item {index + 1}
              </p>

              {isObject(item) ? (
                <FieldList data={item} />
              ) : (
                <pre className="break-all overflow-x-auto text-xs whitespace-pre-wrap">
                  {displayValue(item)}
                </pre>
              )}
            </div>
          ))}
        </div>
      ) : isObject(data) ? (
        <FieldList data={data} />
      ) : (
        <pre className="break-all overflow-x-auto text-xs whitespace-pre-wrap">
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
    ...(
      Object.keys(resultObject).length > 0
        ? { matchResult: resultObject }
        : {}
    ),
  };

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(response, null, 2),
      );
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = JSON.stringify(response, null, 2);
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border overflow-hidden rounded-2xl shadow-sm">
        <div className="border-b border-border p-5 sm:p-6">
          <div className="flex gap-3 items-center justify-between mb-4">
            <div className="flex gap-2 items-center text-primary">
              {mode === "token" ? (
                <ShieldCheck className="h-5 w-5" />
              ) : (
                <FileSearch className="h-5 w-5" />
              )}
              <span className="font-semibold text-xs tracking-wider uppercase">
                SafeSign
              </span>
            </div>

            <span className="text-muted-foreground text-xs">
              {copy.result}
            </span>
          </div>

          <div
            className={`flex items-start gap-3 rounded-xl border p-4 ${statusStyle.className}`}
          >
            <StatusIcon className="h-5 mt-0.5 shrink-0 w-5" />

            <div className="min-w-0">
              <p className="font-medium opacity-80 text-xs">
                {copy.status}
              </p>
              <h3 className="break-words font-bold mt-1 text-lg">
                {getStatusLabel(status, copy)}
              </h3>

              {typeof response.message === "string" && (
                <p className="mt-1 opacity-90 text-sm">
                  {response.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {mode === "verify" && (
            <section>
              <h4 className="flex font-semibold gap-2 items-center mb-2 text-sm">
                <FileSearch className="h-4 text-primary w-4" />
                {copy.transaction}
              </h4>

              <FieldList
                data={report}
                omit={OMIT_KEYS}
              />
            </section>
          )}

          {mode === "match" && (
            <section>
              <h4 className="flex font-semibold gap-2 items-center mb-2 text-sm">
                <CheckCircle2 className="h-4 text-primary w-4" />
                {copy.payment}
              </h4>

              {comparison && (
                <FieldList data={comparison} />
              )}

              <FieldList
                data={reportForDisplay}
                omit={new Set([
                  ...OMIT_KEYS,
                  "comparison",
                ])}
              />

              {Object.keys(resultObject).length > 0 && (
                <DataSection
                  title="Payment match result"
                  data={resultObject}
                />
              )}
            </section>
          )}

          {mode === "token" && (
            <section>
              <h4 className="flex font-semibold gap-2 items-center mb-2 text-sm">
                <ShieldAlert className="h-4 text-primary w-4" />
                {copy.token}
              </h4>

              {token && <FieldList data={token} />}

              <FieldList
                data={report}
                omit={new Set([
                  ...OMIT_KEYS,
                  "token",
                  "riskFlags",
                  "securityData",
                ])}
              />

              <DataSection
                title="Risk flags"
                data={riskFlags}
              />

              <DataSection
                title="Security data"
                data={securityData}
              />

              {!riskFlags &&
                !securityData &&
                status === "NO_RISK_FLAGS_RETURNED" && (
                  <p className="bg-amber-500/10 border border-amber-500/30 dark:text-amber-300 p-3 rounded-lg text-amber-800 text-sm">
                    No risk flags were returned by the security provider.
                    This does not prove that the token is safe.
                  </p>
                )}
            </section>
          )}

          <details className="bg-background border border-border p-4 rounded-xl">
            <summary className="cursor-pointer font-semibold text-sm">
              {copy.details}
            </summary>

            <div className="mt-3">
              <FieldList
                data={report}
                omit={new Set([
                  ...OMIT_KEYS,
                  "riskFlags",
                  "securityData",
                ])}
              />
            </div>
          </details>

          <details className="bg-background border border-border p-4 rounded-xl">
            <summary className="cursor-pointer font-semibold text-sm">
              {copy.rawResponse}
            </summary>

            <pre className="bg-muted break-all leading-5 max-h-96 mt-3 overflow-auto p-3 rounded-lg text-xs whitespace-pre-wrap">
              {JSON.stringify(response, null, 2)}
            </pre>
          </details>

          <div className="border-border border-t flex flex-wrap gap-2 pt-4">
            <button
              type="button"
              onClick={copyReport}
              className="border border-border font-medium gap-2 h-10 hover:bg-muted inline-flex items-center px-4 rounded-lg text-sm transition"
            >
              <Copy className="h-4 w-4" />
              {copy.copy}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="border border-border font-medium gap-2 h-10 hover:bg-muted inline-flex items-center px-4 rounded-lg text-sm transition"
            >
              <Printer className="h-4 w-4" />
              {copy.print}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}