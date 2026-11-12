import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { checkInput, type CheckResult as CheckResultData } from "./api.js";
import { getTransactionReport, isTransactionHash, type TransactionReportData } from "./chain.js";
import { networks, type NetworkId } from "./networks.js";
import { CheckResultCard, TransactionReport } from "./CheckResult";
import type { Language } from "./language";

const messages = {
  en: {
    inputLabel: "Link, address, or transaction",
    placeholder: "Paste a link, contract address, or transaction hash",
    submit: "Check it",
    privacy: "We never ask for your seed phrase or private key.",
    emptyError: "Please paste a link, address, or transaction first.",
    checking: "Checking...",
    error: "Couldn't check this. Try again.",
    networkLabel: "Network",
  },
  pcm: {
    inputLabel: "Link, address, or transaction",
    placeholder: "Paste link, contract address, or transaction hash",
    submit: "Check am",
    privacy: "We no go ask for your seed phrase or private key.",
    emptyError: "Abeg paste link, address, or transaction first.",
    checking: "We dey check am...",
    error: "We no fit check am. Abeg try again.",
    networkLabel: "Network",
  },
} as const;

interface CheckFormProps {
  language: Language;
}

export function CheckForm({ language }: CheckFormProps) {
  const copy = messages[language];
  const [value, setValue] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState(false);
  const [result, setResult] = useState<CheckResultData | null>(null);
  const [networkId, setNetworkId] = useState<NetworkId>("base");
  const [transactionReport, setTransactionReport] = useState<TransactionReportData | null>(null);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionError, setTransactionError] = useState(false);
  const requestId = useRef(0);
  const isHash = isTransactionHash(value.trim());

  function reset() {
    requestId.current += 1;
    setValue("");
    setHasError(false);
    setIsChecking(false);
    setCheckError(false);
    setResult(null);
    setTransactionReport(null);
    setTransactionLoading(false);
    setTransactionError(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCheckError(false);
    setResult(null);
    setTransactionReport(null);
    setTransactionError(false);

    const input = value.trim();
    if (!input) {
      setHasError(true);
      return;
    }

    setHasError(false);
    setIsChecking(true);
    const currentRequest = requestId.current + 1;
    requestId.current = currentRequest;
    const inputType = isTransactionHash(input)
      ? "transaction"
      : /^0x[a-f\d]{40}$/i.test(input)
        ? "address"
        : "link";

    void checkInput(inputType, input, language === "en" ? "en" : "pidgin")
      .then((nextResult) => {
        if (requestId.current === currentRequest) setResult(nextResult);
      })
      .catch(() => {
        if (requestId.current === currentRequest) setCheckError(true);
      })
      .finally(() => {
        if (requestId.current === currentRequest) setIsChecking(false);
      });

    if (isTransactionHash(input)) {
      setTransactionLoading(true);
      void getTransactionReport(input, networkId)
        .then((report) => {
          if (requestId.current === currentRequest) setTransactionReport(report);
        })
        .catch(() => {
          if (requestId.current === currentRequest) setTransactionError(true);
        })
        .finally(() => {
          if (requestId.current === currentRequest) setTransactionLoading(false);
        });
    }
  }

  function handleChange(nextValue: string) {
    requestId.current += 1;
    setValue(nextValue);
    setHasError(false);
    setIsChecking(false);
    setCheckError(false);
    setResult(null);
    setTransactionReport(null);
    setTransactionError(false);
    setTransactionLoading(false);
  }

  return (
    <div>
      <form className="space-y-4" noValidate onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="safesign-input">{copy.inputLabel}</label>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_11rem] sm:items-start">
          <Textarea
            aria-describedby={hasError ? "safesign-error safesign-privacy-note" : "safesign-privacy-note"}
            aria-invalid={hasError}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className="min-h-32 resize-y rounded-lg border-border bg-input-surface px-4 py-4 text-base leading-7 text-foreground shadow-inner shadow-background/50 placeholder:text-muted-foreground/80 focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/30 sm:min-h-36 sm:px-5 sm:py-5"
            id="safesign-input"
            onChange={(event) => handleChange(event.target.value)}
            placeholder={copy.placeholder}
            spellCheck={false}
            value={value}
          />
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="safesign-network">{copy.networkLabel}</label>
            <Select
              onValueChange={(next) => {
                setNetworkId(next as NetworkId);
                setTransactionReport(null);
                setTransactionError(false);
              }}
              value={networkId}
            >
              <SelectTrigger className="h-11 rounded-lg border-border bg-input-surface" disabled={isChecking || transactionLoading || Boolean(result)} id="safesign-network">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(networks).map((network) => (
                  <SelectItem key={network.id} value={network.id}>{network.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasError ? (
          <p className="text-sm leading-5 text-destructive" id="safesign-error" role="alert">{copy.emptyError}</p>
        ) : null}

        <Button className="h-12 w-full rounded-lg text-base font-semibold" disabled={isChecking} size="lg" type="submit">
          {isChecking ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
          {isChecking ? copy.checking : copy.submit}
          {!isChecking ? <ArrowRight aria-hidden="true" className="size-4" /> : null}
        </Button>

        <p className="text-center text-sm leading-6 text-muted-foreground" id="safesign-privacy-note">{copy.privacy}</p>
        {checkError ? <p className="text-center text-sm leading-6 text-destructive" role="alert">{copy.error}</p> : null}
      </form>

      {result ? <CheckResultCard language={language} onCheckAnother={reset} result={result} /> : null}
      {result ? (
        <TransactionReport error={transactionError} language={language} loading={transactionLoading} report={transactionReport} />
      ) : null}
    </div>
  );
}