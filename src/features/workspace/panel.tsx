"use client";

import React, { useEffect, useMemo, useRef } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  List,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
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

const { Title, Text } = Typography;

function formatMemberName(member: any) {
  const firstName = member?.user?.first_name || "";
  const lastName = member?.user?.last_name || "";
  return `${firstName} ${lastName}`.trim() || member?.user?.email || "Unknown user";
}

export default function WorkspacePanel() {
  const { data, isLoading, refetch } = useWorkspaceOverview();
  const inviteMutation = useInviteWorkspaceMember();
  const acceptInviteMutation = useAcceptWorkspaceInvite();
  const createWorkspaceMutation = useCreateWorkspace();
  const selectWorkspaceMutation = useSelectCurrentWorkspace();
  const renameWorkspaceMutation = useRenameWorkspace();
  const resendInviteMutation = useResendWorkspaceInvite();
  const revokeInviteMutation = useRevokeWorkspaceInvite();
  const removeMemberMutation = useRemoveWorkspaceMember();
  const [form] = Form.useForm();
  const [workspaceForm] = Form.useForm();
  const [renameForm] = Form.useForm();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const inviteToken = searchParams.get("invite");
  const handledInviteToken = useRef<string | null>(null);
  const user = useAppSelector((state) => state.user.user as any);
  const workspaceOverview = data?.data;

  useEffect(() => {
    if (!user?.id) return;

    const socket = getSocket(user.id);
    if (!socket) return;

    const refreshWorkspace = (payload: any) => {
      const eventType = payload?.type || payload;
      if (
        eventType === "workspace.invite.created" ||
        eventType === "workspace.invite.received" ||
        eventType === "workspace.invite.accepted" ||
        eventType === "workspace.invite.revoked" ||
        eventType === "workspace.invite.resent" ||
        eventType === "workspace.member.joined" ||
        eventType === "workspace.member.removed" ||
        eventType === "workspace.current.changed" ||
        eventType === "workspace.created" ||
        eventType === "workspace.updated"
      ) {
        refetch();
      }
    };

    socket.on("event", refreshWorkspace);
    socket.on("workspace.invite.created", refetch);
    socket.on("workspace.invite.received", refetch);
    socket.on("workspace.invite.accepted", refetch);
    socket.on("workspace.invite.revoked", refetch);
    socket.on("workspace.invite.resent", refetch);
    socket.on("workspace.member.joined", refetch);
    socket.on("workspace.member.removed", refetch);
    socket.on("workspace.current.changed", refetch);
    socket.on("workspace.created", refetch);
    socket.on("workspace.updated", refetch);

    return () => {
      socket.off("event", refreshWorkspace);
      socket.off("workspace.invite.created", refetch);
      socket.off("workspace.invite.received", refetch);
      socket.off("workspace.invite.accepted", refetch);
      socket.off("workspace.invite.revoked", refetch);
      socket.off("workspace.invite.resent", refetch);
      socket.off("workspace.member.joined", refetch);
      socket.off("workspace.member.removed", refetch);
      socket.off("workspace.current.changed", refetch);
      socket.off("workspace.created", refetch);
      socket.off("workspace.updated", refetch);
    };
  }, [refetch, user?.id]);

  useEffect(() => {
    if (!inviteToken || handledInviteToken.current === inviteToken) return;
    if (!user?.id || acceptInviteMutation.isPending) return;

    handledInviteToken.current = inviteToken;
    acceptInviteMutation.mutate(
      { token: inviteToken },
      {
        onSuccess: () => {
          router.replace(pathname);
        },
      },
    );
  }, [acceptInviteMutation, inviteToken, pathname, router, user?.id]);

  const memberships = workspaceOverview?.memberships || [];
  const members = workspaceOverview?.members || [];
  const sentInvites = workspaceOverview?.sent_invites || [];
  const pendingInvites = workspaceOverview?.pending_invites || [];
  const activeWorkspaceId = workspaceOverview?.active_workspace?.id;

  const inviteHint = useMemo(() => {
    if (workspaceOverview?.primary_workspace) {
      return `Inviting into ${workspaceOverview.active_workspace?.name || workspaceOverview.primary_workspace.name}`;
    }

    return "A personal workspace will appear after your first successful signup/login sync.";
  }, [workspaceOverview?.primary_workspace]);

  const onInvite = (values: { email: string; role?: "admin" | "member" }) => {
    inviteMutation.mutate({
      email: values.email,
      role: values.role || "member",
    });
    form.resetFields();
  };

  const onCreateWorkspace = (values: { name: string }) => {
    createWorkspaceMutation.mutate(
      { name: values.name },
      {
        onSuccess: () => {
          workspaceForm.resetFields();
        },
      },
    );
  };

  const onRenameWorkspace = (values: { name: string }) => {
    if (!activeWorkspaceId) return;

    renameWorkspaceMutation.mutate(
      { workspaceId: activeWorkspaceId, name: values.name },
      {
        onSuccess: () => {
          renameForm.resetFields();
        },
      },
    );
  };

  const onSelectWorkspace = (workspaceId: string) => {
    selectWorkspaceMutation.mutate({ workspaceId });
  };

  const onRemoveMember = (membershipId: string) => {
    removeMemberMutation.mutate(membershipId);
  };

  const onResendInvite = (inviteId: string) => {
    resendInviteMutation.mutate(inviteId);
  };

  const onRevokeInvite = (inviteId: string) => {
    revokeInviteMutation.mutate(inviteId);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      {inviteToken ? (
        <Alert
          type="info"
          showIcon
          message="Workspace invite detected"
          description="This invite will be accepted automatically for the signed-in account if the email matches."
        />
      ) : null}

      <Card>
        <Space direction="vertical" size={6}>
          <Title level={3} style={{ margin: 0 }}>
            {workspaceOverview?.active_workspace?.name || workspaceOverview?.primary_workspace?.name || "Workspace"}
          </Title>
          <Text type="secondary">{inviteHint}</Text>
          <Space wrap>
            <Tag color="blue">{members.length} members</Tag>
            <Tag color="geekblue">{memberships.length} active memberships</Tag>
            <Tag color="purple">{sentInvites.length} pending sent invites</Tag>
          </Space>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Create workspace">
            <Form form={workspaceForm} layout="vertical" onFinish={onCreateWorkspace}>
              <Form.Item
                label="Workspace name"
                name="name"
                rules={[
                  { required: true, message: "Workspace name is required" },
                  { min: 2, message: "Workspace name is too short" },
                ]}
              >
                <Input placeholder="Acme sales ops" />
              </Form.Item>

              <Button
                htmlType="submit"
                type="primary"
                loading={createWorkspaceMutation.isPending}
              >
                Create workspace
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Rename current workspace">
            <Form
              form={renameForm}
              layout="vertical"
              onFinish={onRenameWorkspace}
              initialValues={{ name: workspaceOverview?.active_workspace?.name }}
              key={workspaceOverview?.active_workspace?.id || "rename-workspace"}
            >
              <Form.Item
                label="Workspace name"
                name="name"
                rules={[
                  { required: true, message: "Workspace name is required" },
                  { min: 2, message: "Workspace name is too short" },
                ]}
              >
                <Input placeholder="Workspace name" disabled={!activeWorkspaceId} />
              </Form.Item>

              <Button
                htmlType="submit"
                type="default"
                loading={renameWorkspaceMutation.isPending}
                disabled={!activeWorkspaceId}
              >
                Rename workspace
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Invite by email">
            <Form form={form} layout="vertical" onFinish={onInvite}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Email is required" },
                  { type: "email", message: "Enter a valid email address" },
                ]}
              >
                <Input placeholder="teammate@company.com" />
              </Form.Item>

              <Form.Item label="Role" name="role" initialValue="member">
                <Select
                  options={[
                    { label: "Member", value: "member" },
                    { label: "Admin", value: "admin" },
                  ]}
                />
              </Form.Item>

              <Button
                htmlType="submit"
                type="primary"
                loading={inviteMutation.isPending}
                disabled={!workspaceOverview?.primary_workspace}
              >
                Send invite
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Your workspaces">
            {memberships.length ? (
              <List
                dataSource={memberships}
                renderItem={(membership) => (
                  <List.Item>
                    <List.Item.Meta
                      title={membership.workspace?.name || "Workspace"}
                      description={`Role: ${membership.role}`}
                    />
                    <Space>
                      {String(membership.workspace?.id) === String(activeWorkspaceId) ? (
                        <Tag color="green">Current</Tag>
                      ) : null}
                      {membership.workspace?.is_personal ? <Tag>Personal</Tag> : null}
                      <Button
                        type="link"
                        onClick={() => onSelectWorkspace(String(membership.workspace?.id || ""))}
                        disabled={
                          !membership.workspace?.id ||
                          String(membership.workspace?.id) === String(activeWorkspaceId) ||
                          selectWorkspaceMutation.isPending
                        }
                      >
                        Switch
                      </Button>
                    </Space>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No active workspaces yet" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Members">
            {members.length ? (
              <List
                dataSource={members}
                renderItem={(member) => (
                  <List.Item>
                    <List.Item.Meta
                      title={formatMemberName(member)}
                      description={member.user?.email}
                    />
                    <Space>
                      <Tag color={member.role === "owner" ? "gold" : member.role === "admin" ? "blue" : "default"}>
                        {member.role}
                      </Tag>
                      {member.role !== "owner" ? (
                        <Button
                          danger
                          type="link"
                          onClick={() => onRemoveMember(String(member.id))}
                          loading={removeMemberMutation.isPending}
                        >
                          Remove
                        </Button>
                      ) : null}
                    </Space>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No members yet" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Pending invites">
            {sentInvites.length || pendingInvites.length ? (
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                {pendingInvites.length ? (
                  <div>
                    <Text strong>Invites waiting for you</Text>
                    <List
                      dataSource={pendingInvites}
                      renderItem={(invite) => (
                        <List.Item
                          actions={[
                            <Button
                              key={invite.id}
                              type="link"
                              onClick={() => acceptInviteMutation.mutate({ token: searchParams.get("invite") || "" })}
                              disabled={acceptInviteMutation.isPending || !searchParams.get("invite")}
                            >
                              Accept from link
                            </Button>,
                          ]}
                        >
                          <List.Item.Meta
                            title={invite.workspace?.name || invite.email}
                            description={`Invited by ${invite.invited_by_user?.email || "workspace owner"}`}
                          />
                        </List.Item>
                      )}
                    />
                  </div>
                ) : null}

                {sentInvites.length ? (
                  <div>
                    <Text strong>Invites you sent</Text>
                    <List
                      dataSource={sentInvites}
                      renderItem={(invite) => (
                        <List.Item
                          actions={[
                            <Button
                              key={`resend-${invite.id}`}
                              type="link"
                              onClick={() => onResendInvite(String(invite.id))}
                              loading={resendInviteMutation.isPending}
                            >
                              Resend
                            </Button>,
                            <Button
                              key={`revoke-${invite.id}`}
                              danger
                              type="link"
                              onClick={() => onRevokeInvite(String(invite.id))}
                              loading={revokeInviteMutation.isPending}
                            >
                              Revoke
                            </Button>,
                          ]}
                        >
                          <List.Item.Meta
                            title={invite.email}
                            description={`Role: ${invite.role}`}
                          />
                          <Tag color="processing">{invite.status}</Tag>
                        </List.Item>
                      )}
                    />
                  </div>
                ) : null}
              </Space>
            ) : (
              <Empty description="No pending invites" />
            )}
          </Card>
        </Col>
      </Row>
    </Space>
  );
}