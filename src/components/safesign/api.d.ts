export type InputType = "link" | "address" | "transaction";
export type ApiLanguage = "en" | "pidgin";
export type Verdict = "safe" | "risky" | "block";

export interface CheckResult {
  verdict: Verdict;
  score: number;
  reasons: string[];
  language: ApiLanguage;
}

export function checkInput(type: InputType, value: string, language?: ApiLanguage): Promise<CheckResult>;