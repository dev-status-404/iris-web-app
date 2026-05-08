"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { IntlProvider, useIntl } from "react-intl";

import {
  DEFAULT_LANGUAGE,
  getLanguageOption,
  isSupportedLanguage,
  SupportedLanguage,
} from "@/i18n/config";
import { messages } from "@/i18n/messages";
import { clearIntl, setIntl } from "@/lib/notification";

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  flag: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] =
    useState<SupportedLanguage>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const storedLang = localStorage.getItem("lang");
    if (isSupportedLanguage(storedLang)) {
      setLanguageState(storedLang);
    }
  }, []);

  useEffect(() => {
    const languageOption = getLanguageOption(language);
    document.documentElement.lang = language;
    document.documentElement.dir = languageOption.direction;
  }, [language]);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    localStorage.setItem("lang", lang);
    setLanguageState(lang);
  }, []);

  const value = useMemo<LanguageContextType>(
    () => ({
      language,
      setLanguage,
      flag: getLanguageOption(language).shortLabel,
    }),
    [language, setLanguage],
  );

  return (
    <IntlProvider
      defaultLocale={DEFAULT_LANGUAGE}
      locale={language}
      messages={messages[language]}
    >
      <IntlBridge>
        <LanguageContext.Provider value={value}>
          {children}
        </LanguageContext.Provider>
      </IntlBridge>
    </IntlProvider>
  );
};

function IntlBridge({ children }: { children: React.ReactNode }) {
  const intl = useIntl();

  useEffect(() => {
    setIntl(intl);
    return () => clearIntl(intl);
  }, [intl]);

  return <>{children}</>;
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
