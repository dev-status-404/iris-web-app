import en from "../../public/locales/en.json";
import es from "../../public/locales/es.json";
import { DEFAULT_LANGUAGE, SupportedLanguage } from "./config";

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

const localeMessages: Record<SupportedLanguage, Record<string, string>> = {
  en: flattenMessages(en as NestedMessages),
  es: flattenMessages(es as NestedMessages),
};

const defaultMessages = localeMessages[DEFAULT_LANGUAGE];

export const messages: Record<SupportedLanguage, Record<string, string>> = {
  en: defaultMessages,
  es: {
    ...defaultMessages,
    ...localeMessages.es,
  },
};
