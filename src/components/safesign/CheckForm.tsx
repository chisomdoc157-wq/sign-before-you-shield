import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Language } from "./language";

const messages = {
  en: {
    inputLabel: "Link, address, or transaction",
    placeholder: "Paste a link, contract address, or transaction hash",
    submit: "Check it",
    privacy: "We never ask for your seed phrase or private key.",
    emptyError: "Please paste a link, address, or transaction first.",
    unavailable: "Checks aren’t available yet, and nothing was sent.",
  },
  pcm: {
    inputLabel: "Link, address, or transaction",
    placeholder: "Paste link, contract address, or transaction hash",
    submit: "Check am",
    privacy: "We no go ask for your seed phrase or private key.",
    emptyError: "Abeg paste link, address, or transaction first.",
    unavailable: "We never fit check am yet, and we no send anything.",
  },
} as const;

interface CheckFormProps {
  language: Language;
}

export function CheckForm({ language }: CheckFormProps) {
  const copy = messages[language];
  const [value, setValue] = useState("");
  const [hasError, setHasError] = useState(false);
  const [showUnavailable, setShowUnavailable] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowUnavailable(false);

    if (!value.trim()) {
      setHasError(true);
      return;
    }

    setHasError(false);
    setShowUnavailable(true);
  }

  function handleChange(nextValue: string) {
    setValue(nextValue);
    setHasError(false);
    setShowUnavailable(false);
  }

  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="safesign-input">
        {copy.inputLabel}
      </label>
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

      {hasError ? (
        <p className="text-sm leading-5 text-destructive" id="safesign-error" role="alert">
          {copy.emptyError}
        </p>
      ) : null}

      <Button className="h-12 w-full rounded-lg text-base font-semibold" size="lg" type="submit">
        {copy.submit}
        <ArrowRight aria-hidden="true" className="size-4" />
      </Button>

      <p className="text-center text-sm leading-6 text-muted-foreground" id="safesign-privacy-note">
        {copy.privacy}
      </p>

      {showUnavailable ? (
        <p
          className="rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-center text-sm leading-6 text-accent-foreground"
          role="status"
        >
          {copy.unavailable}
        </p>
      ) : null}
    </form>
  );
}