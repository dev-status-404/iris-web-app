"use client";

import React, { useState } from "react";
import {
  Avatar,
  Button,
  Divider,
  Dropdown,
  Form,
  Input,
  Modal,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  CheckOutlined,
  PlusOutlined,
  SettingOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import {
  useCreateWorkspace,
  useSelectCurrentWorkspace,
  useWorkspaceOverview,
} from "@/features/workspace/hooks";
import type { WorkspaceMember } from "@/types/api/workspace";

const { Text } = Typography;

function workspaceInitials(name?: string | null) {
  if (!name) return "W";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Palette for deterministic avatar background colour based on workspace name. */
const AVATAR_COLORS = [
  "#f5222d", "#fa541c", "#fa8c16", "#faad14", "#a0d911",
  "#52c41a", "#13c2c2", "#1677ff", "#2f54eb", "#722ed1",
];
function avatarColor(name?: string | null) {
  if (!name) return AVATAR_COLORS[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export default function WorkspaceSwitcher() {
  const router = useRouter();
  const { data, isLoading } = useWorkspaceOverview();
  const selectMutation = useSelectCurrentWorkspace();
  const createMutation = useCreateWorkspace();
  const [createOpen, setCreateOpen] = useState(false);
  const [form] = Form.useForm<{ name: string }>();

  const overview = data?.data;
  const activeId = overview?.active_workspace?.id;
  const activeName = overview?.active_workspace?.name ?? overview?.primary_workspace?.name ?? "Workspace";
  const memberships: WorkspaceMember[] = overview?.memberships ?? [];

  const handleSwitch = (workspaceId: string) => {
    if (workspaceId === activeId) return;
    selectMutation.mutate({ workspaceId });
  };

  const handleCreate = async (values: { name: string }) => {
    createMutation.mutate(
      { name: values.name.trim() },
      {
        onSuccess: () => {
          setCreateOpen(false);
          form.resetFields();
        },
      },
    );
  };

  const dropdownContent = (
    <div
      style={{
        minWidth: 220,
        padding: "6px 0",
        background: "#1a1a2e",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      {/* Section label */}
      <div style={{ padding: "4px 14px 6px", opacity: 0.45 }}>
        <Text style={{ fontSize: 11, color: "#fff", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Workspaces
        </Text>
      </div>

      {/* Workspace list */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <Spin size="small" />
        </div>
      ) : (
        memberships.map((m) => {
          const ws = m.workspace;
          if (!ws) return null;
          const isActive = ws.id === activeId;
          return (
            <button
              key={ws.id}
              onClick={() => handleSwitch(ws.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "8px 14px",
                background: isActive ? "rgba(255,255,255,0.06)" : "transparent",
                border: "none",
                cursor: isActive ? "default" : "pointer",
                transition: "background 120ms",
                borderRadius: 8,
                margin: "2px 6px",
                boxSizing: "border-box" as const,
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <Avatar
                size={26}
                style={{
                  background: avatarColor(ws.name),
                  fontSize: 11,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {workspaceInitials(ws.name)}
              </Avatar>
              <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ws.name}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>
                  {m.role}
                </Text>
              </div>
              {isActive && (
                <CheckOutlined style={{ color: "#52c41a", fontSize: 12, flexShrink: 0 }} />
              )}
              {selectMutation.isPending && !isActive && (
                <Spin size="small" />
              )}
            </button>
          );
        })
      )}

      <Divider style={{ borderColor: "rgba(255,255,255,0.07)", margin: "6px 0" }} />

      {/* Actions */}
      <button
        onClick={() => { setCreateOpen(true); }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "calc(100% - 12px)",
          padding: "8px 14px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          borderRadius: 8,
          margin: "0 6px",
          transition: "background 120ms",
          color: "#fff",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
      >
        <PlusOutlined style={{ fontSize: 13 }} />
        <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>
          New workspace
        </Text>
      </button>

      <button
        onClick={() => router.push("/settings?tab=workspace")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "calc(100% - 12px)",
          padding: "8px 14px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          borderRadius: 8,
          margin: "0 6px",
          transition: "background 120ms",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
      >
        <SettingOutlined style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }} />
        <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
          Workspace settings
        </Text>
      </button>
    </div>
  );

  return (
    <>
      {/* Trigger button inside sidebar */}
      <Dropdown
        dropdownRender={() => dropdownContent}
        trigger={["click"]}
        placement="bottomLeft"
        overlayStyle={{ zIndex: 1100 }}
      >
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            padding: "8px 10px",
            margin: "6px 0 2px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10,
            cursor: "pointer",
            transition: "background 120ms",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.09)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
        >
          <Avatar
            size={24}
            style={{
              background: avatarColor(activeName),
              fontSize: 10,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {workspaceInitials(activeName)}
          </Avatar>

          <Text
            style={{
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              textAlign: "left",
            }}
          >
            {activeName}
          </Text>

          <SwapOutlined style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, flexShrink: 0 }} />
        </button>
      </Dropdown>

      {/* Create workspace modal */}
      <Modal
        title={
          <span style={{ fontSize: 16, fontWeight: 700 }}>
            Create a new workspace
          </span>
        }
        open={createOpen}
        onCancel={() => { setCreateOpen(false); form.resetFields(); }}
        onOk={form.submit}
        okText="Create workspace"
        confirmLoading={createMutation.isPending}
        centered
      >
        <Form form={form} onFinish={handleCreate} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Workspace name"
            rules={[
              { required: true, message: "Enter a name" },
              { min: 2, message: "Too short" },
              { max: 60, message: "Too long" },
            ]}
          >
            <Input
              placeholder="Acme sales team"
              size="large"
              autoFocus
              maxLength={60}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
