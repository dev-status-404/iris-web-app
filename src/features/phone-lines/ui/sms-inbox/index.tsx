"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Empty,
  Form,
  Input,
  Modal,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  message,
  theme,
} from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  EditOutlined,
  PhoneOutlined,
  ReloadOutlined,
  SearchOutlined,
  SendOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { SmsRecord, SmsThread } from "@/types/api/telnyx";
import {
  useSmsConversation,
  useSmsThreads,
  useSendSms,
} from "@/features/phone-lines/hooks/sms";
import { useMyNumber } from "@/features/phone-lines/hooks/numbers";
import { useIsDark } from "@/hooks/use-is-dark";

dayjs.extend(relativeTime);

const { Text, Title } = Typography;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function avatarInitials(contact: string) {
  const digits = contact.replace(/\D/g, "");
  return digits.slice(-2) || "??";
}

const AVATAR_COLORS = [
  "#1677ff", "#52c41a", "#fa8c16", "#722ed1",
  "#eb2f96", "#13c2c2", "#f5222d", "#2f54eb",
];

function contactColor(contact: string) {
  let h = 0;
  for (let i = 0; i < contact.length; i++) h = (h * 31 + contact.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function formatPhone(n: string) {
  const m = n.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  return m ? `+1 (${m[1]}) ${m[2]}-${m[3]}` : n;
}

function groupByDate(messages: SmsRecord[]) {
  const groups: { date: string; msgs: SmsRecord[] }[] = [];
  let lastDate = "";
  for (const msg of messages) {
    const d = dayjs(msg.createdAt).format("MMM D, YYYY");
    if (d !== lastDate) {
      groups.push({ date: d, msgs: [msg] });
      lastDate = d;
    } else {
      groups[groups.length - 1].msgs.push(msg);
    }
  }
  return groups;
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function Bubble({ msg }: { msg: SmsRecord }) {
  const { token } = theme.useToken();
  const isOut = msg.direction === "outbound";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isOut ? "flex-end" : "flex-start",
        marginBottom: 6,
        padding: "0 16px",
      }}
    >
      {!isOut && (
        <Avatar
          size={28}
          style={{
            background: contactColor(msg.from_number),
            fontSize: 11,
            fontWeight: 700,
            flexShrink: 0,
            marginRight: 8,
            alignSelf: "flex-end",
            marginBottom: 2,
          }}
        >
          {avatarInitials(msg.from_number)}
        </Avatar>
      )}
      <div style={{ maxWidth: "68%" }}>
        <div
          style={{
            background: isOut
              ? "linear-gradient(135deg, #1677ff, #0550ae)"
              : token.colorFillTertiary,
            color: isOut ? "#fff" : token.colorText,
            borderRadius: isOut ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            padding: "9px 14px",
            fontSize: 14,
            lineHeight: 1.5,
            boxShadow: isOut
              ? "0 2px 8px rgba(22,119,255,0.2)"
              : "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          {msg.body || (
            <Text style={{ color: isOut ? "rgba(255,255,255,0.6)" : token.colorTextTertiary, fontStyle: "italic" }}>
              [empty]
            </Text>
          )}
          {msg.media_urls?.map((url, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: isOut ? "rgba(255,255,255,0.85)" : "#1677ff",
                display: "block",
                fontSize: 12,
                marginTop: 4,
              }}
            >
              📎 Attachment {i + 1}
            </a>
          ))}
        </div>
        <div
          style={{
            fontSize: 11,
            color: token.colorTextQuaternary,
            marginTop: 3,
            textAlign: isOut ? "right" : "left",
            paddingLeft: isOut ? 0 : 2,
            paddingRight: isOut ? 2 : 0,
          }}
        >
          {dayjs(msg.createdAt).format("h:mm A")}
          {msg.status && msg.status !== "received" && (
            <span style={{ marginLeft: 4 }}>· {msg.status}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Conversation pane ────────────────────────────────────────────────────────

function ConversationPane({
  contact,
  myNumber,
}: {
  contact: string;
  myNumber?: string;
}) {
  const { token } = theme.useToken();
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, refetch } = useSmsConversation(contact);
  const sendMutation = useSendSms();
  const [form] = Form.useForm<{ text: string }>();

  const messages: SmsRecord[] = data?.data?.messages ?? [];
  const grouped = groupByDate(messages);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (values: { text: string }) => {
    if (!values.text.trim()) return;
    try {
      await sendMutation.mutateAsync({
        to: contact,
        from: myNumber,
        text: values.text.trim(),
      });
      form.resetFields();
      refetch();
    } catch (e: any) {
      message.error(e?.response?.data?.message ?? "Failed to send");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: token.colorBgContainer,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 20px",
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: token.colorBgContainer,
          flexShrink: 0,
        }}
      >
        <Avatar
          size={36}
          style={{
            background: contactColor(contact),
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {avatarInitials(contact)}
        </Avatar>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text strong style={{ display: "block", fontSize: 15 }}>
            {formatPhone(contact)}
          </Text>
          {myNumber && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              via {formatPhone(myNumber)}
            </Text>
          )}
        </div>
        <Tooltip title="Refresh">
          <Button
            icon={<ReloadOutlined />}
            size="small"
            type="text"
            onClick={() => refetch()}
            loading={isLoading}
          />
        </Tooltip>
      </div>

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 0",
          background: token.colorBgLayout,
        }}
      >
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
            <Spin />
          </div>
        ) : messages.length === 0 ? (
          <Empty
            description={<Text type="secondary">No messages yet. Say hello!</Text>}
            style={{ paddingTop: 60 }}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          grouped.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 16px",
                  margin: "4px 0",
                }}
              >
                <div style={{ flex: 1, height: 1, background: token.colorBorderSecondary }} />
                <Text
                  style={{
                    fontSize: 11,
                    color: token.colorTextTertiary,
                    whiteSpace: "nowrap",
                    padding: "2px 10px",
                    background: token.colorFillSecondary,
                    borderRadius: 10,
                  }}
                >
                  {group.date}
                </Text>
                <div style={{ flex: 1, height: 1, background: token.colorBorderSecondary }} />
              </div>
              {group.msgs.map((msg) => (
                <Bubble key={msg._id} msg={msg} />
              ))}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgContainer,
          flexShrink: 0,
        }}
      >
        <Form form={form} onFinish={handleSend}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <Form.Item name="text" style={{ flex: 1, marginBottom: 0 }}>
              <Input.TextArea
                placeholder="Type a message..."
                autoSize={{ minRows: 1, maxRows: 4 }}
                style={{ borderRadius: 20, resize: "none", paddingRight: 12 }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    form.submit();
                  }
                }}
              />
            </Form.Item>
            <Button
              type="primary"
              shape="circle"
              icon={<SendOutlined />}
              htmlType="submit"
              loading={sendMutation.isPending}
              style={{
                width: 38,
                height: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg,#1677ff,#0550ae)",
                border: "none",
                flexShrink: 0,
              }}
            />
          </div>
          <Text type="secondary" style={{ fontSize: 11, marginTop: 6, display: "block", paddingLeft: 4 }}>
            Press Enter to send · Shift+Enter for new line
          </Text>
        </Form>
      </div>
    </div>
  );
}

// ─── Empty conversation state ─────────────────────────────────────────────────

function ConversationEmpty() {
  const { token } = theme.useToken();
  const isDark = useIsDark();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        background: token.colorBgLayout,
        gap: 12,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: isDark ? "rgba(22,119,255,0.18)" : "#e6f4ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 4,
        }}
      >
        <SendOutlined style={{ fontSize: 28, color: "#1677ff" }} />
      </div>
      <Title level={5} style={{ margin: 0, color: token.colorText }}>
        Select a conversation
      </Title>
      <Text type="secondary" style={{ fontSize: 14 }}>
        Pick a thread on the left or start a new message
      </Text>
    </div>
  );
}

// ─── Thread item ──────────────────────────────────────────────────────────────

function ThreadItem({
  thread,
  selected,
  onClick,
}: {
  thread: SmsThread;
  selected: boolean;
  onClick: () => void;
}) {
  const { token } = theme.useToken();
  const isDark = useIsDark();
  const contact = thread._id;
  const last    = thread.last_message;
  const isOut   = last.direction === "outbound";

  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        padding: "12px 16px",
        background: selected
          ? (isDark ? "rgba(22,119,255,0.18)" : "#e6f4ff")
          : "transparent",
        border: "none",
        borderBottom: `1px solid ${token.colorFillTertiary}`,
        cursor: "pointer",
        transition: "background 100ms",
        textAlign: "left",
      }}
      onMouseEnter={(e) => {
        if (!selected)
          (e.currentTarget as HTMLElement).style.background = token.colorFillTertiary;
      }}
      onMouseLeave={(e) => {
        if (!selected)
          (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <Badge
        count={thread.unread_count}
        size="small"
        style={{ background: "#1677ff" }}
      >
        <Avatar
          size={42}
          style={{
            background: contactColor(contact),
            fontSize: 14,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {avatarInitials(contact)}
        </Avatar>
      </Badge>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 6 }}>
          <Text
            strong={thread.unread_count > 0}
            style={{
              fontSize: 14,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              color: selected ? "#1677ff" : token.colorText,
            }}
          >
            {formatPhone(contact)}
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: token.colorTextQuaternary,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {dayjs(last.createdAt).fromNow(true)}
          </Text>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
          {isOut ? (
            <ArrowUpOutlined style={{ fontSize: 10, color: token.colorTextQuaternary }} />
          ) : (
            <ArrowDownOutlined style={{ fontSize: 10, color: "#1677ff" }} />
          )}
          <Text
            ellipsis
            style={{
              fontSize: 13,
              color: thread.unread_count > 0 ? token.colorText : token.colorTextTertiary,
              fontWeight: thread.unread_count > 0 ? 600 : 400,
              flex: 1,
            }}
          >
            {last.body || "[media]"}
          </Text>
        </div>
      </div>
    </button>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function SmsInboxTab() {
  const { token } = theme.useToken();
  const isDark = useIsDark();
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [newForm] = Form.useForm<{ to: string; text: string }>();

  const { data: myData } = useMyNumber();
  const myNumber = myData?.data?.phoneNumber?.number;

  const { data, isLoading, isFetching, refetch } = useSmsThreads(
    search ? { search } : undefined,
  );
  const sendMutation = useSendSms();

  const threads: SmsThread[] = data?.data?.threads ?? [];
  const totalUnread = threads.reduce((a, t) => a + (t.unread_count ?? 0), 0);

  const handleNewMessage = async (values: { to: string; text: string }) => {
    if (!myNumber) {
      message.warning("You need an active phone number to send SMS");
      return;
    }
    try {
      await sendMutation.mutateAsync({
        to: values.to.trim(),
        from: myNumber,
        text: values.text.trim(),
      });
      setNewOpen(false);
      newForm.resetFields();
      setSelected(values.to.trim());
      refetch();
    } catch (e: any) {
      message.error(e?.response?.data?.message ?? "Failed to send");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 220px)",
        minHeight: 500,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: 14,
        overflow: "hidden",
        background: token.colorBgContainer,
      }}
    >
      {/* ── Left: thread list ──────────────────────────────── */}
      <div
        style={{
          width: 300,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          borderRight: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgContainer,
        }}
      >
        {/* Sidebar header */}
        <div
          style={{
            padding: "14px 16px 10px",
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Text strong style={{ fontSize: 15 }}>
                Messages
              </Text>
              {totalUnread > 0 && (
                <Tag
                  color="blue"
                  style={{ fontSize: 11, borderRadius: 10, padding: "0 6px" }}
                >
                  {totalUnread}
                </Tag>
              )}
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <Tooltip title="Refresh">
                <Button
                  icon={<ReloadOutlined spin={isFetching} />}
                  size="small"
                  type="text"
                  onClick={() => refetch()}
                />
              </Tooltip>
              <Tooltip title="New message">
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  type="primary"
                  onClick={() => setNewOpen(true)}
                />
              </Tooltip>
            </div>
          </div>
          <Input
            prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
            placeholder="Search conversations..."
            allowClear
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ borderRadius: 8 }}
          />
        </div>

        {/* Thread list scroll */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 40 }}>
              <Spin size="small" />
            </div>
          ) : threads.length === 0 ? (
            <div style={{ padding: "40px 16px", textAlign: "center" }}>
              <PhoneOutlined style={{ fontSize: 28, color: token.colorTextQuaternary, display: "block", marginBottom: 8 }} />
              <Text type="secondary" style={{ fontSize: 13 }}>
                {search ? "No results" : "No conversations yet"}
              </Text>
              {!search && (
                <div style={{ marginTop: 12 }}>
                  <Button
                    size="small"
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => setNewOpen(true)}
                  >
                    Start one
                  </Button>
                </div>
              )}
            </div>
          ) : (
            threads.map((t) => (
              <ThreadItem
                key={t._id}
                thread={t}
                selected={selected === t._id}
                onClick={() => setSelected(t._id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right: conversation pane ────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {selected ? (
          <ConversationPane contact={selected} myNumber={myNumber} />
        ) : (
          <ConversationEmpty />
        )}
      </div>

      {/* ── New message modal ────────────────────────────────── */}
      <Modal
        title={
          <Space>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: isDark ? "rgba(22,119,255,0.18)" : "#e6f4ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <EditOutlined style={{ color: "#1677ff" }} />
            </div>
            <span>New message</span>
          </Space>
        }
        open={newOpen}
        onCancel={() => { setNewOpen(false); newForm.resetFields(); }}
        onOk={newForm.submit}
        okText="Send"
        confirmLoading={sendMutation.isPending}
        centered
        width={460}
      >
        <Form form={newForm} onFinish={handleNewMessage} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item
            name="to"
            label="Recipient"
            rules={[
              { required: true, message: "Enter a phone number" },
              {
                pattern: /^\+[1-9]\d{7,14}$/,
                message: "Must be E.164 format (e.g. +12025551234)",
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined style={{ color: token.colorTextTertiary }} />}
              placeholder="+12025551234"
              style={{ fontFamily: "monospace", borderRadius: 8 }}
              autoFocus
            />
          </Form.Item>
          <Form.Item
            name="text"
            label="Message"
            rules={[{ required: true, message: "Enter your message" }]}
          >
            <Input.TextArea
              placeholder="Type your message..."
              autoSize={{ minRows: 3, maxRows: 6 }}
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
          {!myNumber && (
            <Text type="warning" style={{ fontSize: 12 }}>
              ⚠ You need an active phone number to send SMS.
            </Text>
          )}
        </Form>
      </Modal>
    </div>
  );
}
