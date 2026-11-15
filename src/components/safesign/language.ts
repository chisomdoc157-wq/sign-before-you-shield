export const languages = [
  { code: "en", name: "English", nativeName: "English", dir: "ltr" },
  { code: "pcm", name: "Nigerian Pidgin", nativeName: "Naija Pidgin", dir: "ltr" },
  { code: "fr", name: "French", nativeName: "Français", dir: "ltr" },
  { code: "es", name: "Spanish", nativeName: "Español", dir: "ltr" },
  { code: "pt", name: "Portuguese", nativeName: "Português", dir: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", dir: "rtl" },
  { code: "zh", name: "Chinese", nativeName: "中文", dir: "ltr" },
  { code: "de", name: "German", nativeName: "Deutsch", dir: "ltr" },
  { code: "yo", name: "Yoruba", nativeName: "Yorùbá", dir: "ltr" },
  { code: "ig", name: "Igbo", nativeName: "Igbo", dir: "ltr" },
  { code: "ha", name: "Hausa", nativeName: "Hausa", dir: "ltr" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", dir: "ltr" },
] as const;

export type Language = (typeof languages)[number]["code"];