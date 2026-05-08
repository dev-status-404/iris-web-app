"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  SettingOutlined,
  UserOutlined,
  LockOutlined,
  MailOutlined,
  BugOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import { Spin, Typography, theme } from "antd";
import { useIsDark } from "@/hooks/use-is-dark";

import SettingsPreferences from "../form/general";
import ProfileForm from "../form/profile";
import PasswordSecruityForm from "../form/password-security";
import SmtpSettings from "../form/smtp";
import SupportTabContent from "../form/support";
import WorkspacePanel from "@/features/workspace/panel";

const { Text } = Typography;

type TabKey =
  | "general"
  | "profile"
  | "password_security"
  | "smtp"
  | "workspace"
  | "support";

const TABS: {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    key: "general",
    label: "General",
    icon: <SettingOutlined />,
    description: "App preferences & defaults",
  },
  {
    key: "profile",
    label: "Profile",
    icon: <UserOutlined />,
    description: "Name, avatar & bio",
  },
  {
    key: "password_security",
    label: "Password & Security",
    icon: <LockOutlined />,
    description: "Login credentials & 2FA",
  },
  {
    key: "smtp",
    label: "SMTP Accounts",
    icon: <MailOutlined />,
    description: "Email sending configuration",
  },
  {
    key: "workspace",
    label: "Workspace",
    icon: <ApartmentOutlined />,
    description: "Members, invitations & workspaces",
  },
  {
    key: "support",
    label: "Report a Bug",
    icon: <BugOutlined />,
    description: "Help & feedback",
  },
];

const CONTENT: Record<TabKey, React.ReactNode> = {
  general: <SettingsPreferences />,
  profile: <ProfileForm />,
  password_security: <PasswordSecruityForm />,
  smtp: <SmtpSettings />,
  workspace: <WorkspacePanel />,
  support: <SupportTabContent />,
};

function SettingTabsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = (searchParams.get("tab") || "general") as TabKey;
  const { token } = theme.useToken();
  const isDark = useIsDark();

  const activeTabMeta = TABS.find((t) => t.key === activeTab) ?? TABS[0];

  return (
    <div style={{ display: "flex", gap: 0, minHeight: "calc(100vh - 130px)" }}>
      {/* ── Left sidebar ── */}
      <nav
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
          paddingRight: 8,
          paddingTop: 4,
        }}
      >
        <Text
          style={{
            display: "block",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: token.colorTextQuaternary,
            padding: "0 14px 10px",
          }}
        >
          Settings
        </Text>

        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => router.replace(`/settings?tab=${tab.key}`)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "9px 14px",
                borderRadius: 9,
                border: "none",
                background: isActive
                  ? isDark ? "rgba(22,119,255,0.15)" : "#e6f4ff"
                  : "transparent",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 120ms",
                marginBottom: 2,
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLElement).style.background = token.colorFillTertiary;
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  color: isActive ? "#1677ff" : token.colorTextTertiary,
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                {tab.icon}
              </span>
              <Text
                style={{
                  color: isActive ? "#1677ff" : token.colorText,
                  fontSize: 13.5,
                  fontWeight: isActive ? 600 : 400,
                  display: "block",
                  lineHeight: 1.3,
                }}
              >
                {tab.label}
              </Text>
            </button>
          );
        })}
      </nav>

      {/* ── Content area ── */}
      <div style={{ flex: 1, paddingLeft: 36, minWidth: 0, paddingTop: 4 }}>
        {/* Section header */}
        <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
          <Text
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 20,
              fontWeight: 700,
              color: token.colorText,
              lineHeight: 1.2,
            }}
          >
            <span
              style={{
                fontSize: 18,
                color: "#1677ff",
                display: "flex",
                alignItems: "center",
              }}
            >
              {activeTabMeta.icon}
            </span>
            {activeTabMeta.label}
          </Text>
          <Text
            type="secondary"
            style={{ display: "block", fontSize: 13, marginTop: 4 }}
          >
            {activeTabMeta.description}
          </Text>
        </div>

        <Suspense
          fallback={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: 60,
              }}
            >
              <Spin size="large" />
            </div>
          }
        >
          {CONTENT[activeTab] ?? CONTENT.general}
        </Suspense>
      </div>
    </div>
  );
}

export default function SettingTabs() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 300,
          }}
        >
          <Spin size="large" />
        </div>
      }
    >
      <SettingTabsInner />
    </Suspense>
  );
}
