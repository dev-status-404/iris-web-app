// src/lib/notification.ts
import { notification as antdNotification } from "antd";
import { IntlShape } from "react-intl";

let intl: IntlShape | null = null;

export function setIntl(intlInstance: IntlShape) {
  intl = intlInstance;
}

export function clearIntl(intlInstance?: IntlShape) {
  if (!intlInstance || intl === intlInstance) {
    intl = null;
  }
}

type NotifyArgs = {
  messageKey: string;
  descriptionKey?: string;
  values?: Record<string, string | number | boolean | null | undefined>;
  duration?: number;
};

function open(
  type: "success" | "error" | "info" | "warning",
  { messageKey, descriptionKey, values, duration }: NotifyArgs
) {
  if (!intl) {
    console.warn("Intl not initialized");
    return;
  }

  antdNotification[type]({
    title: intl.formatMessage({ id: messageKey }, values),
    description: descriptionKey
      ? intl.formatMessage({ id: descriptionKey }, values)
      : undefined,
    duration
  });
}

export const notification = {
  success: (args: NotifyArgs) => open("success", args),
  error: (args: NotifyArgs) => open("error", args),
  info: (args: NotifyArgs) => open("info", args),
  warning: (args: NotifyArgs) => open("warning", args)
};
