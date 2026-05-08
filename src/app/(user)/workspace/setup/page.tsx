"use client";

import React, { useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Divider,
  Form,
  Input,
  List,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ArrowRightOutlined,
  CheckCircleFilled,
  TeamOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import {
  useCreateWorkspace,
  useSelectCurrentWorkspace,
  useWorkspaceOverview,
} from "@/features/workspace/hooks";
import { useUserInfo } from "@/helpers/use-user";
import type { WorkspaceMember } from "@/types/api/workspace";

const { Title, Text, Paragraph } = Typography;

const FEATURES = [
  "Manage leads & campaigns",
  "Inbound & outbound calls",
  "SMS conversations",
  "Team collaboration",
];

function WorkspaceAvatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <Avatar
      size={40}
      style={{ background: "linear-gradient(135deg, #fd746c, #ff9068)", fontWeight: 700, fontSize: 16 }}
    >
      {initials || "W"}
    </Avatar>
  );
}

export default function WorkspaceSetupPage() {
  const router = useRouter();
  const { firstName } = useUserInfo();
  const { data, isLoading: overviewLoading } = useWorkspaceOverview();
  const createMutation = useCreateWorkspace();
  const selectMutation = useSelectCurrentWorkspace();
  const [form] = Form.useForm<{ name: string }>();
  const [step, setStep] = useState<"choose" | "create">("choose");

  const overview = data?.data;
  const memberships: WorkspaceMember[] = overview?.memberships ?? [];
  const existingWorkspaces = memberships.filter((m) => m.workspace);
  const hasExisting = existingWorkspaces.length > 0;

  const redirect = () => router.replace("/dashboard");

  const handleSelect = (workspaceId: string) => {
    selectMutation.mutate(
      { workspaceId },
      { onSuccess: redirect },
    );
  };

  const handleCreate = (values: { name: string }) => {
    createMutation.mutate(
      { name: values.name.trim() },
      { onSuccess: redirect },
    );
  };

  if (overviewLoading) {
    return (
      <div style={shellStyle}>
        <Spin size="large" />
      </div>
    );
  }

  // If the user already has workspaces, jump to "choose" view by default
  const showCreate = step === "create" || !hasExisting;

  return (
    <div style={shellStyle}>
      {/* Left panel — branding */}
      <div style={leftPanelStyle}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 900, background: "linear-gradient(90deg,#fd746c,#ff9068)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent", marginBottom: 8 }}>
            iriscalls
          </div>
          <Title level={2} style={{ color: "#fff", margin: "0 0 12px", fontWeight: 800, lineHeight: 1.2 }}>
            Your workspace,<br />your rules.
          </Title>
          <Paragraph style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, maxWidth: 300 }}>
            Everything you need to manage your pipeline in one place.
          </Paragraph>
        </div>

        <ul style={{ listStyle: "none", padding: 0, margin: "32px 0 0" }}>
          {FEATURES.map((f) => (
            <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <CheckCircleFilled style={{ color: "#52c41a", fontSize: 16 }} />
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>{f}</Text>
            </li>
          ))}
        </ul>
      </div>

      {/* Right panel — form */}
      <div style={rightPanelStyle}>
        <Card style={cardStyle} styles={{ body: { padding: "40px 36px" } }}>
          {/* Header */}
          <Space direction="vertical" size={4} style={{ marginBottom: 32 }}>
            <Title level={3} style={{ margin: 0 }}>
              {firstName ? `Welcome, ${firstName}! 👋` : "Welcome! 👋"}
            </Title>
            <Text type="secondary" style={{ fontSize: 15 }}>
              {showCreate
                ? "Set up your workspace to get started."
                : "Pick a workspace or create a new one."}
            </Text>
          </Space>

          {/* Existing workspaces list */}
          {!showCreate && hasExisting && (
            <>
              <List
                dataSource={existingWorkspaces}
                renderItem={(m) => {
                  const ws = m.workspace!;
                  return (
                    <List.Item
                      style={wsItemStyle}
                      onClick={() => handleSelect(ws.id)}
                    >
                      <List.Item.Meta
                        avatar={<WorkspaceAvatar name={ws.name} />}
                        title={
                          <Text strong style={{ fontSize: 14 }}>{ws.name}</Text>
                        }
                        description={
                          <Space size={6}>
                            <Tag style={{ fontSize: 11 }}>{m.role}</Tag>
                            {ws.is_personal && <Tag color="purple" style={{ fontSize: 11 }}>Personal</Tag>}
                          </Space>
                        }
                      />
                      {selectMutation.isPending ? (
                        <Spin size="small" />
                      ) : (
                        <ArrowRightOutlined style={{ color: "#8c8c8c" }} />
                      )}
                    </List.Item>
                  );
                }}
              />

              <Divider>
                <Text type="secondary" style={{ fontSize: 12 }}>or</Text>
              </Divider>

              <Button
                block
                size="large"
                icon={<TeamOutlined />}
                onClick={() => setStep("create")}
                style={{ borderRadius: 10, height: 48 }}
              >
                Create a new workspace
              </Button>
            </>
          )}

          {/* Create workspace form */}
          {showCreate && (
            <>
              {hasExisting && (
                <Button
                  type="link"
                  style={{ padding: "0 0 16px", fontSize: 13 }}
                  onClick={() => setStep("choose")}
                >
                  ← Back to my workspaces
                </Button>
              )}

              <Form
                form={form}
                layout="vertical"
                onFinish={handleCreate}
                requiredMark={false}
              >
                <Form.Item
                  name="name"
                  label={
                    <Text strong style={{ fontSize: 14 }}>
                      Workspace name
                    </Text>
                  }
                  rules={[
                    { required: true, message: "Give your workspace a name" },
                    { min: 2, message: "Too short — at least 2 characters" },
                    { max: 60, message: "Max 60 characters" },
                  ]}
                  extra={
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      This is usually your company or team name.
                    </Text>
                  }
                >
                  <Input
                    size="large"
                    placeholder="Acme sales team"
                    autoFocus
                    maxLength={60}
                    style={{ borderRadius: 10 }}
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={createMutation.isPending}
                  icon={<ThunderboltOutlined />}
                  style={{
                    borderRadius: 10,
                    height: 48,
                    fontSize: 15,
                    fontWeight: 700,
                    marginTop: 8,
                    background: "linear-gradient(90deg,#fd746c,#ff9068)",
                    border: "none",
                  }}
                >
                  Create workspace
                </Button>
              </Form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const shellStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
};

const leftPanelStyle: React.CSSProperties = {
  display: "none",
  flexDirection: "column",
  justifyContent: "center",
  padding: "60px 48px",
  maxWidth: 380,
  // shown only on larger screens via media query — handled via className below
};

const rightPanelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "32px 16px",
  width: "100%",
  maxWidth: 480,
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 20,
  boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const wsItemStyle: React.CSSProperties = {
  cursor: "pointer",
  padding: "12px 14px",
  borderRadius: 10,
  marginBottom: 6,
  transition: "background 120ms",
  border: "1px solid #f0f0f0",
};
