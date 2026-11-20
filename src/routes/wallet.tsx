
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Clock3,
  LoaderCircle,
  Search,
  ShieldAlert,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { BrandHeader } from "@/components/safesign/BrandHeader";
import type { Language } from "@/components/safesign/language";
import { saveReport } from "@/lib/safesign-storage";

export const Route = createFileRoute("/wallet")({
  component: WalletCheckPage,
});

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://safe-sign-backend.onrender.com"
).replace(/\/$/, "");

const NETWORKS = [
  { value: "ethereum", label: "Ethereum" },
  { value: "base", label: "Base" },
  { value: "arbitrum", label: "Arbitrum" },
  { value: "polygon", label: "Polygon" },
  { value: "op_mainnet", label: "Optimism" },
];

interface WalletReport {
  network: string;
  chainId: string;
  walletAddress: string;
  status: string;
  riskLevel: string;
  message: string;
  riskFlags: { code: string; label: string }[];
  addressInfo?: {
    contractName?: string | null;
    tag?: string | null;
    isContract?: string | null;
    isTrusted?: boolean;
    isSuspicious?: boolean;
  };
}

function WalletCheckPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [network, setNetwork] = useState("ethereum");
  const [walletAddress, setWalletAddress] = useState("");
  const [report, setReport] = useState<WalletReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const address = walletAddress.trim();

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setError("Enter a valid EVM wallet address.");
      return;
    }

    setLoading(true);
    setError("");
    setReport(null);

    try {
      const response = await fetch(`${API_BASE}/api/wallet/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          network,
          walletAddress: address,
        }),
      });

      let data: any;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          `Invalid response from SafeSign backend (HTTP ${response.status}). Check the backend deployment and API endpoint.`
        );
      }

      if (!response.ok || !data?.success || !data?.report) {
        throw new Error(
          data?.message ||
          `Wallet check failed (HTTP ${response.status}).`
        );
      }

      const result = data.report as WalletReport;

      if (typeof result.status !== "string") {
        throw new Error(
          "The backend returned an incomplete wallet security report."
        );
      }

      setReport(result);

      await saveReport({
        id: `wallet-${network}-${address.toLowerCase()}`,
        mode: "wallet",
        network,
        title: "Wallet security check",
        searchText: address,
        createdAt: new Date().toISOString(),
        response: data,
      });
    } catch (err) {
      console.error("Wallet check error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not complete wallet security check."
      );
    } finally {
      setLoading(false);
    }
  };


  const flagged = report?.status === "RISK_DETECTED";

  return (
    <div className="bg-[#070b09] min-h-screen text-gray-100">
      <div className="lg:px-8 max-w-7xl mx-auto px-4 sm:px-6">
        <BrandHeader
  language={language}
  onLanguageChange={(next) => {
    setLanguage(next);
    localStorage.setItem("safesign-language", next);
  }}
  onTokenScannerClick={() => {
    window.location.assign("/?scanner=token");
  }}
/>
        <main className="pb-16">
          <div className="flex flex-wrap gap-3 items-center justify-between py-6">
            <Link
              to="/"
              className="gap-2 hover:text-emerald-300 inline-flex items-center text-gray-400 text-xs"
            >
              <ArrowLeft className="size-4" />
              Back to workspace
            </Link>

            <Link
              to="/history"
              className="gap-2 hover:text-emerald-300 inline-flex items-center text-gray-400 text-xs"
            >
              <Clock3 className="size-4" />
              Scan history
            </Link>
          </div>

          <section className="bg-[#0a100d] border border-emerald-500/15 overflow-hidden p-6 relative rounded-2xl sm:p-9">
            <div className="relative">
              <div className="bg-emerald-500/[0.07] border border-emerald-500/20 font-bold gap-2 inline-flex items-center mb-5 px-3 py-1.5 rounded-full text-[10px] text-emerald-300 tracking-widest uppercase">
                <Wallet className="size-4" />
                Wallet threat intelligence
              </div>

              <h1 className="font-bold sm:text-4xl text-3xl text-white tracking-tight">
                Wallet <span className="text-emerald-400">Check</span>
              </h1>

              <p className="leading-6 max-w-2xl mt-3 text-gray-400 text-sm">
                Check a wallet address against known malicious-address
                intelligence before sending or receiving crypto.
              </p>

              <form onSubmit={handleSubmit} className="max-w-3xl mt-8 space-y-5">
                <div>
                  <label className="block font-semibold mb-2 text-gray-400 text-xs tracking-wider uppercase">
                    Blockchain network
                  </label>
                  <select
                    value={network}
                    onChange={(event) => setNetwork(event.target.value)}
                    className="bg-[#050907] border border-white/10 focus:border-emerald-500/50 h-12 outline-none px-4 rounded-xl text-sm text-white w-full"
                  >
                    {NETWORKS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="wallet-address" className="block font-semibold mb-2 text-gray-400 text-xs tracking-wider uppercase">
                    Wallet address
                  </label>
                  <input
                    id="wallet-address"
                    value={walletAddress}
                    onChange={(event) => setWalletAddress(event.target.value)}
                    placeholder="0x..."
                    spellCheck={false}
                    autoComplete="off"
                    className="bg-[#050907] border border-white/10 focus:border-emerald-500/50 font-mono h-14 outline-none placeholder:text-gray-600 px-4 rounded-xl text-sm text-white w-full"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-500 border border-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-50 font-bold gap-2 h-14 hover:bg-emerald-400 inline-flex items-center justify-center px-7 rounded-xl sm:w-auto text-[#04110b] text-sm transition w-full"
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="animate-spin size-4" />
                      Checking wallet...
                    </>
                  ) : (
                    <>
                      <Search className="size-4" />
                      Check wallet
                    </>
                  )}
                </button>

                {error && (
                  <div className="bg-red-500/[0.06] border border-red-500/20 flex gap-2 items-start p-3 rounded-lg text-red-300 text-xs">
                    <AlertTriangle className="mt-0.5 shrink-0 size-4" />
                    {error}
                  </div>
                )}

                <p className="leading-5 text-[11px] text-gray-500">
                  Read-only security check. Never enter your seed phrase or
                  private key.
                </p>
              </form>
            </div>
          </section>

          {report && (
            <section className="mt-7 space-y-5">
              <div className={`rounded-2xl border p-6 ${
                flagged
                  ? "border-red-500/25 bg-red-500/[0.06]"
                  : report.status === "NO_RISK_FLAGS_RETURNED"
                    ? "border-emerald-500/25 bg-emerald-500/[0.06]"
                    : "border-amber-500/25 bg-amber-500/[0.06]"
              }`}>
                <div className="flex gap-4 items-start">
                  {flagged ? (
                    <ShieldAlert className="shrink-0 size-8 text-red-400" />
                  ) : report.status === "NO_RISK_FLAGS_RETURNED" ? (
                    <ShieldCheck className="shrink-0 size-8 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="shrink-0 size-8 text-amber-400" />
                  )}

                  <div>
                    <h2 className="font-bold text-lg text-white">
                      {flagged
                        ? "Potential wallet risk detected"
                        : report.status === "NO_RISK_FLAGS_RETURNED"
                          ? "No known threats detected"
                          : "Insufficient security information"}
                    </h2>
                    <p className="leading-6 mt-2 text-gray-300 text-xs">
                      {report.message}
                    </p>
                    <p className="font-semibold mt-3 text-[10px] text-gray-400 tracking-wider uppercase">
                      {report.riskLevel} · {report.status.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#0b110e] border border-white/[0.08] p-5 rounded-xl">
                <h3 className="font-semibold text-sm text-white">Wallet information</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-[10px] text-gray-500 tracking-wider uppercase">Address</p>
                    <p className="break-all font-mono mt-2 text-emerald-300 text-xs">{report.walletAddress}</p>
                  </div>
                  <div className="gap-4 grid sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] text-gray-500 tracking-wider uppercase">Network</p>
                      <p className="mt-2 text-gray-200 text-xs">{network}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 tracking-wider uppercase">Chain ID</p>
                      <p className="mt-2 text-gray-200 text-xs">{report.chainId}</p>
                    </div>
                    {report.addressInfo?.tag && (
                      <div>
                        <p className="text-[10px] text-gray-500 tracking-wider uppercase">Address tag</p>
                        <p className="mt-2 text-gray-200 text-xs">{report.addressInfo.tag}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-[#0b110e] border border-white/[0.08] p-5 rounded-xl">
                <h3 className="font-semibold text-sm text-white">
                  Security findings ({report.riskFlags?.length ?? 0})
                </h3>

                {report.riskFlags?.length ? (
                  <div className="mt-4 space-y-3">
                    {report.riskFlags.map((flag, index) => (
                      <div key={`${flag.code}-${index}`} className="bg-red-500/[0.04] border border-red-500/15 flex gap-3 items-center p-3 rounded-lg">
                        <AlertTriangle className="shrink-0 size-4 text-red-400" />
                        <span className="text-gray-200 text-xs">{flag.label}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="leading-6 mt-3 text-gray-400 text-xs">
                    No risk flags were returned in this check. This does not
                    guarantee that the wallet is safe.
                  </p>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
