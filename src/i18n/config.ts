export const SUPPORTED_LANGUAGES = ["en", "es"] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = "en";

export type LanguageOption = {
  code: SupportedLanguage;
  label: string;
  shortLabel: string;
  direction: "ltr" | "rtl";
};

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", label: "English", shortLabel: "EN", direction: "ltr" },
  { code: "es", label: "Español", shortLabel: "ES", direction: "ltr" },
];

export const isSupportedLanguage = (
  lang: string | null,
): lang is SupportedLanguage => {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
};

export const getLanguageOption = (language: SupportedLanguage) => {
  return (
    LANGUAGE_OPTIONS.find((option) => option.code === language) ??
    LANGUAGE_OPTIONS[0]
  );
};
