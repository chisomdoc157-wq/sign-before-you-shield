
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

interface Props {
  response: Record<string, unknown>;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function humanize(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function JsonValue({
  value,
  depth = 0,
}: {
  value: unknown;
  depth?: number;
}) {
  if (value === null || value === undefined) {
    return <span className="text-zinc-500">Not available</span>;
  }

  if (typeof value === "boolean") {
    return (
      <span className={value ? "text-emerald-300" : "text-zinc-300"}>
        {value ? "Yes" : "No"}
      </span>
    );
  }

  if (typeof value !== "object") {
    return (
      <span className="break-all text-zinc-200">
        {String(value)}
      </span>
    );
  }

  if (Array.isArray(value)) {
    if (!value.length) {
      return <span className="text-zinc-500">No items</span>;
    }

    return (
      <div className="space-y-2">
        {value.map((item, index) => (
          <div
            key={index}
            className="bg-black/20 border border-white/[0.06] p-3 rounded-lg"
          >
            <p className="font-semibold mb-2 text-[10px] text-zinc-500 uppercase">
              Item {index + 1}
            </p>
            <JsonValue value={item} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }

  const entries = Object.entries(value as Record<string, unknown>);

  if (!entries.length) {
    return <span className="text-zinc-500">No details returned</span>;
  }

  return (
    <div className="divide-white/[0.06] divide-y">
      {entries.map(([key, child]) => {
        const nested =
          child !== null && typeof child === "object";

        return (
          <div key={key} className="py-3">
            {nested ? (
              <details open={depth < 1}>
                <summary className="cursor-pointer font-semibold text-emerald-300 text-xs">
                  {humanize(key)}
                </summary>
                <div className="border-l border-white/10 mt-2 pl-3">
                  <JsonValue value={child} depth={depth + 1} />
                </div>
              </details>
            ) : (
              <div className="gap-2 grid grid-cols-1 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                <p className="font-medium text-[10px] text-zinc-500 tracking-wider uppercase">
                  {humanize(key)}
                </p>
                <div className="text-xs">
                  <JsonValue value={child} depth={depth + 1} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SignGuardHistoryResult({ response }: Props) {
  const report = isObject(response.report) ? response.report : response;
  const analysis = isObject(report.analysis) ? report.analysis : null;
  const findings = Array.isArray(report.findings) ? report.findings : [];

  const riskLevel =
    typeof report.riskLevel === "string" ? report.riskLevel : "UNKNOWN";

  const decision =
    typeof report.decision === "string" ? report.decision : "UNKNOWN";

  const isDangerous =
    ["CRITICAL", "HIGH_RISK"].includes(riskLevel.toUpperCase()) ||
    decision.toUpperCase() === "DO_NOT_SIGN";

  const isLowRisk = riskLevel.toUpperCase() === "LOW_RISK";

  const RiskIcon = isDangerous
    ? ShieldAlert
    : isLowRisk
      ? ShieldCheck
      : AlertTriangle;

  const riskStyle = isDangerous
    ? "border-red-500/30 bg-red-500/10 text-red-300"
    : isLowRisk
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : "border-amber-500/30 bg-amber-500/10 text-amber-300";

  return (
    <div className="space-y-4">
      <div className="bg-[#090e0c] border border-emerald-500/15 overflow-hidden rounded-2xl">
        <div className="border-b border-white/[0.07] p-5">
          <div className="flex gap-2 items-center mb-4">
            <ShieldCheck className="h-5 text-emerald-400 w-5" />
            <div>
              <p className="font-black text-sm text-white tracking-widest">
                SAFESIGN
              </p>
              <p className="text-[10px] text-zinc-500 tracking-wider uppercase">
                Sign Guard inspection report
              </p>
            </div>
          </div>

          <div className={`border rounded-xl p-4 ${riskStyle}`}>
            <div className="flex gap-3 items-center">
              <RiskIcon className="h-6 shrink-0 w-6" />
              <div>
                <p className="font-bold text-lg">
                  {humanize(riskLevel)}
                </p>
                <p className="font-semibold opacity-80 text-xs">
                  {humanize(decision)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {analysis && (
            <section className="bg-[#080d0b] border border-white/[0.07] p-4 rounded-xl">
              <h3 className="font-bold mb-3 text-emerald-400 text-xs tracking-wider uppercase">
                Transaction analysis
              </h3>
              <JsonValue value={analysis} />
            </section>
          )}

          <section className="bg-[#080d0b] border border-white/[0.07] p-4 rounded-xl">
            <h3 className="font-bold mb-3 text-emerald-400 text-xs tracking-wider uppercase">
              Security findings ({findings.length})
            </h3>

            {findings.length ? (
              <div className="space-y-3">
                {findings.map((finding, index) => {
                  const item = isObject(finding) ? finding : { detail: finding };

                  const severity =
                    typeof item.severity === "string"
                      ? item.severity.toUpperCase()
                      : "INFO";

                  const color =
                    severity === "CRITICAL" || severity === "HIGH"
                      ? "text-red-400"
                      : severity === "MEDIUM"
                        ? "text-amber-400"
                        : "text-emerald-400";

                  return (
                    <div
                      key={index}
                      className="bg-white/[0.02] border border-white/[0.06] p-3 rounded-lg"
                    >
                      <div className="flex flex-wrap gap-2 items-center justify-between mb-2">
                        <p className="font-semibold text-xs text-zinc-200">
                          {typeof item.code === "string"
                            ? humanize(item.code)
                            : `Finding ${index + 1}`}
                        </p>
                        <span className={`font-bold text-[10px] ${color}`}>
                          {severity}
                        </span>
                      </div>
                      {typeof item.message === "string" && (
                        <p className="leading-relaxed text-xs text-zinc-400">
                          {item.message}
                        </p>
                      )}
                      <div className="mt-2">
                        <JsonValue value={item.evidence ?? Object.fromEntries(
                          Object.entries(item).filter(
                            ([key]) => !["code", "severity", "message"].includes(key)
                          )
                        )} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-zinc-500">
                No findings were returned.
              </p>
            )}
          </section>

          {Object.entries(report).some(
            ([key]) => !["riskLevel", "decision", "analysis", "findings", "disclaimer"].includes(key)
          ) && (
            <section className="bg-[#080d0b] border border-white/[0.07] p-4 rounded-xl">
              <h3 className="font-bold mb-3 text-emerald-400 text-xs tracking-wider uppercase">
                Additional report data
              </h3>
              <JsonValue
                value={Object.fromEntries(
                  Object.entries(report).filter(
                    ([key]) => !["riskLevel", "decision", "analysis", "findings", "disclaimer"].includes(key)
                  )
                )}
              />
            </section>
          )}

          {typeof report.disclaimer === "string" && (
            <div className="bg-amber-500/[0.05] border border-amber-500/20 p-4 rounded-xl">
              <p className="font-bold mb-2 text-amber-300 text-xs">
                Important disclaimer
              </p>
              <p className="leading-relaxed text-xs text-zinc-400">
                {report.disclaimer}
              </p>
            </div>
          )}

          <section className="bg-[#080d0b] border border-white/[0.07] p-4 rounded-xl">
            <h3 className="font-bold mb-3 text-emerald-400 text-xs tracking-wider uppercase">
              Complete saved API response
            </h3>
            <details>
              <summary className="cursor-pointer text-xs text-zinc-400">
                Expand complete response
              </summary>
              <pre className="break-all leading-relaxed max-h-[500px] mt-3 overflow-auto text-[10px] text-zinc-300 whitespace-pre-wrap">
                {JSON.stringify(response, null, 2)}
              </pre>
            </details>
          </section>

          <div className="flex items-center justify-between text-[9px] text-zinc-600 tracking-wider uppercase">
            <span>SafeSign Security Protocol</span>
            <span>
              <CheckCircle2 className="h-3 inline mr-1 w-3" />
              Locally archived
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
