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

import { clearIntl, setIntl } from "@/lib/notification";
import en from "../../../public/locales/en.json";
import es from "../../../public/locales/es.json";

export type SupportedLanguage = "en" | "es";

const DEFAULT_LANGUAGE: SupportedLanguage = "en";

const flagMap: Record<SupportedLanguage, string> = {
  en: "EN",
  es: "ES",
};

type MessagePrimitive = string | number | boolean | null;

interface NestedMessages {
  [key: string]:
    | MessagePrimitive
    | NestedMessages
    | Array<MessagePrimitive | NestedMessages>;
}

const flattenMessages = (
  nestedMessages: NestedMessages,
  prefix = "",
): Record<string, string> => {
  return Object.keys(nestedMessages).reduce(
    (messages, key) => {
      const value = nestedMessages[key];
      const prefixedKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        messages[prefixedKey] = String(value);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          const arrayKey = `${prefixedKey}.${index}`;

          if (
            typeof item === "string" ||
            typeof item === "number" ||
            typeof item === "boolean"
          ) {
            messages[arrayKey] = String(item);
          } else if (item && typeof item === "object") {
            Object.assign(
              messages,
              flattenMessages(item as NestedMessages, arrayKey),
            );
          }
        });
      } else if (value && typeof value === "object") {
        Object.assign(
          messages,
          flattenMessages(value as NestedMessages, prefixedKey),
        );
      }

      return messages;
    },
    {} as Record<string, string>,
  );
};

const messages: Record<SupportedLanguage, Record<string, string>> = {
  en: flattenMessages(en as NestedMessages),
  es: flattenMessages(es as NestedMessages),
};

const isSupportedLanguage = (lang: string | null): lang is SupportedLanguage =>
  lang === "en" || lang === "es";

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
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    localStorage.setItem("lang", lang);
    setLanguageState(lang);
  }, []);

  const value = useMemo<LanguageContextType>(
    () => ({
      language,
      setLanguage,
      flag: flagMap[language],
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
