"use client";

import { Button } from "antd";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export function ModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") setIsDark(true);
    else if (saved === "light") setIsDark(false);
    else setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    window.dispatchEvent(
      new CustomEvent("app-theme-change", { detail: next ? "dark" : "light" })
    );
  };

  return (
    <Button type="default" onClick={toggle} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      {isDark ? (
        <SunIcon style={{ width: "1rem", height: "1rem" }} />
      ) : (
        <MoonIcon style={{ width: "1rem", height: "1rem" }} />
      )}
    </Button>
  );
}
