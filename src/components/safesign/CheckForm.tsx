
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Search,
  ShieldCheck,
  Fingerprint,
  ScanSearch,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import CheckResult from "./CheckResult";
import { t } from "./messages";
import type { Language } from "./language";
import { saveReport } from "@/lib/safesign-storage";

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://safe-sign-backend.onrender.com"
).replace(/\/$/, "");

const NETWORKS = [
  { value: "ethereum", label: "Ethereum" },
  { value: "base", label: "Base" },
  { value: "arbitrum", label: "Arbitrum" },
  { value: "polygon", label: "Polygon" },
  { value: "op_mainnet", label: "OP Mainnet" },
  { value: "robinhood", label: "Robinhood Chain" },
  { value: "world_chain", label: "World Chain" },
];

const HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

type CheckMode = "verify" | "match" | "token";

interface CheckFormProps {
  language: Language;
}

const fieldClass =
  "h-12 w-full rounded-lg border border-white/10 bg-[#080e0b] px-3 text-sm text-gray-100 outline-none transition placeholder:text-gray-600 hover:border-emerald-500/30 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-500/10";

const labelClass =
  "mb-2 block text-xs font-semibold tracking-wide text-gray-300";

export default function CheckForm({ language }: CheckFormProps) {
  const messages = t(language);
  const extra = messages;

  const [mode, setMode] = useState<CheckMode>("verify");
  const [network, setNetwork] = useState("base");

  const [transactionHash, setTransactionHash] = useState("");
  const [expectedAmount, setExpectedAmount] = useState("");
  const [expectedRecipient, setExpectedRecipient] = useState("");

  const [assetType, setAssetType] = useState<"native" | "token">("native");
  const [expectedTokenAddress, setExpectedTokenAddress] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");

  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [resultMode, setResultMode] = useState<CheckMode>("verify");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem("safesign-form-draft");

      if (savedDraft) {
        const draft = JSON.parse(savedDraft);

        setMode(draft.mode ?? "verify");
        setNetwork(draft.network ?? "base");
        setTransactionHash(draft.transactionHash ?? "");
        setExpectedAmount(draft.expectedAmount ?? "");
        setExpectedRecipient(draft.expectedRecipient ?? "");
        setAssetType(draft.assetType ?? "native");
        setExpectedTokenAddress(draft.expectedTokenAddress ?? "");
        setTokenAddress(draft.tokenAddress ?? "");
      }
    } catch {
      localStorage.removeItem("safesign-form-draft");
    }

    setDraftLoaded(true);
  }, []);

  useEffect(() => {
    if (!draftLoaded) return;

    localStorage.setItem(
      "safesign-form-draft",
      JSON.stringify({
        mode,
        network,
        transactionHash,
        expectedAmount,
        expectedRecipient,
        assetType,
        expectedTokenAddress,
        tokenAddress,
      }),
    );
  }, [
    draftLoaded,
    mode,
    network,
    transactionHash,
    expectedAmount,
    expectedRecipient,
    assetType,
    expectedTokenAddress,
    tokenAddress,
  ]);

  function resetResult() {
    setResult(null);
    setError("");
  }

  function resetForm() {
    setTransactionHash("");
    setExpectedAmount("");
    setExpectedRecipient("");
    setAssetType("native");
    setExpectedTokenAddress("");
    setTokenAddress("");
    resetResult();
  }

  function changeMode(nextMode: CheckMode) {
    if (loading) return;
    setMode(nextMode);
    resetForm();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setResult(null);

    let endpoint = "";
    let payload: Record<string, string> = {};

    if (mode === "verify") {
      const hash = transactionHash.trim();

      if (!HASH_REGEX.test(hash)) {
        setError(extra.invalidHash);
        return;
      }

      endpoint = "/api/transactions/verify";

      payload = {
        network,
        transactionHash: hash,
      };
    }

    if (mode === "match") {
      const hash = transactionHash.trim();
      const recipient = expectedRecipient.trim();
      const amount = expectedAmount.trim();

      if (!HASH_REGEX.test(hash)) {
        setError(extra.invalidHash);
        return;
      }

      if (!ADDRESS_REGEX.test(recipient)) {
        setError(extra.invalidAddress);
        return;
      }

      if (
        !/^\d+(\.\d+)?$/.test(amount) ||
        !Number.isFinite(Number(amount)) ||
        Number(amount) <= 0
      ) {
        setError(extra.invalidAmount);
        return;
      }

      if (
        assetType === "token" &&
        !ADDRESS_REGEX.test(expectedTokenAddress.trim())
      ) {
        setError(extra.invalidAddress);
        return;
      }

      endpoint = "/api/transactions/match";

      payload = {
        network,
        transactionHash: hash,
        expectedAmount: amount,
        expectedRecipient: recipient,
        expectedAsset:
          assetType === "native"
            ? "native"
            : expectedTokenAddress.trim(),
      };
    }

    if (mode === "token") {
      const address = tokenAddress.trim();

      if (!ADDRESS_REGEX.test(address)) {
        setError(extra.invalidAddress);
        return;
      }

      endpoint = "/api/transactions/security-check";

      payload = {
        network,
        tokenAddress: address,
      };
    }

    try {
      setLoading(true);

      const apiResponse = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await apiResponse.text();

      let data: Record<string, unknown>;

      try {
        data = JSON.parse(responseText) as Record<string, unknown>;
      } catch {
        throw new Error(extra.networkError);
      }

      if (!apiResponse.ok || data.success === false) {
        const message =
          typeof data.message === "string"
            ? data.message
            : extra.networkError;

        throw new Error(message);
      }

      setResult(data);
      setResultMode(mode);

      const searchText = [
        network,
        transactionHash,
        expectedRecipient,
        expectedTokenAddress,
        tokenAddress,
        mode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const savedReport = {
        id: crypto.randomUUID(),
        mode,
        network,
        title:
          mode === "verify"
            ? "Transaction verification"
            : mode === "match"
              ? "Payment comparison"
              : "Token security check",
        searchText,
        createdAt: new Date().toISOString(),
        response: data,
      };

      void saveReport(savedReport).catch((storageError) => {
        console.error(
          "SafeSign could not save this report locally:",
          storageError,
        );
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : extra.networkError,
      );
    } finally {
      setLoading(false);
    }
  }

  const modeOptions: {
    value: CheckMode;
    label: string;
    description: string;
    icon: typeof Search;
  }[] = [
    {
      value: "verify",
      label: messages.transaction,
      description: "Inspect transaction",
      icon: Search,
    },
    {
      value: "match",
      label: messages.payment,
      description: "Compare payment",
      icon: CheckCircle2,
    },
    {
      value: "token",
      label: messages.token,
      description: "Inspect contract",
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="mx-auto w-full">
      {/* Mode selector */}
      <div className="mb-6 grid grid-cols-3 gap-2 rounded-xl border border-white/[0.07] bg-black/30 p-1.5">
        {modeOptions.map((option) => {
          const Icon = option.icon;
          const active = mode === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => changeMode(option.value)}
              disabled={loading}
              aria-pressed={active}
              className={`group flex min-h-[76px] flex-col items-center justify-center gap-1.5 rounded-lg px-1.5 py-3 text-center transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-row sm:gap-2 sm:px-3 ${
                active
                  ? "border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 shadow-[inset_0_0_20px_rgba(16,185,129,0.04)]"
                  : "border border-transparent text-gray-500 hover:bg-white/[0.035] hover:text-gray-200"
              }`}
            >
              <Icon
                className={`size-4 shrink-0 ${
                  active ? "text-emerald-400" : ""
                }`}
              />

              <span className="min-w-0">
                <span className="block text-[11px] font-bold sm:text-xs">
                  {option.label}
                </span>
                <span className="mt-0.5 hidden text-[9px] text-gray-500 sm:block">
                  {option.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Form heading */}
      <div className="mb-6 flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-400">
          {mode === "verify" ? (
            <ScanSearch className="size-5" />
          ) : mode === "match" ? (
            <Fingerprint className="size-5" />
          ) : (
            <ShieldCheck className="size-5" />
          )}
        </div>

        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
              {mode === "verify"
                ? extra.verifyTitle
                : mode === "match"
                  ? extra.matchTitle
                  : extra.tokenTitle}
            </h2>

            <span className="rounded border border-emerald-500/20 bg-emerald-500/[0.07] px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-emerald-400">
              {mode === "verify"
                ? "01 / VERIFY"
                : mode === "match"
                  ? "02 / MATCH"
                  : "03 / TOKEN"}
            </span>
          </div>

          <p className="text-xs leading-6 text-gray-500 sm:text-sm">
            {mode === "verify"
              ? extra.verifyDescription
              : mode === "match"
                ? extra.matchDescription
                : extra.tokenDescription}
          </p>
        </div>
      </div>

      {/* Verification form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Network */}
        <div>
          <label htmlFor="safesign-network" className={labelClass}>
            {extra.network}
          </label>

          <select
            id="safesign-network"
            value={network}
            onChange={(event) => {
              setNetwork(event.target.value);
              resetResult();
            }}
            className={fieldClass}
          >
            {NETWORKS.map((item) => (
              <option
                key={item.value}
                value={item.value}
                className="bg-[#0b110e]"
              >
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Transaction verification */}
        {mode === "verify" && (
          <div>
            <label htmlFor="safesign-verify-hash" className={labelClass}>
              {extra.transactionHash}
            </label>

            <input
              id="safesign-verify-hash"
              value={transactionHash}
              onChange={(event) => {
                setTransactionHash(event.target.value);
                resetResult();
              }}
              placeholder={extra.transactionPlaceholder}
              autoCapitalize="off"
              autoComplete="off"
              spellCheck={false}
              className={`${fieldClass} font-mono`}
            />

            <p className="mt-2 text-[10px] text-gray-600">
              Enter the transaction hash from the selected blockchain.
            </p>
          </div>
        )}

        {/* Payment matching */}
        {mode === "match" && (
          <>
            <div>
              <label htmlFor="safesign-match-hash" className={labelClass}>
                {extra.transactionHash}
              </label>

              <input
                id="safesign-match-hash"
                value={transactionHash}
                onChange={(event) => {
                  setTransactionHash(event.target.value);
                  resetResult();
                }}
                placeholder={extra.transactionPlaceholder}
                autoCapitalize="off"
                autoComplete="off"
                spellCheck={false}
                className={`${fieldClass} font-mono`}
              />
            </div>

            <div>
              <label htmlFor="safesign-expected-amount" className={labelClass}>
                {extra.amount}
              </label>

              <input
                id="safesign-expected-amount"
                value={expectedAmount}
                onChange={(event) => {
                  setExpectedAmount(event.target.value);
                  resetResult();
                }}
                placeholder={extra.amountPlaceholder}
                inputMode="decimal"
                className={fieldClass}
              />
            </div>

            <div>
              <label
                htmlFor="safesign-expected-recipient"
                className={labelClass}
              >
                {extra.recipient}
              </label>

              <input
                id="safesign-expected-recipient"
                value={expectedRecipient}
                onChange={(event) => {
                  setExpectedRecipient(event.target.value);
                  resetResult();
                }}
                placeholder={extra.recipientPlaceholder}
                autoCapitalize="off"
                autoComplete="off"
                spellCheck={false}
                className={`${fieldClass} font-mono`}
              />
            </div>

            <div>
              <label htmlFor="safesign-asset-type" className={labelClass}>
                {extra.assetType}
              </label>

              <select
                id="safesign-asset-type"
                value={assetType}
                onChange={(event) => {
                  setAssetType(
                    event.target.value as "native" | "token",
                  );
                  setExpectedTokenAddress("");
                  resetResult();
                }}
                className={fieldClass}
              >
                <option value="native" className="bg-[#0b110e]">
                  {extra.nativeAsset}
                </option>
                <option value="token" className="bg-[#0b110e]">
                  {extra.tokenAsset}
                </option>
              </select>

              <p className="mt-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 text-[10px] leading-5 text-gray-500">
                {assetType === "native"
                  ? extra.nativeHelp
                  : extra.tokenHelp}
              </p>
            </div>

            {assetType === "token" && (
              <div>
                <label
                  htmlFor="safesign-expected-token"
                  className={labelClass}
                >
                  {extra.tokenContract}
                </label>

                <input
                  id="safesign-expected-token"
                  value={expectedTokenAddress}
                  onChange={(event) => {
                    setExpectedTokenAddress(event.target.value);
                    resetResult();
                  }}
                  placeholder={extra.enterToken}
                  autoCapitalize="off"
                  autoComplete="off"
                  spellCheck={false}
                  className={`${fieldClass} font-mono`}
                />
              </div>
            )}
          </>
        )}

        {/* Token security */}
        {mode === "token" && (
          <div>
            <label
              htmlFor="safesign-token-address"
              className={labelClass}
            >
              {extra.tokenContract}
            </label>

            <input
              id="safesign-token-address"
              value={tokenAddress}
              onChange={(event) => {
                setTokenAddress(event.target.value);
                resetResult();
              }}
              placeholder={extra.enterToken}
              autoCapitalize="off"
              autoComplete="off"
              spellCheck={false}
              className={`${fieldClass} font-mono`}
            />

            <p className="mt-2 text-[10px] leading-5 text-gray-600">
              Submit the actual contract address, not just the token name or symbol.
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-red-500/25 bg-red-500/[0.07] px-4 py-3 text-sm text-red-300"
          >
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="group h-12 w-full gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500 font-bold text-[#041109] shadow-[0_0_25px_rgba(16,185,129,0.10)] transition-all hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.20)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {extra.checking}
            </>
          ) : (
            <>
              {mode === "verify"
                ? extra.checkTransaction
                : mode === "match"
                  ? extra.comparePayment
                  : extra.checkToken}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>

        <div className="flex items-center justify-center gap-2 pb-1 text-center">
          <ShieldCheck className="size-3 text-emerald-500/60" />
          <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-gray-600">
            Blockchain data verification · Check before you trust
          </p>
        </div>
      </form>

      {/* Results */}
      {result && (
        <div className="mt-7 border-t border-emerald-500/15 pt-6">
          <CheckResult
            response={result}
            mode={resultMode}
            language={language}
          />
        </div>
      )}
    </section>
  );
}
    
