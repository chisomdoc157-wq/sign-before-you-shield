/** @typedef {"link" | "address" | "transaction"} InputType */
/** @typedef {"en" | "pidgin"} ApiLanguage */

/**
 * @param {InputType} type
 * @param {string} value
 * @param {ApiLanguage} [language]
 * @returns {Promise<{verdict: "safe" | "risky" | "block", score: number, reasons: string[], language: ApiLanguage}>}
 */
export async function checkInput(type, value, language = "en") {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const normalized = value.toLowerCase();
  const verdict = normalized.includes("airdrop")
    ? "block"
    : normalized.includes("new")
      ? "risky"
      : "safe";

  const reasons = {
    en: {
      safe: ["No common warning words were found.", "This is only a basic check, not a guarantee."],
      risky: ["This includes the word “new,” which can appear in untrusted offers.", "Take a closer look before you connect or sign."],
      block: ["This includes “airdrop,” a word often used in fake offers.", "Don’t connect or sign unless you can verify who sent it."],
    },
    pidgin: {
      safe: ["We no see common warning words.", "Na basic check be this, e no be guarantee."],
      risky: ["E get the word “new,” wey fit show for offers wey no safe.", "Check am well before you connect or sign."],
      block: ["E get “airdrop,” wey dem dey use for fake offers sometimes.", "No connect or sign until you confirm who send am."],
    },
  };

  const scores = { safe: 8, risky: 62, block: 94 };

  return {
    verdict,
    score: scores[verdict],
    reasons: reasons[language][verdict],
    language,
  };
}