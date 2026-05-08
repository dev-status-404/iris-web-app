"use client";

import { useEffect, useState } from "react";

/**
 * Reactive dark-mode detector.
 * Reads the initial value from localStorage (set by providers/antd/index.tsx)
 * and subscribes to the custom "app-theme-change" event so it stays in sync
 * whenever the user toggles the theme.
 */
export function useIsDark(): boolean {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<"dark" | "light">).detail;
      setIsDark(detail === "dark");
    };
    window.addEventListener("app-theme-change", handler);
    return () => window.removeEventListener("app-theme-change", handler);
  }, []);

  return isDark;
}
