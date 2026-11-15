
import {
  ShieldCheck,
  Languages,
  Activity,
  ChevronDown,
} from "lucide-react";
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
    <header className="relative z-20 border-b border-emerald-500/15 bg-[#070b09]/90 backdrop-blur-xl">
      <div className="flex min-h-[76px] items-center justify-between gap-3 py-3">
        <Link
          to="/"
          aria-label="SafeSign home"
          className="group inline-flex min-w-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <span className="relative flex size-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.10)] transition-all duration-300 group-hover:border-emerald-400/60 group-hover:shadow-[0_0_28px_rgba(16,185,129,0.2)]">
            <ShieldCheck className="size-6" strokeWidth={2.1} />
            <span className="absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-[#070b09] bg-emerald-400" />
          </span>

          <span className="flex min-w-0 flex-col">
            <span className="font-display text-xl font-bold tracking-tight text-white">
              Safe<span className="text-emerald-400">Sign</span>
            </span>
            <span className="hidden text-[9px] font-semibold uppercase tracking-[0.24em] text-emerald-500/65 sm:block">
              Web3 Security Protocol
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/[0.06] px-3 py-2 sm:flex">
            <Activity className="size-3.5 text-emerald-400" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300/80">
              Security Workspace
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Languages className="hidden size-4 text-emerald-500/70 sm:block" />

            <Select
              value={language}
              onValueChange={(value) =>
                onLanguageChange(value as Language)
              }
            >
              <SelectTrigger
                aria-label={copy.language}
                className="h-10 w-[145px] rounded-lg border border-white/10 bg-white/[0.04] text-xs text-gray-200 transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/[0.06] focus:ring-emerald-500/30 sm:w-[175px]"
              >
                <SelectValue placeholder={copy.language} />
              </SelectTrigger>

              <SelectContent
                align="end"
                className="max-h-80 border border-emerald-500/20 bg-[#0c1410] text-gray-200"
              >
                {languages.map((item) => (
                  <SelectItem
                    key={item.code}
                    value={item.code}
                    className="text-sm focus:bg-emerald-500/10 focus:text-emerald-300"
                  >
                    <span className="flex items-center gap-2">
                      <span>{item.nativeName}</span>
                      {item.name !== item.nativeName && (
                        <span className="text-xs text-gray-500">
                          {item.name}
                        </span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </header>
  );
}
