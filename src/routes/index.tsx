import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BrandHeader } from "@/components/safesign/BrandHeader";
import { CheckForm } from "@/components/safesign/CheckForm";
import type { Language } from "@/components/safesign/language";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SafeSign — Check it before you sign" },
      {
        name: "description",
        content:
          "A friendlier way to pause before signing. Check a link, contract address, or transaction before you connect.",
      },
      { property: "og:title", content: "SafeSign — Check it before you sign" },
      {
        property: "og:description",
        content:
          "A friendlier way to pause before signing. Check a link, contract address, or transaction before you connect.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [language, setLanguage] = useState<Language>("en");

  return (
    <div className="safesign-grid min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 sm:px-9">
        <BrandHeader language={language} onLanguageChange={setLanguage} />

        <main
          className="flex flex-1 flex-col items-center justify-center pb-16 pt-16 sm:pb-24 sm:pt-20"
          lang={language === "en" ? "en" : "pcm"}
        >
          <section aria-labelledby="safesign-title" className="w-full max-w-2xl">
            <p className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.15em] text-primary sm:mb-6">
              {language === "en" ? "A moment to check" : "Make you check am first"}
            </p>

            <h1
              className="font-display text-center text-4xl font-semibold leading-[1.08] text-foreground sm:text-6xl"
              id="safesign-title"
            >
              {language === "en" ? (
                <>
                  Don&apos;t sign blind.
                  <br />
                  <span className="text-primary">Check it first.</span>
                </>
              ) : (
                <>
                  No sign am blind.
                  <br />
                  <span className="text-primary">Check am first.</span>
                </>
              )}
            </h1>

            <p className="mx-auto mt-5 max-w-md text-center text-base leading-7 text-muted-foreground sm:mt-6 sm:text-lg">
              {language === "en"
                ? "A quick pause before you connect can bring peace of mind."
                : "Small pause before you connect fit give you peace of mind."}
            </p>

            <div className="mt-9 sm:mt-11">
              <CheckForm language={language} />
            </div>
          </section>
        </main>

        <footer className="border-t border-border/70 py-4 text-center text-xs leading-5 text-muted-foreground">
          {language === "en" ? "Take a breath. Check first." : "Breathe small. Check am first."}
        </footer>
      </div>
    </div>
  );
}
