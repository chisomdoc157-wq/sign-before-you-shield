
import { useState } from "react";
import {
  ShieldCheck,
  Languages,
  Activity,
  ScanSearch,
  History,
  Menu,
  X,
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
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinkClass =
    "inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-emerald-500/[0.08] hover:text-emerald-300";

  const mobileNavLinkClass =
    "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-emerald-500/[0.08] hover:text-emerald-300";

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 inset-x-0 backdrop-blur-xl bg-[#070b09]/95 border-b border-emerald-500/15 z-50">
      <div className="flex gap-2 items-center justify-between min-h-[72px] py-3">

        {/* Brand */}
        <Link
          to="/"
          aria-label="SafeSign home"
          onClick={closeMenu}
          className="focus-visible:ring-2 focus-visible:ring-emerald-400 gap-2 sm:gap-3 group inline-flex items-center min-w-0 outline-none rounded-lg shrink-0"
        >
          <span className="bg-emerald-400/10 border border-emerald-400/30 duration-300 flex group-hover:border-emerald-400/60 group-hover:shadow-[0_0_28px_rgba(16,185,129,0.2)] items-center justify-center relative rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.10)] shrink-0 size-10 sm:size-11 text-emerald-400 transition-all">
            <ShieldCheck className="size-5 sm:size-6" strokeWidth={2.1} />
            <span className="-bottom-1 -right-1 absolute bg-emerald-400 border-2 border-[#070b09] rounded-full size-3" />
          </span>

          <span className="flex flex-col min-w-0">
            <span className="font-bold font-display text-white text-lg sm:text-xl tracking-tight whitespace-nowrap">
              Safe<span className="text-emerald-400">Sign</span>
            </span>
            <span className="font-semibold hidden sm:block text-[9px] text-emerald-500/65 tracking-[0.24em] uppercase">
              Web3 Security Protocol
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-1 items-center">
          <Link to="/" className={navLinkClass}>
            <ShieldCheck className="size-4" />
            Workspace
          </Link>

          <Link to="/link" className={navLinkClass}>
            <ScanSearch className="size-4" />
            Link Scanner
          </Link>

          <button
            type="button"
            onClick={onTokenScannerClick}
            className={navLinkClass}
          >
            <ShieldCheck className="size-4" />
            Token Scanner
          </button>

          <Link to="/history" className={navLinkClass}>
            <History className="size-4" />
            History
          </Link>
        </nav>

        {/* Right Controls */}
        <div className="flex gap-2 items-center shrink-0 sm:gap-3">

          <div className="bg-emerald-500/[0.06] border border-emerald-500/15 gap-2 hidden items-center px-3 py-2 rounded-full xl:flex">
            <Activity className="size-3.5 text-emerald-400" />
            <span className="font-semibold text-[10px] text-emerald-300/80 tracking-[0.16em] uppercase">
              Security Workspace
            </span>
          </div>

          {/* Language Selector */}
          <div className="flex gap-1.5 items-center">
            <Languages className="hidden size-4 sm:block text-emerald-500/70" />

            <Select
              value={language}
              onValueChange={(value) =>
                onLanguageChange(value as Language)
              }
            >
              <SelectTrigger
                aria-label={copy.language}
                className="bg-white/[0.04] border border-white/10 focus:ring-emerald-500/30 h-10 hover:bg-emerald-500/[0.06] hover:border-emerald-500/40 rounded-lg w-[100px] sm:w-[145px] text-gray-200 text-xs transition-colors"
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

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            className="md:hidden flex items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] hover:bg-emerald-500/[0.12] hover:border-emerald-500/40 size-10 text-emerald-400 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {menuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {menuOpen && (
        <div
          id="mobile-navigation"
          className="absolute left-0 right-0 top-full md:hidden border-b border-emerald-500/20 bg-[#09110d]/[0.98] backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
        >
          <nav className="flex flex-col gap-1 p-3">

            <Link
              to="/"
              onClick={closeMenu}
              className={mobileNavLinkClass}
            >
              <ShieldCheck className="size-5 text-emerald-400" />
              Workspace
            </Link>

            <Link
              to="/link"
              onClick={closeMenu}
              className={mobileNavLinkClass}
            >
              <ScanSearch className="size-5 text-emerald-400" />
              Link Scanner
            </Link>

            <button
              type="button"
              onClick={() => {
                closeMenu();
                onTokenScannerClick();
              }}
              className={mobileNavLinkClass}
            >
              <ShieldCheck className="size-5 text-emerald-400" />
              Token Scanner
            </button>

            <Link
              to="/history"
              onClick={closeMenu}
              className={mobileNavLinkClass}
            >
              <History className="size-5 text-emerald-400" />
              History
            </Link>

            <div className="border-t border-emerald-500/10 mt-2 pt-3 px-4">
              <p className="flex gap-2 items-center text-[10px] font-semibold tracking-[0.16em] uppercase text-emerald-400/70">
                <Activity className="size-3.5" />
                Security Workspace
              </p>
              <p className="mt-1 text-[11px] text-gray-500">
                Web3 Security Protocol
              </p>
            </div>

          </nav>
        </div>
      )}
    </header>
  );
}
