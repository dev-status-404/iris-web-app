"use client";

import { useLanguage } from "@/hooks/language/use-language";
import { ConfigProvider, theme } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import enUS from "antd/locale/en_US";
import esES from "antd/locale/es_ES";

const { defaultAlgorithm, darkAlgorithm } = theme;

export default function Providers({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") setIsDark(true);
    else if (savedTheme === "light") setIsDark(false);
    else setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    if (isDark === null) return;
    localStorage.setItem("theme", isDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    const onThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<"dark" | "light" | undefined>;
      const nextTheme = customEvent.detail;
      if (nextTheme === "dark") setIsDark(true);
      else if (nextTheme === "light") setIsDark(false);
      else {
        const saved = localStorage.getItem("theme");
        setIsDark(saved === "dark");
      }
    };
    window.addEventListener("app-theme-change", onThemeChange as EventListener);
    return () => window.removeEventListener("app-theme-change", onThemeChange as EventListener);
  }, []);

  const palette = useMemo(() => {
    const light = {
      colorPrimary: "#18181b",
      colorPrimaryHover: "#3f3f46",
      colorPrimaryActive: "#09090b",
      colorTextLightSolid: "#fafafa",

      colorSuccess: "#22c55e",
      colorWarning: "#f97316",
      colorError: "#ef4444",
      colorInfo: "#18181b",

      colorTextBase: "#262626",
      colorBgBase: "#ffffff",

      colorText: "#262626",
      colorTextSecondary: "#525252",
      colorTextTertiary: "#737373",
      colorTextQuaternary: "#a3a3a3",
      colorTextDisabled: "#a3a3a3",

      colorBgContainer: "#ffffff",
      colorBgElevated: "#ffffff",
      colorBgLayout: "#fafafa",
      colorBgSpotlight: "rgba(38,38,38,0.85)",
      colorBgMask: "rgba(38,38,38,0.45)",

      colorBorder: "#e4e4e7",
      colorBorderSecondary: "#f4f4f5",
      colorSplit: "#e4e4e7",

      // Primary sub-palette (prevents antd from generating tinted palette from #18181b)
      colorPrimaryBg: "#f5f5f5",
      colorPrimaryBgHover: "#e5e5e5",
      colorPrimaryBorder: "#d4d4d4",
      colorPrimaryBorderHover: "#a3a3a3",
      colorPrimaryText: "#262626",
      colorPrimaryTextHover: "#404040",
      colorPrimaryTextActive: "#171717",

      boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
      boxShadowSecondary: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",

      buttonDefaultBg: "#ffffff",
      buttonDefaultColor: "#18181b",
      buttonDefaultBorderColor: "#e4e4e7",
      buttonDefaultHoverBg: "#f4f4f5",
      buttonDefaultHoverBorderColor: "#d4d4d8",

      inputHoverBorder: "#a1a1aa",
      inputActiveBorder: "#18181b",

      selectOptionSelectedBg: "#f4f4f5",
      selectOptionActiveBg: "#fafafa",

      menuItemBg: "transparent",
      menuSelectedBg: "#f4f4f5",
      menuSelectedColor: "#18181b",
      menuHoverBg: "#f4f4f5",

      progressRemaining: "#f4f4f5",
      sliderTrack: "#f4f4f5",
      sliderTrackHover: "#e4e4e7",

      siderBg: "transparent",
      appBg: "#fafafa",
    };

    const dark = {
      colorPrimary: "#fafafa",
      colorPrimaryHover: "#e4e4e7",
      colorPrimaryActive: "#d4d4d8",
      colorTextLightSolid: "#18181b", // dark text on white primary button

      colorSuccess: "#22c55e",
      colorWarning: "#f97316",
      colorError: "#ef4444",
      colorInfo: "#fafafa",

      colorTextBase: "#fafafa",
      colorBgBase: "#09090b",

      colorText: "#fafafa",
      colorTextSecondary: "#a1a1aa",
      colorTextTertiary: "#71717a",
      colorTextQuaternary: "#52525b",
      colorTextDisabled: "#52525b",

      colorBgContainer: "#18181b",
      colorBgElevated: "#27272a",
      colorBgLayout: "#09090b",
      colorBgSpotlight: "rgba(255,255,255,0.12)",
      colorBgMask: "rgba(0,0,0,0.7)",

      colorBorder: "#27272a",
      colorBorderSecondary: "#18181b",
      colorSplit: "#27272a",

      // Primary sub-palette for dark
      colorPrimaryBg: "#27272a",
      colorPrimaryBgHover: "#3f3f46",
      colorPrimaryBorder: "#52525b",
      colorPrimaryBorderHover: "#71717a",
      colorPrimaryText: "#fafafa",
      colorPrimaryTextHover: "#e4e4e7",
      colorPrimaryTextActive: "#d4d4d8",

      boxShadow: "0 1px 3px 0 rgba(0,0,0,0.4), 0 1px 2px -1px rgba(0,0,0,0.4)",
      boxShadowSecondary: "0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -2px rgba(0,0,0,0.4)",

      buttonDefaultBg: "#18181b",
      buttonDefaultColor: "#fafafa",
      buttonDefaultBorderColor: "#27272a",
      buttonDefaultHoverBg: "#27272a",
      buttonDefaultHoverBorderColor: "#3f3f46",

      inputHoverBorder: "#52525b",
      inputActiveBorder: "#fafafa",

      selectOptionSelectedBg: "#27272a",
      selectOptionActiveBg: "#1c1c1f",

      menuItemBg: "transparent",
      menuSelectedBg: "#27272a",
      menuSelectedColor: "#fafafa",
      menuHoverBg: "#27272a",

      progressRemaining: "#27272a",
      sliderTrack: "#27272a",
      sliderTrackHover: "#3f3f46",

      siderBg: "transparent",
      appBg: "#09090b",
    };

    return isDark ? dark : light;
  }, [isDark]);

  const antdLocale = useMemo(() => {
    return language === "es" ? esES : enUS;
  }, [language]);

  if (isDark === null) return null;

  return (
    <ConfigProvider
      locale={antdLocale}
      theme={{
        algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: palette.colorPrimary,
          colorPrimaryHover: palette.colorPrimaryHover,
          colorPrimaryActive: palette.colorPrimaryActive,
          colorTextLightSolid: palette.colorTextLightSolid,

          colorSuccess: palette.colorSuccess,
          colorWarning: palette.colorWarning,
          colorError: palette.colorError,
          colorInfo: palette.colorInfo,

          colorTextBase: palette.colorTextBase,
          colorBgBase: palette.colorBgBase,

          colorText: palette.colorText,
          colorTextSecondary: palette.colorTextSecondary,
          colorTextTertiary: palette.colorTextTertiary,
          colorTextQuaternary: palette.colorTextQuaternary,
          colorTextDisabled: palette.colorTextDisabled,

          colorBgContainer: palette.colorBgContainer,
          colorBgElevated: palette.colorBgElevated,
          colorBgLayout: palette.colorBgLayout,
          colorBgSpotlight: palette.colorBgSpotlight,
          colorBgMask: palette.colorBgMask,

          colorBorder: palette.colorBorder,
          colorBorderSecondary: palette.colorBorderSecondary,
          colorSplit: palette.colorSplit,

          colorPrimaryBg: palette.colorPrimaryBg,
          colorPrimaryBgHover: palette.colorPrimaryBgHover,
          colorPrimaryBorder: palette.colorPrimaryBorder,
          colorPrimaryBorderHover: palette.colorPrimaryBorderHover,
          colorPrimaryText: palette.colorPrimaryText,
          colorPrimaryTextHover: palette.colorPrimaryTextHover,
          colorPrimaryTextActive: palette.colorPrimaryTextActive,

          colorLink: palette.colorPrimary,
          colorLinkHover: palette.colorPrimaryHover,

          // Disable antd blue glow focus rings
          controlOutline: "transparent",
          controlOutlineWidth: 0,

          borderRadius: 6,
          borderRadiusXS: 2,
          borderRadiusSM: 4,
          borderRadiusLG: 8,

          padding: 16,
          paddingSM: 12,
          paddingLG: 24,
          margin: 16,
          marginSM: 12,
          marginLG: 24,

          boxShadow: palette.boxShadow,
          boxShadowSecondary: palette.boxShadowSecondary,
        },
        components: {
          Layout: {
            headerBg: "transparent",
            bodyBg: "transparent",
            footerBg: "transparent",
            siderBg: palette.siderBg,
            triggerBg: "transparent",
          },
          Button: {
            primaryShadow: "none",
            defaultShadow: "none",
            dangerShadow: "none",
            defaultBorderColor: palette.buttonDefaultBorderColor,
            defaultColor: palette.buttonDefaultColor,
            defaultBg: palette.buttonDefaultBg,
            defaultHoverBg: palette.buttonDefaultHoverBg,
            defaultHoverBorderColor: palette.buttonDefaultHoverBorderColor,
            defaultHoverColor: palette.colorText,
            defaultActiveBg: palette.colorBgElevated,
            defaultActiveBorderColor: palette.colorBorder,
            borderRadius: 6,
          },
          Input: {
            activeShadow: "none",
            hoverBorderColor: palette.inputHoverBorder,
            activeBorderColor: palette.inputActiveBorder,
            borderRadius: 6,
          },
          Select: {
            optionSelectedBg: palette.selectOptionSelectedBg,
            optionActiveBg: palette.selectOptionActiveBg,
            optionSelectedFontWeight: 500,
            borderRadius: 6,
          },
          Card: {
            headerBg: "transparent",
            colorBgContainer: palette.colorBgContainer,
          },
          Menu: {
            itemBg: palette.menuItemBg,
            subMenuItemBg: "transparent",
            itemSelectedBg: palette.menuSelectedBg,
            itemSelectedColor: palette.menuSelectedColor,
            itemHoverBg: palette.menuHoverBg,
          },
          Tabs: {
            inkBarColor: palette.colorPrimary,
            itemSelectedColor: palette.colorPrimary,
            itemHoverColor: palette.colorPrimaryHover,
          },
          Typography: {
            colorTextHeading: palette.colorText,
            colorTextDescription: palette.colorTextSecondary,
            colorText: palette.colorText,
            colorTextDisabled: palette.colorTextDisabled,
          },
          Divider: {
            colorSplit: palette.colorBorder,
          },
          Alert: {
            borderRadiusLG: 8,
          },
          Modal: {
            borderRadiusLG: 12,
          },
          Drawer: {
            colorBgElevated: palette.colorBgContainer,
          },
          Progress: {
            defaultColor: palette.colorPrimary,
            remainingColor: palette.progressRemaining,
          },
          Steps: {
            iconSize: 32,
          },
          Switch: {
            trackHeight: 24,
            trackMinWidth: 44,
            innerMinMargin: 4,
            innerMaxMargin: 24,
          },
          Checkbox: {
            borderRadiusSM: 4,
          },
          Slider: {
            trackBg: palette.sliderTrack,
            trackHoverBg: palette.sliderTrackHover,
            handleSize: 18,
            handleSizeHover: 20,
            railSize: 6,
          },
          ColorPicker: {
            borderRadius: 6,
          },
          Table: {
            headerBg: palette.colorBgLayout,
            borderColor: palette.colorBorder,
            rowHoverBg: isDark ? "#1c1c1f" : "#fafafa",
          },
          Tooltip: {
            colorBgSpotlight: palette.colorBgElevated,
            colorTextLightSolid: palette.colorText,
          },
          Popover: {
            colorBgElevated: palette.colorBgElevated,
          },
          DatePicker: {
            activeBorderColor: palette.inputActiveBorder,
            hoverBorderColor: palette.inputHoverBorder,
            activeShadow: "none",
            borderRadius: 6,
          },
          Tag: {
            borderRadiusSM: 4,
          },
          Badge: {
            colorBgContainer: palette.colorBgContainer,
          },
          Dropdown: {
            borderRadiusLG: 8,
            paddingBlock: 4,
          },
        },
      }}
    >
      <div style={{ minHeight: "100vh", background: palette.appBg }}>
        {children}
      </div>
    </ConfigProvider>
  );
}
