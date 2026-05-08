"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Tag,
  Tabs,
  Tooltip,
  Typography,
  theme,
} from "antd";
import {
  UserAddOutlined,
  CrownOutlined,
  TeamOutlined,
  MailOutlined,
  PlusOutlined,
  EditOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  useWorkspaceOverview,
  useInviteWorkspaceMember,
  useAcceptWorkspaceInvite,
  useCreateWorkspace,
  useRemoveWorkspaceMember,
  useRenameWorkspace,
  useResendWorkspaceInvite,
  useRevokeWorkspaceInvite,
  useSelectCurrentWorkspace,
} from "./hooks";
import { useAppSelector } from "@/redux/hook";
import { getSocket } from "@/lib/socket";
import { useIsDark } from "@/hooks/use-is-dark";
import type { WorkspaceMember, WorkspaceInvite } from "@/types/api/workspace";

const { Title, Text } = Typography;

// ── helpers ──────────────────────────────────────────────────────────────────

function memberName(m: WorkspaceMember) {
  const f = m.user?.first_name || "";
  const l = m.user?.last_name || "";
  return `${f} ${l}`.trim() || m.user?.email || "Unknown";
}

function memberInitials(m: WorkspaceMember) {
  const f = m.user?.first_name?.[0]?.toUpperCase() ?? "";
  const l = m.user?.last_name?.[0]?.toUpperCase() ?? "";
  return f + l || m.user?.email?.[0]?.toUpperCase() || "?";
}

const AVATAR_PALETTE = [
  "#f5222d", "#fa541c", "#fa8c16", "#faad14",
  "#52c41a", "#13c2c2", "#1677ff", "#722ed1",
];

function memberAvatarColor(m: WorkspaceMember) {
  const str = m.user?.email || m.user?.id || "";
  let h = 0;
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[Math.abs(h)];
}

function wsInitials(name?: string | null) {
  if (!name) return "W";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const ROLE_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  owner:  { label: "Owner",  bg: "#fffbe6", text: "#d48806", icon: <CrownOutlined /> },
  admin:  { label: "Admin",  bg: "#e6f4ff", text: "#1677ff", icon: <TeamOutlined /> },
  member: { label: "Member", bg: "#f5f5f5", text: "#595959", icon: <UserAddOutlined /> },
};

const ROLE_CONFIG_DARK: Record<
  string,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  owner:  { label: "Owner",  bg: "rgba(212,136,6,0.15)",  text: "#ffd666", icon: <CrownOutlined /> },
  admin:  { label: "Admin",  bg: "rgba(22,119,255,0.15)", text: "#4096ff", icon: <TeamOutlined /> },
  member: { label: "Member", bg: "rgba(255,255,255,0.06)", text: "#a1a1aa", icon: <UserAddOutlined /> },
};

const INVITE_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  pending:  { color: "processing", label: "Pending" },
  accepted: { color: "success",    label: "Accepted" },
  revoked:  { color: "error",      label: "Revoked" },
  expired:  { color: "default",    label: "Expired" },
};

// ── MemberRow ─────────────────────────────────────────────────────────────────

function MemberRow({
  member,
  onRemove,
  removing,
}: {
  member: WorkspaceMember;
  onRemove: (id: string) => void;
  removing: boolean;
}) {
  const { token } = theme.useToken();
  const isDark = useIsDark();
  const cfg = (isDark ? ROLE_CONFIG_DARK : ROLE_CONFIG)[member.role] ?? (isDark ? ROLE_CONFIG_DARK : ROLE_CONFIG).member;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        borderRadius: 12,
        background: token.colorBgLayout,
        border: `1px solid ${token.colorBorderSecondary}`,
        transition: "box-shadow 150ms",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.boxShadow = isDark
          ? "0 2px 8px rgba(0,0,0,0.4)"
          : "0 2px 8px rgba(0,0,0,0.07)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.boxShadow = "none")
      }
    >
      <Avatar
        size={42}
        style={{
          background: memberAvatarColor(member),
          fontSize: 14,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {memberInitials(member)}
      </Avatar>

      <div style={{ flex: 1, marginLeft: 12, minWidth: 0 }}>
        <Text strong style={{ display: "block", fontSize: 14, lineHeight: 1.4 }}>
          {memberName(member)}
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {member.user?.email}
        </Text>
      </div>

      {member.joined_at && (
        <Text type="secondary" style={{ fontSize: 11, marginRight: 12, flexShrink: 0 }}>
          Joined {new Date(member.joined_at).toLocaleDateString()}
        </Text>
      )}

      <Tag
        icon={cfg.icon}
        style={{
          background: cfg.bg,
          color: cfg.text,
          border: "none",
          borderRadius: 100,
          padding: "2px 10px",
          fontWeight: 600,
          fontSize: 11,
        }}
      >
        {cfg.label}
      </Tag>

      {member.role !== "owner" && (
        <Popconfirm
          title="Remove member?"
          description="This will revoke their access to this workspace."
          onConfirm={() => onRemove(String(member.id))}
          okText="Remove"
          okButtonProps={{ danger: true }}
          placement="topRight"
        >
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            loading={removing}
            style={{ marginLeft: 8 }}
          />
        </Popconfirm>
      )}
    </div>
  );
}

// ── InviteRow ─────────────────────────────────────────────────────────────────

function InviteRow({
  invite,
  onResend,
  onRevoke,
  resending,
  revoking,
}: {
  invite: WorkspaceInvite;
  onResend: (id: string) => void;
  onRevoke: (id: string) => void;
  resending: boolean;
  revoking: boolean;
}) {
  const { token } = theme.useToken();
  const status = INVITE_STATUS_CONFIG[invite.status] ?? { color: "default", label: invite.status };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        borderRadius: 12,
        background: token.colorBgLayout,
        border: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <Avatar size={40} style={{ background: token.colorFillSecondary, color: "#1677ff", flexShrink: 0 }}>
        <MailOutlined />
      </Avatar>
      <div style={{ flex: 1, marginLeft: 12, minWidth: 0 }}>
        <Text strong style={{ display: "block", fontSize: 14 }}>
          {invite.email}
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Role: <span style={{ textTransform: "capitalize" }}>{invite.role}</span>
          {invite.expires_at && (
            <> · Expires {new Date(invite.expires_at).toLocaleDateString()}</>
          )}
        </Text>
      </div>
      <Tag color={status.color} style={{ marginRight: 8 }}>
        {status.label}
      </Tag>
      {invite.status === "pending" && (
        <Space size={4}>
          <Button
            size="small"
            type="text"
            icon={<SendOutlined />}
            onClick={() => onResend(String(invite.id))}
            loading={resending}
          >
            Resend
          </Button>
          <Popconfirm
            title="Revoke this invite?"
            onConfirm={() => onRevoke(String(invite.id))}
            okText="Revoke"
            okButtonProps={{ danger: true }}
            placement="topRight"
          >
            <Button
              size="small"
              type="text"
              danger
              icon={<CloseCircleOutlined />}
              loading={revoking}
            >
              Revoke
            </Button>
          </Popconfirm>
        </Space>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function WorkspacePanel() {
  const { token } = theme.useToken();
  const isDark = useIsDark();

  const { data, isLoading, refetch } = useWorkspaceOverview();
  const inviteMutation          = useInviteWorkspaceMember();
  const acceptInviteMutation    = useAcceptWorkspaceInvite();
  const createWorkspaceMutation = useCreateWorkspace();
  const selectWorkspaceMutation = useSelectCurrentWorkspace();
  const renameWorkspaceMutation = useRenameWorkspace();
  const resendInviteMutation    = useResendWorkspaceInvite();
  const revokeInviteMutation    = useRevokeWorkspaceInvite();
  const removeMemberMutation    = useRemoveWorkspaceMember();

  const [inviteForm] = Form.useForm();
  const [createForm] = Form.useForm();
  const [renameForm] = Form.useForm();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [innerTab, setInnerTab] = useState("members");

  const searchParams = useSearchParams();
  const pathname     = usePathname();
  const router       = useRouter();
  const inviteToken  = searchParams.get("invite");
  const handledToken = useRef<string | null>(null);
  const user         = useAppSelector((state) => state.user.user as any);
  const ws           = data?.data;

  // ── socket real-time ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    const socket = getSocket(user.id);
    if (!socket) return;

    const EVENTS = [
      "workspace.invite.created", "workspace.invite.received",
      "workspace.invite.accepted", "workspace.invite.revoked",
      "workspace.invite.resent",  "workspace.member.joined",
      "workspace.member.removed", "workspace.current.changed",
      "workspace.created",        "workspace.updated",
    ];
    const handler = () => refetch();
    EVENTS.forEach((e) => socket.on(e, handler));
    socket.on("event", (p: any) => { if (EVENTS.includes(p?.type || p)) refetch(); });
    return () => {
      EVENTS.forEach((e) => socket.off(e, handler));
      socket.off("event");
    };
  }, [refetch, user?.id]);

  // ── auto-accept invite token ──────────────────────────────────────────────
  useEffect(() => {
    if (!inviteToken || handledToken.current === inviteToken) return;
    if (!user?.id || acceptInviteMutation.isPending) return;
    handledToken.current = inviteToken;
    acceptInviteMutation.mutate(
      { token: inviteToken },
      { onSuccess: () => router.replace(pathname) },
    );
  }, [acceptInviteMutation, inviteToken, pathname, router, user?.id]);

  const members        = ws?.members         || [];
  const memberships    = ws?.memberships     || [];
  const sentInvites    = ws?.sent_invites    || [];
  const pendingInvites = ws?.pending_invites || [];
  const activeWsId     = ws?.active_workspace?.id;
  const activeWsName   = ws?.active_workspace?.name || ws?.primary_workspace?.name;

  const pendingSentCount = sentInvites.filter((i) => i.status === "pending").length;

  const myRole = useMemo(
    () => members.find((m) => m.user?.id === user?.id)?.role ?? "member",
    [members, user?.id],
  );
  const myRoleCfg = (isDark ? ROLE_CONFIG_DARK : ROLE_CONFIG)[myRole] ?? (isDark ? ROLE_CONFIG_DARK : ROLE_CONFIG).member;

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 280 }}>
        <Spin size="large" />
      </div>
    );
  }

  // Derived accent colours that adapt to dark mode
  const blueBg = isDark ? "rgba(22,119,255,0.15)" : "#e6f4ff";
  const greenBg = isDark ? "rgba(82,196,26,0.1)" : "#f6ffed";
  const greenBorder = isDark ? "rgba(82,196,26,0.3)" : "#b7eb8f";
  const inviteCardBg = isDark ? "rgba(22,119,255,0.06)" : "#f8faff";
  const inviteCardBorder = isDark ? "rgba(22,119,255,0.2)" : "#d6e4ff";

  return (
    <div style={{ maxWidth: 820 }}>
      {/* ── invite-token banner ── */}
      {inviteToken && (
        <Alert
          type="info"
          showIcon
          message="Workspace invite detected"
          description="This invite will be accepted automatically for the signed-in account if the email matches."
          style={{ marginBottom: 20, borderRadius: 10 }}
        />
      )}

      {/* ── workspace header card ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #1677ff 0%, #0550ae 100%)",
          borderRadius: 16,
          padding: "24px 28px",
          marginBottom: 28,
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <Avatar
          size={58}
          style={{
            background: "rgba(255,255,255,0.2)",
            fontSize: 22,
            fontWeight: 800,
            flexShrink: 0,
            border: "2px solid rgba(255,255,255,0.3)",
          }}
        >
          {wsInitials(activeWsName)}
        </Avatar>

        <div style={{ flex: 1, minWidth: 0 }}>
          <Title
            level={4}
            style={{ color: "#fff", margin: 0, fontWeight: 700, lineHeight: 1.2 }}
          >
            {activeWsName || "No workspace selected"}
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>
            {ws?.active_workspace?.slug || ws?.primary_workspace?.slug || "—"}
          </Text>
          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Tag
              icon={myRoleCfg.icon}
              style={{
                background: "rgba(255,255,255,0.18)",
                border: "none",
                color: "#fff",
                borderRadius: 100,
                fontWeight: 600,
              }}
            >
              {myRoleCfg.label}
            </Tag>
            <Tag style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "rgba(255,255,255,0.85)", borderRadius: 100 }}>
              {members.length} member{members.length !== 1 ? "s" : ""}
            </Tag>
            {pendingSentCount > 0 && (
              <Tag style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "rgba(255,255,255,0.85)", borderRadius: 100 }}>
                {pendingSentCount} pending invite{pendingSentCount !== 1 ? "s" : ""}
              </Tag>
            )}
            <Tag style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "rgba(255,255,255,0.85)", borderRadius: 100 }}>
              {memberships.length} workspace{memberships.length !== 1 ? "s" : ""}
            </Tag>
          </div>
        </div>

        <Space>
          <Tooltip title="Rename workspace">
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                renameForm.setFieldsValue({ name: activeWsName });
                setShowRenameModal(true);
              }}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#fff",
              }}
            />
          </Tooltip>
          <Button
            icon={<PlusOutlined />}
            onClick={() => setShowCreateModal(true)}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            New workspace
          </Button>
        </Space>
      </div>

      {/* ── inner tabs ── */}
      <Tabs
        activeKey={innerTab}
        onChange={setInnerTab}
        size="small"
        items={[
          // ── MEMBERS ──────────────────────────────────────────────────────
          {
            key: "members",
            label: (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <TeamOutlined />
                Members
                <Tag style={{ borderRadius: 100, fontSize: 11, lineHeight: "18px", padding: "0 7px", margin: 0 }}>
                  {members.length}
                </Tag>
              </span>
            ),
            children: (
              <div style={{ paddingTop: 16 }}>
                {members.length ? (
                  <Space direction="vertical" size={8} style={{ width: "100%" }}>
                    {members.map((m) => (
                      <MemberRow
                        key={m.id}
                        member={m}
                        onRemove={(id) => removeMemberMutation.mutate(id)}
                        removing={removeMemberMutation.isPending}
                      />
                    ))}
                  </Space>
                ) : (
                  <Empty description="No members in this workspace yet" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginTop: 24 }} />
                )}
              </div>
            ),
          },

          // ── INVITATIONS ───────────────────────────────────────────────────
          {
            key: "invitations",
            label: (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <MailOutlined />
                Invitations
                {pendingSentCount > 0 && (
                  <Badge count={pendingSentCount} size="small" style={{ marginLeft: 4 }} />
                )}
              </span>
            ),
            children: (
              <div style={{ paddingTop: 16 }}>
                {/* send invite card */}
                <div
                  style={{
                    background: inviteCardBg,
                    border: `1px solid ${inviteCardBorder}`,
                    borderRadius: 12,
                    padding: "20px 20px 16px",
                    marginBottom: 28,
                  }}
                >
                  <Text
                    strong
                    style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, marginBottom: 14, color: "#1677ff" }}
                  >
                    <UserAddOutlined />
                    Invite a teammate
                  </Text>
                  <Form
                    form={inviteForm}
                    layout="inline"
                    onFinish={(v) => {
                      inviteMutation.mutate({ email: v.email, role: v.role || "member" });
                      inviteForm.resetFields();
                    }}
                    style={{ flexWrap: "wrap", gap: 8 }}
                  >
                    <Form.Item
                      name="email"
                      rules={[
                        { required: true, message: "Email required" },
                        { type: "email", message: "Enter a valid email" },
                      ]}
                      style={{ flex: 1, minWidth: 220, marginBottom: 8 }}
                    >
                      <Input placeholder="teammate@company.com" prefix={<MailOutlined style={{ color: token.colorTextTertiary }} />} />
                    </Form.Item>
                    <Form.Item name="role" initialValue="member" style={{ width: 130, marginBottom: 8 }}>
                      <Select
                        options={[
                          { label: "Member", value: "member" },
                          { label: "Admin",  value: "admin" },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 8 }}>
                      <Button
                        htmlType="submit"
                        type="primary"
                        icon={<SendOutlined />}
                        loading={inviteMutation.isPending}
                        disabled={!ws?.primary_workspace}
                      >
                        Send invite
                      </Button>
                    </Form.Item>
                  </Form>
                </div>

                {/* pending invites received */}
                {pendingInvites.length > 0 && (
                  <div style={{ marginBottom: 28 }}>
                    <Text
                      type="secondary"
                      style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 10 }}
                    >
                      Received invites
                    </Text>
                    <Space direction="vertical" size={8} style={{ width: "100%" }}>
                      {pendingInvites.map((inv) => (
                        <div
                          key={inv.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "12px 16px",
                            borderRadius: 12,
                            background: greenBg,
                            border: `1px solid ${greenBorder}`,
                          }}
                        >
                          <Avatar size={40} style={{ background: isDark ? "rgba(82,196,26,0.2)" : "#d9f7be", color: "#389e0d", flexShrink: 0 }}>
                            <MailOutlined />
                          </Avatar>
                          <div style={{ flex: 1, marginLeft: 12, minWidth: 0 }}>
                            <Text strong style={{ display: "block" }}>
                              {inv.workspace?.name || "Workspace invite"}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              from {inv.invited_by_user?.email || "workspace owner"}
                            </Text>
                          </div>
                          <Button
                            type="primary"
                            size="small"
                            icon={<CheckCircleOutlined />}
                            loading={acceptInviteMutation.isPending}
                            onClick={() => acceptInviteMutation.mutate({ token: inviteToken || "" })}
                            disabled={!inviteToken}
                          >
                            Accept
                          </Button>
                        </div>
                      ))}
                    </Space>
                  </div>
                )}

                {/* sent invites */}
                <div>
                  <Text
                    type="secondary"
                    style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 10 }}
                  >
                    Sent invites
                  </Text>
                  {sentInvites.length ? (
                    <Space direction="vertical" size={8} style={{ width: "100%" }}>
                      {sentInvites.map((inv) => (
                        <InviteRow
                          key={inv.id}
                          invite={inv}
                          onResend={(id) => resendInviteMutation.mutate(id)}
                          onRevoke={(id) => revokeInviteMutation.mutate(id)}
                          resending={resendInviteMutation.isPending}
                          revoking={revokeInviteMutation.isPending}
                        />
                      ))}
                    </Space>
                  ) : (
                    <Empty description="No invites sent yet" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginTop: 16 }} />
                  )}
                </div>
              </div>
            ),
          },

          // ── MY WORKSPACES ─────────────────────────────────────────────────
          {
            key: "workspaces",
            label: (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <SwapOutlined />
                My Workspaces
                <Tag style={{ borderRadius: 100, fontSize: 11, lineHeight: "18px", padding: "0 7px", margin: 0 }}>
                  {memberships.length}
                </Tag>
              </span>
            ),
            children: (
              <div style={{ paddingTop: 16 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
                    gap: 12,
                  }}
                >
                  {memberships.map((m) => {
                    const isActive = String(m.workspace?.id) === String(activeWsId);
                    const initials = wsInitials(m.workspace?.name);
                    const cardBg = isActive ? blueBg : token.colorBgLayout;
                    const cardBorder = isActive ? "2px solid #1677ff" : `1px solid ${token.colorBorderSecondary}`;
                    const nameColor = isActive ? (isDark ? "#4096ff" : "#0550ae") : token.colorText;
                    return (
                      <div
                        key={m.id}
                        style={{
                          padding: 16,
                          borderRadius: 14,
                          border: cardBorder,
                          background: cardBg,
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                          transition: "box-shadow 150ms",
                          boxShadow: isActive ? `0 0 0 4px ${isDark ? "rgba(22,119,255,0.12)" : "rgba(22,119,255,0.08)"}` : "none",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive)
                            (e.currentTarget as HTMLElement).style.boxShadow = isDark
                              ? "0 2px 10px rgba(0,0,0,0.4)"
                              : "0 2px 10px rgba(0,0,0,0.07)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) (e.currentTarget as HTMLElement).style.boxShadow = "none";
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <Avatar
                            size={36}
                            style={{ background: isActive ? "#1677ff" : token.colorFillSecondary, fontWeight: 700, flexShrink: 0 }}
                          >
                            {initials}
                          </Avatar>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Text
                              strong
                              style={{
                                display: "block",
                                fontSize: 14,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                color: nameColor,
                              }}
                            >
                              {m.workspace?.name || "Workspace"}
                            </Text>
                            <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                              {isActive && <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>Active</Tag>}
                              {m.workspace?.is_personal && <Tag style={{ margin: 0, fontSize: 11 }}>Personal</Tag>}
                              <Tag style={{ margin: 0, fontSize: 11, textTransform: "capitalize" }}>{m.role}</Tag>
                            </div>
                          </div>
                        </div>

                        {!isActive && (
                          <Button
                            size="small"
                            block
                            icon={<SwapOutlined />}
                            loading={selectWorkspaceMutation.isPending}
                            onClick={() =>
                              selectWorkspaceMutation.mutate({ workspaceId: String(m.workspace?.id || "") })
                            }
                          >
                            Switch to this
                          </Button>
                        )}
                      </div>
                    );
                  })}

                  {/* new workspace card */}
                  <button
                    onClick={() => setShowCreateModal(true)}
                    style={{
                      padding: 16,
                      borderRadius: 14,
                      border: `1.5px dashed ${token.colorBorder}`,
                      background: "transparent",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      minHeight: 100,
                      transition: "border-color 150ms, background 150ms",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "#1677ff";
                      (e.currentTarget as HTMLElement).style.background = isDark
                        ? "rgba(22,119,255,0.08)"
                        : "#f0f7ff";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = token.colorBorder;
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <Avatar size={36} style={{ background: token.colorFillSecondary, color: token.colorTextTertiary }}>
                      <PlusOutlined />
                    </Avatar>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      New workspace
                    </Text>
                  </button>
                </div>
              </div>
            ),
          },
        ]}
      />

      {/* ── create workspace modal ── */}
      <Modal
        title={<><PlusOutlined style={{ marginRight: 8, color: "#1677ff" }} />Create a new workspace</>}
        open={showCreateModal}
        onCancel={() => { setShowCreateModal(false); createForm.resetFields(); }}
        footer={null}
        destroyOnClose
        width={420}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={(v) =>
            createWorkspaceMutation.mutate(
              { name: v.name },
              { onSuccess: () => { setShowCreateModal(false); createForm.resetFields(); } },
            )
          }
          style={{ marginTop: 20 }}
        >
          <Form.Item
            label="Workspace name"
            name="name"
            rules={[
              { required: true, message: "Name is required" },
              { min: 2, message: "Name must be at least 2 characters" },
            ]}
          >
            <Input placeholder="Acme sales ops" size="large" autoFocus />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => { setShowCreateModal(false); createForm.resetFields(); }}>Cancel</Button>
              <Button htmlType="submit" type="primary" loading={createWorkspaceMutation.isPending}>
                Create workspace
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ── rename workspace modal ── */}
      <Modal
        title={<><EditOutlined style={{ marginRight: 8, color: "#1677ff" }} />Rename workspace</>}
        open={showRenameModal}
        onCancel={() => { setShowRenameModal(false); renameForm.resetFields(); }}
        footer={null}
        destroyOnClose
        width={420}
      >
        <Form
          form={renameForm}
          layout="vertical"
          onFinish={(v) =>
            renameWorkspaceMutation.mutate(
              { workspaceId: activeWsId!, name: v.name },
              { onSuccess: () => { setShowRenameModal(false); renameForm.resetFields(); } },
            )
          }
          style={{ marginTop: 20 }}
        >
          <Form.Item
            label="Workspace name"
            name="name"
            rules={[
              { required: true, message: "Name is required" },
              { min: 2, message: "Name must be at least 2 characters" },
            ]}
          >
            <Input size="large" autoFocus />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => { setShowRenameModal(false); renameForm.resetFields(); }}>Cancel</Button>
              <Button htmlType="submit" type="primary" loading={renameWorkspaceMutation.isPending} disabled={!activeWsId}>
                Save name
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
