import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandHeader } from "@/components/safesign/BrandHeader";
import CheckForm from "@/components/safesign/CheckForm";
import {
  languages,
  type Language,
} from "@/components/safesign/language";
import { t } from "@/components/safesign/messages";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SafeSign — Check it before you sign" },
      {
        name: "description",
        content:
          "Verify blockchain transactions, payments and token security before you sign.",
      },
    ],
  }),
  component: Index,
});

function Index() {
const [language, setLanguage] = useState<Language>("en");

useEffect(() => {
  const savedLanguage = localStorage.getItem("safesign-language");

  if (
    savedLanguage &&
    languages.some((item) => item.code === savedLanguage)
  ) {
    setLanguage(savedLanguage as Language);
  }
}, []);

useEffect(() => {
  localStorage.setItem("safesign-language", language);
}, [language]);
  const copy = t(language);

  const direction =
    languages.find((item) => item.code === language)?.dir ?? "ltr";

  return (
    <div
      dir={direction}
      lang={language}
      className="bg-background min-h-screen safesign-grid text-foreground"
    >
      <div className="flex flex-col max-w-5xl min-h-screen mx-auto px-5 sm:px-9 w-full">
        <BrandHeader
          language={language}
          onLanguageChange={setLanguage}
        />

        <main className="flex flex-1 flex-col items-center justify-center pb-16 pt-12 sm:pb-24 sm:pt-16">
          <section
            aria-labelledby="safesign-title"
            className="max-w-3xl w-full"
          >
            <p className="font-semibold mb-5 text-center text-primary text-xs tracking-[0.15em] uppercase">
              {copy.eyebrow}
            </p>

            <h1
              id="safesign-title"
              className="font-bold font-display leading-[1.08] sm:text-6xl text-4xl text-center text-foreground"
            >
              {copy.headline}
              <br />
              <span className="text-primary">{copy.accent}</span>
            </h1>

            <p className="leading-7 max-w-xl mt-5 mx-auto sm:text-lg text-base text-center text-muted-foreground">
              {copy.description}
            </p>

            <div className="mt-9 sm:mt-11">
              <CheckForm language={language} />
            </div>
          </section>
        </main>

        <footer className="border-border/70 border-t leading-5 py-5 text-center text-muted-foreground text-xs">
          {copy.footer}
        </footer>
      </div>
    </div>
  );
}
