"use client";

import React, { useState } from "react";
import { Typography, Space, theme } from "antd";
import { PhoneOutlined, MessageOutlined } from "@ant-design/icons";
import PhoneNumbersTab from "@/features/phone-lines/ui/numbers-tab/index";
import SmsInboxTab from "@/features/phone-lines/ui/sms-inbox/index";
import { useIsDark } from "@/hooks/use-is-dark";

const { Title, Text } = Typography;

const TABS = [
  {
    key: "numbers",
    icon: <PhoneOutlined />,
    label: "Phone Numbers",
  },
  {
    key: "sms",
    icon: <MessageOutlined />,
    label: "SMS Inbox",
  },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function PhoneLinesClient() {
  const [activeTab, setActiveTab] = useState<TabKey>("numbers");
  const { token } = theme.useToken();
  const isDark = useIsDark();

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200 }}>
      {/* ── Page header ─────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, fontWeight: 800 }}>
          Phone Lines
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Manage your phone numbers and SMS conversations
        </Text>
      </div>

      {/* ── Custom tab bar ───────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 24,
          background: token.colorFillTertiary,
          borderRadius: 12,
          padding: 4,
          width: "fit-content",
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 18px",
                borderRadius: 9,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                transition: "all 140ms ease",
                background: isActive ? token.colorBgContainer : "transparent",
                color: isActive ? "#1677ff" : token.colorTextTertiary,
                boxShadow: isActive ? "0 1px 6px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ─────────────────────────────────────── */}
      {activeTab === "numbers" ? (
        <PhoneNumbersTab onSmsTabClick={() => setActiveTab("sms")} />
      ) : (
        <SmsInboxTab />
      )}
    </div>
  );
}

