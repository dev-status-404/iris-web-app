"use client";

import React, { useEffect } from "react";
import {
  Badge,
  Button,
  Card,
  Divider,
  Popconfirm,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  DisconnectOutlined,
  LinkOutlined,
  MailOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { useGoogleStatus, useDisconnectGoogle, useGoogleAuthUrl } from "./hooks/google";
import { useFetchSmtpAccounts } from "@/features/settings/hooks/smtp";
import { useIsDark } from "@/hooks/use-is-dark";

const { Title, Text, Paragraph } = Typography;

// ─── Individual integration card ────────────────────────────────────────────

interface IntegrationCardProps {
  logo: React.ReactNode;
  title: string;
  description: string;
  connected: boolean;
  loading?: boolean;
  onConnect: () => void;
  onDisconnect?: () => void;
  disconnecting?: boolean;
  extra?: React.ReactNode;
}

function IntegrationCard({
  logo,
  title,
  description,
  connected,
  loading,
  onConnect,
  onDisconnect,
  disconnecting,
  extra,
}: IntegrationCardProps) {
  const isDark = useIsDark();

  return (
    <Card
      style={{
        borderRadius: 16,
        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e8e8"}`,
        background: isDark ? "#1a1a2e" : "#fafafa",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        height: "100%",
      }}
      bodyStyle={{ padding: 24 }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        {/* Logo */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            background: isDark ? "rgba(255,255,255,0.06)" : "#f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: 28,
          }}
        >
          {logo}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <Text strong style={{ fontSize: 16 }}>
              {title}
            </Text>
            {connected ? (
              <Tag color="success" icon={<CheckCircleOutlined />}>
                Connected
              </Tag>
            ) : (
              <Tag color="default">Not connected</Tag>
            )}
          </div>

          <Paragraph
            type="secondary"
            style={{ fontSize: 13, marginBottom: extra ? 12 : 16 }}
          >
            {description}
          </Paragraph>

          {extra && <div style={{ marginBottom: 16 }}>{extra}</div>}

          <Space>
            {!connected ? (
              <Button
                type="primary"
                icon={<LinkOutlined />}
                loading={loading}
                onClick={onConnect}
              >
                Connect
              </Button>
            ) : (
              onDisconnect && (
                <Popconfirm
                  title="Disconnect integration?"
                  description="You can reconnect at any time."
                  onConfirm={onDisconnect}
                  okText="Disconnect"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    danger
                    icon={<DisconnectOutlined />}
                    loading={disconnecting}
                  >
                    Disconnect
                  </Button>
                </Popconfirm>
              )
            )}
          </Space>
        </div>
      </div>
    </Card>
  );
}

// ─── Google SVG logo ─────────────────────────────────────────────────────────

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GmailLogo() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28">
      <path
        fill="#EA4335"
        d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
      />
    </svg>
  );
}

function CalendarLogo() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28">
      <path fill="#4285F4" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
      <path fill="#34A853" d="M7 11h5v5H7z" />
    </svg>
  );
}

function SheetsLogo() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28">
      <path
        fill="#34A853"
        d="M19.7 3H14.5V1h-5v2H4.3C3 3 2 4 2 5.3v13.4C2 20 3 21 4.3 21h15.4C21 21 22 20 22 18.7V5.3C22 4 21 3 19.7 3zM9 16H6v-2h3v2zm0-4H6v-2h3v2zm0-4H6V6h3v2zm9 8h-7v-2h7v2zm0-4h-7v-2h7v2zm0-4h-7V6h7v2z"
      />
    </svg>
  );
}

// ─── Main Integrations Page ───────────────────────────────────────────────────

export default function IntegrationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDark = useIsDark();

  const { data: googleStatusData, isLoading: statusLoading, refetch: refetchStatus } = useGoogleStatus();
  const { refetch: getAuthUrl, isFetching: authUrlLoading } = useGoogleAuthUrl();
  const { mutate: disconnect, isPending: disconnecting } = useDisconnectGoogle();
  const { data: smtpData, isLoading: smtpLoading } = useFetchSmtpAccounts();

  const googleConnected = googleStatusData?.data?.connected ?? false;
  const smtpAccounts = (smtpData as any)?.data ?? [];
  const activeSmtpCount = smtpAccounts.filter((a: any) => a.active).length;
  const smtpConnected = activeSmtpCount > 0;

  // Handle redirect back from Google OAuth
  useEffect(() => {
    const gc = searchParams.get("google_connected");
    if (gc === "true") {
      message.success("Google account connected successfully!");
      refetchStatus();
    } else if (gc === "false") {
      const err = searchParams.get("error");
      message.error(`Failed to connect Google: ${err ?? "unknown error"}`);
    }
  }, [searchParams, refetchStatus]);

  const handleConnectGoogle = async () => {
    const result = await getAuthUrl();
    const url = result.data?.data?.url;
    if (url) {
      window.location.href = url;
    } else {
      message.error("Could not get Google auth URL. Check server configuration.");
    }
  };

  const handleDisconnectGoogle = () => {
    disconnect(undefined, {
      onSuccess: () => message.success("Google account disconnected."),
      onError: () => message.error("Failed to disconnect Google."),
    });
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={4} style={{ margin: 0, fontWeight: 800 }}>
          Integrations
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Connect external services to unlock automations, email sending, and calendar sync.
        </Text>
      </div>

      {/* ── Email ──────────────────────────────────────────────────────────── */}
      <Text
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: isDark ? "rgba(255,255,255,0.35)" : "#999",
        }}
      >
        Email
      </Text>
      <Divider style={{ marginTop: 8, marginBottom: 16 }} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
          marginBottom: 40,
        }}
      >
        <IntegrationCard
          logo={<GmailLogo />}
          title="SMTP / Gmail"
          description="Connect your email account (Gmail, Outlook, custom SMTP) to send campaigns and view your inbox inside Iris."
          connected={smtpConnected}
          loading={smtpLoading}
          onConnect={() => router.push("/settings?tab=smtp")}
          extra={
            smtpConnected ? (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {activeSmtpCount} active account{activeSmtpCount !== 1 ? "s" : ""} · view your{" "}
                <a onClick={() => router.push("/emails")} style={{ cursor: "pointer" }}>
                  inbox
                </a>
              </Text>
            ) : undefined
          }
        />
      </div>

      {/* ── Google ──────────────────────────────────────────────────────────── */}
      <Text
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: isDark ? "rgba(255,255,255,0.35)" : "#999",
        }}
      >
        Google Workspace
      </Text>
      <Divider style={{ marginTop: 8, marginBottom: 16 }} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
          marginBottom: 40,
        }}
      >
        {/* Google Calendar */}
        <IntegrationCard
          logo={<CalendarLogo />}
          title="Google Calendar"
          description="Sync key dates and appointments directly with your Google Calendar. Let Iris create and manage events for you."
          connected={googleConnected}
          loading={statusLoading || authUrlLoading}
          onConnect={handleConnectGoogle}
          onDisconnect={handleDisconnectGoogle}
          disconnecting={disconnecting}
        />

        {/* Google Sheets */}
        <IntegrationCard
          logo={<SheetsLogo />}
          title="Google Sheets"
          description="Export leads, campaign results, and reports to Google Sheets automatically for analysis and sharing."
          connected={googleConnected}
          loading={statusLoading || authUrlLoading}
          onConnect={handleConnectGoogle}
          onDisconnect={handleDisconnectGoogle}
          disconnecting={disconnecting}
          extra={
            googleConnected ? (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Connected via the same Google account as Calendar.
              </Text>
            ) : undefined
          }
        />

        {/* Gmail OAuth (future) */}
        <IntegrationCard
          logo={<GoogleLogo />}
          title="Gmail OAuth"
          description="Connect Gmail via OAuth for enhanced deliverability and automatic inbox sync — no SMTP password needed."
          connected={false}
          loading={false}
          onConnect={() =>
            message.info("Gmail OAuth is coming soon. Use SMTP for now.")
          }
        />
      </div>
    </div>
  );
}
