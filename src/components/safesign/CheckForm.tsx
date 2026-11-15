import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Search,
  ShieldCheck,
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

type FormCopy = {
  verifyTitle: string;
  verifyDescription: string;
  matchTitle: string;
  matchDescription: string;
  tokenTitle: string;
  tokenDescription: string;
  transactionHash: string;
  network: string;
  amount: string;
  recipient: string;
  assetType: string;
  nativeAsset: string;
  tokenAsset: string;
  tokenContract: string;
  enterToken: string;
  checkTransaction: string;
  comparePayment: string;
  checkToken: string;
  invalidHash: string;
  invalidAddress: string;
  invalidAmount: string;
  required: string;
  nativeHelp: string;
  tokenHelp: string;
  checking: string;
  networkError: string;
  transactionPlaceholder: string;
  recipientPlaceholder: string;
  amountPlaceholder: string;
};

const extraCopy: Record<"en" | "pcm", FormCopy> = {
  en: {
    verifyTitle: "Verify a transaction",
    verifyDescription:
      "Check whether a blockchain transaction exists and inspect its on-chain details.",
    matchTitle: "Match a payment",
    matchDescription:
      "Compare a transaction against the payment details you expected to receive.",
    tokenTitle: "Check token security",
    tokenDescription:
      "Inspect a token contract for available security risks and warning indicators.",
    transactionHash: "Transaction hash",
    network: "Blockchain network",
    amount: "Expected amount",
    recipient: "Expected recipient wallet",
    assetType: "Asset type",
    nativeAsset: "Native coin",
    tokenAsset: "ERC-20 token",
    tokenContract: "Token contract address",
    enterToken: "Enter the token contract address",
    checkTransaction: "Verify transaction",
    comparePayment: "Compare payment",
    checkToken: "Check token security",
    invalidHash: "Enter a valid transaction hash.",
    invalidAddress: "Enter a valid wallet or token contract address.",
    invalidAmount: "Enter a valid amount greater than zero.",
    required: "Complete all required fields.",
    nativeHelp:
      "Choose native coin for the network's main currency, such as ETH, POL or ARB.",
    tokenHelp:
      "For an ERC-20 payment, enter the actual token contract address.",
    checking: "Checking...",
    networkError: "The request could not be completed. Please try again.",
    transactionPlaceholder: "0x...",
    recipientPlaceholder: "0x...",
    amountPlaceholder: "e.g. 25.50",
  },

  pcm: {
    verifyTitle: "Verify transaction",
    verifyDescription:
      "Check whether transaction dey blockchain and see the details.",
    matchTitle: "Match payment",
    matchDescription:
      "Compare the transaction with the payment wey you expect.",
    tokenTitle: "Check token security",
    tokenDescription:
      "Check token contract for security risks and warning signs.",
    transactionHash: "Transaction hash",
    network: "Blockchain network",
    amount: "Expected amount",
    recipient: "Expected receiver wallet",
    assetType: "Asset type",
    nativeAsset: "Native coin",
    tokenAsset: "ERC-20 token",
    tokenContract: "Token contract address",
    enterToken: "Enter token contract address",
    checkTransaction: "Verify transaction",
    comparePayment: "Compare payment",
    checkToken: "Check token security",
    invalidHash: "Enter correct transaction hash.",
    invalidAddress: "Enter correct wallet or token contract address.",
    invalidAmount: "Enter correct amount wey pass zero.",
    required: "Fill all the required fields.",
    nativeHelp: "Choose native coin like ETH, POL or ARB.",
    tokenHelp:
      "For ERC-20 payment, enter the real token contract address.",
    checking: "Dey check...",
    networkError: "The request no go through. Abeg try again.",
    transactionPlaceholder: "0x...",
    recipientPlaceholder: "0x...",
    amountPlaceholder: "e.g. 25.50",
  },
};

interface CheckFormProps {
  language: Language;
}

export default function CheckForm({ language }: CheckFormProps) {
  const messages = t(language);
  const extra = t(language);

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
  console.error("SafeSign could not save this report locally:", storageError);
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
    icon: typeof Search;
  }[] = [
    { value: "verify", label: messages.transaction, icon: Search },
    { value: "match", label: messages.payment, icon: CheckCircle2 },
    { value: "token", label: messages.token, icon: ShieldCheck },
  ];

  return (
    <section className="max-w-3xl mx-auto w-full">
      <div className="bg-card border border-border gap-2 grid grid-cols-3 mb-6 p-2 rounded-xl">
        {modeOptions.map((option) => {
          const Icon = option.icon;
          const active = mode === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => changeMode(option.value)}
              aria-pressed={active}
              className={`flex min-h-12 items-center justify-center gap-2 rounded-lg px-2 py-3 text-sm font-medium transition ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 shrink-0 w-4" />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-card border border-border p-5 rounded-2xl shadow-sm sm:p-7">
        <div className="mb-6">
          <div className="flex gap-2 items-center mb-2 text-primary">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-semibold text-xs tracking-wider uppercase">
              SafeSign
            </span>
          </div>

          <h2 className="font-bold sm:text-2xl text-xl">
            {mode === "verify"
              ? extra.verifyTitle
              : mode === "match"
                ? extra.matchTitle
                : extra.tokenTitle}
          </h2>

          <p className="leading-6 mt-2 text-muted-foreground text-sm">
            {mode === "verify"
              ? extra.verifyDescription
              : mode === "match"
                ? extra.matchDescription
                : extra.tokenDescription}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="safesign-network"
              className="block font-medium mb-2 text-sm"
            >
              {extra.network}
            </label>

            <select
              id="safesign-network"
              value={network}
              onChange={(event) => {
                setNetwork(event.target.value);
                resetResult();
              }}
              className="bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 outline-none px-3 rounded-lg text-sm w-full"
            >
              {NETWORKS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {mode === "verify" && (
            <div>
              <label
                htmlFor="safesign-verify-hash"
                className="block font-medium mb-2 text-sm"
              >
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
                className="bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 font-mono h-12 outline-none px-3 rounded-lg text-sm w-full"
              />
            </div>
          )}

          {mode === "match" && (
            <>
              <div>
                <label
                  htmlFor="safesign-match-hash"
                  className="block font-medium mb-2 text-sm"
                >
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
                  className="bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 font-mono h-12 outline-none px-3 rounded-lg text-sm w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="safesign-expected-amount"
                  className="block font-medium mb-2 text-sm"
                >
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
                  className="bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 outline-none px-3 rounded-lg text-sm w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="safesign-expected-recipient"
                  className="block font-medium mb-2 text-sm"
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
                  className="bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 font-mono h-12 outline-none px-3 rounded-lg text-sm w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="safesign-asset-type"
                  className="block font-medium mb-2 text-sm"
                >
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
                  className="bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 outline-none px-3 rounded-lg text-sm w-full"
                >
                  <option value="native">{extra.nativeAsset}</option>
                  <option value="token">{extra.tokenAsset}</option>
                </select>

                <p className="mt-2 text-muted-foreground text-xs">
                  {assetType === "native"
                    ? extra.nativeHelp
                    : extra.tokenHelp}
                </p>
              </div>

              {assetType === "token" && (
                <div>
                  <label
                    htmlFor="safesign-expected-token"
                    className="block font-medium mb-2 text-sm"
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
                    className="bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 font-mono h-12 outline-none px-3 rounded-lg text-sm w-full"
                  />
                </div>
              )}
            </>
          )}

          {mode === "token" && (
            <div>
              <label
                htmlFor="safesign-token-address"
                className="block font-medium mb-2 text-sm"
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
                className="bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 font-mono h-12 outline-none px-3 rounded-lg text-sm w-full"
              />
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="bg-destructive/5 border border-destructive/30 px-4 py-3 rounded-lg text-destructive text-sm"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="font-semibold gap-2 h-12 text-sm w-full"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                {extra.checking}
              </>
            ) : (
              <>
                {mode === "verify"
                  ? extra.checkTransaction
                  : mode === "match"
                    ? extra.comparePayment
                    : extra.checkToken}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>

      {result && (
        <div className="mt-6">
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
