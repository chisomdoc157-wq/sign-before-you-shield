import { ShieldCheck, Languages } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { languages, type Language } from "./language";
import { t } from "./messages";

interface BrandHeaderProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export function BrandHeader({
  language,
  onLanguageChange,
}: BrandHeaderProps) {
  const copy = t(language);

  return (
    <header className="border-b border-border/70 flex gap-3 items-center justify-between min-h-16 py-3 sm:min-h-20">
      <Link
        to="/"
        aria-label="SafeSign home"
        className="gap-3 inline-flex items-center min-w-0 rounded-md text-foreground"
      >
        <span className="bg-primary flex items-center justify-center rounded-xl shadow-[0_0_24px_var(--safe-glow)] shrink-0 size-10 text-primary-foreground">
          <ShieldCheck className="size-6" strokeWidth={2.25} />
        </span>

        <span className="font-bold font-display text-lg tracking-tight">
          SafeSign
        </span>
      </Link>

      <div className="flex gap-2 items-center">
        <Languages className="hidden size-4 sm:block text-muted-foreground" />

        <Select
          value={language}
          onValueChange={(value) => onLanguageChange(value as Language)}
        >
          <SelectTrigger
            aria-label={copy.language}
            className="bg-card border-border h-10 rounded-xl sm:w-[190px] w-[155px]"
          >
            <SelectValue placeholder={copy.language} />
          </SelectTrigger>

          <SelectContent align="end" className="max-h-80">
            {languages.map((item) => (
              <SelectItem key={item.code} value={item.code}>
                <span className="flex gap-2 items-center">
                  <span>{item.nativeName}</span>
                  {item.name !== item.nativeName && (
                    <span className="text-muted-foreground text-xs">
                      {item.name}
                    </span>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}