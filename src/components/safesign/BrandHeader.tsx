import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import type { Language } from "./language";

const messages = {
  en: { label: "Language", English: "English", Pidgin: "Pidgin" },
  pcm: { label: "Language", English: "English", Pidgin: "Pidgin" },
} as const;

interface BrandHeaderProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export function BrandHeader({ language, onLanguageChange }: BrandHeaderProps) {
  const copy = messages[language];

  return (
    <header className="flex min-h-16 items-center justify-between gap-3 border-b border-border/70 py-3 sm:min-h-20">
      <Link
        to="/"
        aria-label="SafeSign home"
        className="inline-flex min-w-0 items-center gap-3 rounded-md text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_24px_var(--safe-glow)]">
          <ShieldCheck aria-hidden="true" className="size-6" strokeWidth={2.25} />
        </span>
        <span className="font-display text-lg font-semibold">SafeSign</span>
      </Link>

      <div
        aria-label={copy.label}
        className="flex shrink-0 items-center gap-0.5 rounded-lg border border-border bg-secondary/80 p-1"
        role="group"
      >
        <Button
          aria-pressed={language === "en"}
          className="h-8 px-3 text-xs"
          onClick={() => onLanguageChange("en")}
          size="sm"
          type="button"
          variant={language === "en" ? "default" : "ghost"}
        >
          {copy.English}
        </Button>
        <Button
          aria-pressed={language === "pcm"}
          className="h-8 px-3 text-xs"
          onClick={() => onLanguageChange("pcm")}
          size="sm"
          type="button"
          variant={language === "pcm" ? "default" : "ghost"}
        >
          {copy.Pidgin}
        </Button>
      </div>
    </header>
  );
}