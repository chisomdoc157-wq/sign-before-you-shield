
import {
  ShieldCheck,
  Languages,
  Activity,
  ScanSearch,
  History,
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
  onTokenScannerClick: () => void;
}

export function BrandHeader({
  language,
  onLanguageChange,
  onTokenScannerClick,
}: BrandHeaderProps) {
  const copy = t(language);

  const navLinkClass =
    "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-gray-400 transition-colors hover:bg-emerald-500/[0.07] hover:text-emerald-300 sm:px-3";

  return (
    <header className="backdrop-blur-xl bg-[#070b09]/90 border-b border-emerald-500/15 relative z-20">
      <div className="flex gap-3 items-center justify-between min-h-[76px] py-3">
        <Link
          to="/"
          aria-label="SafeSign home"
          className="focus-visible:ring-2 focus-visible:ring-emerald-400 gap-3 group inline-flex items-center min-w-0 outline-none rounded-lg"
        >
          <span className="bg-emerald-400/10 border border-emerald-400/30 duration-300 flex group-hover:border-emerald-400/60 group-hover:shadow-[0_0_28px_rgba(16,185,129,0.2)] items-center justify-center relative rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.10)] shrink-0 size-11 text-emerald-400 transition-all">
            <ShieldCheck className="size-6" strokeWidth={2.1} />
            <span className="-bottom-1 -right-1 absolute bg-emerald-400 border-2 border-[#070b09] rounded-full size-3" />
          </span>

          <span className="flex flex-col min-w-0">
            <span className="font-bold font-display text-white text-xl tracking-tight">
              Safe<span className="text-emerald-400">Sign</span>
            </span>
            <span className="font-semibold hidden sm:block text-[9px] text-emerald-500/65 tracking-[0.24em] uppercase">
              Web3 Security Protocol
            </span>
          </span>
        </Link>

        <nav className="flex gap-1 items-center sm:gap-2">
          <Link to="/" className={navLinkClass}>
            <ShieldCheck className="size-4" />
            <span className="hidden md:inline">Workspace</span>
          </Link>

          <Link to="/links" className={navLinkClass}>
            <ScanSearch className="size-4" />
            <span className="hidden md:inline">Link Scanner</span>
          </Link>
          <button
            type="button"
            onClick={onTokenScannerClick}
            className={navLinkClass}
          >
            <ShieldCheck className="size-4" />
            <span className="hidden md:inline">Token Scanner</span>
          </button>

          <Link to="/history" className={navLinkClass}>
            <History className="size-4" />
            <span className="hidden md:inline">History</span>
          </Link>
        </nav>

        <div className="flex gap-2 items-center sm:gap-3">
          <div className="bg-emerald-500/[0.06] border border-emerald-500/15 gap-2 hidden items-center px-3 py-2 rounded-full xl:flex">
            <Activity className="size-3.5 text-emerald-400" />
            <span className="font-semibold text-[10px] text-emerald-300/80 tracking-[0.16em] uppercase">
              Security Workspace
            </span>
          </div>

          <div className="flex gap-2 items-center">
            <Languages className="hidden size-4 sm:block text-emerald-500/70" />

            <Select
              value={language}
              onValueChange={(value) =>
                onLanguageChange(value as Language)
              }
            >
              <SelectTrigger
                aria-label={copy.language}
                className="bg-white/[0.04] border border-white/10 focus:ring-emerald-500/30 h-10 hover:bg-emerald-500/[0.06] hover:border-emerald-500/40 rounded-lg sm:w-[145px] text-gray-200 text-xs transition-colors w-[105px]"
              >
                <SelectValue placeholder={copy.language} />
              </SelectTrigger>

              <SelectContent
                align="end"
                className="bg-[#0c1410] border border-emerald-500/20 max-h-80 text-gray-200"
              >
                {languages.map((item) => (
                  <SelectItem
                    key={item.code}
                    value={item.code}
                    className="focus:bg-emerald-500/10 focus:text-emerald-300 text-sm"
                  >
                    <span className="flex gap-2 items-center">
                      <span>{item.nativeName}</span>
                      {item.name !== item.nativeName && (
                        <span className="text-gray-500 text-xs">
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
