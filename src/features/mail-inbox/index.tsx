"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Avatar,
  Badge,
  Button,
  Divider,
  Empty,
  Input,
  Layout,
  List,
  Select,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  ArrowPathIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  FolderIcon,
  InboxArrowDownIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  StarIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import { useFetchSmtpAccounts } from "@/features/settings/hooks/smtp";
import {
  useFetchInboxMessages,
  useFetchInboxMessage,
  useMarkRead,
  useMarkUnread,
  useToggleStar,
} from "./hooks/queries";
import type { InboxMessage } from "@/types/api/inbox";
import type { SmtpAccount } from "@/types/api/smtp";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

const { Sider, Content } = Layout;
const { Text, Title, Paragraph } = Typography;
const { Search } = Input;

// ─── helpers ────────────────────────────────────────────────────────────────

function initials(name?: string | null, email?: string): string {
  if (name && name.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return (email ?? "?")[0].toUpperCase();
}

function avatarColor(seed: string): string {
  const colors = [
    "#f56a00", "#7265e6", "#ffbf00", "#00a2ae",
    "#e6614e", "#5ea16a", "#4e82e6", "#c46ee6",
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function relativeTime(date: string): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "";
  }
}

const SYSTEM_FOLDERS = [
  { key: "INBOX", label: "Inbox", icon: <InboxArrowDownIcon className="h-4 w-4" /> },
  { key: "SENT", label: "Sent", icon: <PaperAirplaneIcon className="h-4 w-4" /> },
  { key: "DRAFTS", label: "Drafts", icon: <EnvelopeIcon className="h-4 w-4" /> },
  { key: "Trash", label: "Trash", icon: <TrashIcon className="h-4 w-4" /> },
];

// ─── subcomponents ───────────────────────────────────────────────────────────

type AccountSidebarProps = {
  accounts: SmtpAccount[];
  selectedAccountId: string;
  onSelect: (id: string) => void;
  selectedFolder: string;
  onFolderSelect: (folder: string) => void;
};

const AccountSidebar: React.FC<AccountSidebarProps> = ({
  accounts,
  selectedAccountId,
  onSelect,
  selectedFolder,
  onFolderSelect,
}) => {
  const inboxAccounts = accounts.filter((a) => a.imap.enabled && a.imap.host);

  return (
    <div className="flex flex-col h-full" style={{ padding: "12px 8px" }}>
      {/* Accounts */}
      <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", padding: "0 8px 6px" }}>
        ACCOUNTS
      </Text>

      {inboxAccounts.length === 0 ? (
        <div style={{ padding: "8px", marginBottom: 12 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            No inbox-enabled accounts.
          </Text>
        </div>
      ) : (
        <div style={{ marginBottom: 12 }}>
          {inboxAccounts.map((acc) => {
            const label = acc.label || acc.email_address;
            const isSelected = acc._id === selectedAccountId;
            return (
              <button
                key={acc._id}
                onClick={() => onSelect(acc._id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "7px 8px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  background: isSelected ? "rgba(99,102,241,0.12)" : "transparent",
                  color: isSelected ? "#818cf8" : "rgba(255,255,255,0.75)",
                  transition: "all 120ms",
                }}
              >
                <Avatar
                  size={26}
                  style={{ background: avatarColor(acc.email_address), fontSize: 11, flexShrink: 0 }}
                >
                  {initials(acc.label || acc.sender_name, acc.email_address)}
                </Avatar>
                <span style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "left" }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <Divider style={{ margin: "4px 0 10px", borderColor: "rgba(255,255,255,0.08)" }} />

      {/* Folders */}
      <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", padding: "0 8px 6px" }}>
        FOLDERS
      </Text>

      {SYSTEM_FOLDERS.map((f) => {
        const isActive = selectedFolder === f.key;
        return (
          <button
            key={f.key}
            onClick={() => onFolderSelect(f.key)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 8px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background: isActive ? "rgba(99,102,241,0.12)" : "transparent",
              color: isActive ? "#818cf8" : "rgba(255,255,255,0.75)",
              transition: "all 120ms",
            }}
          >
            <span style={{ flexShrink: 0 }}>{f.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{f.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// ─── Message list ────────────────────────────────────────────────────────────

type MessageFilter = "all" | "unread" | "starred" | "attachments";

type MessageListProps = {
  accountId: string;
  folder: string;
  selectedUid: number | null;
  onSelect: (uid: number) => void;
};

const MessageList: React.FC<MessageListProps> = ({ accountId, folder, selectedUid, onSelect }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<MessageFilter>("all");
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const toggleStar = useToggleStar();

  const { data, isLoading, isFetching, refetch } = useFetchInboxMessages(accountId, {
    folder,
    page,
    limit: 30,
    search: debouncedSearch,
  });

  const messages = useMemo(() => {
    const all = data?.data?.messages ?? [];
    if (filter === "unread") return all.filter((m) => !m.read);
    if (filter === "starred") return all.filter((m) => m.starred);
    if (filter === "attachments") return all.filter((m) => m.hasAttachments);
    return all;
  }, [data, filter]);

  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    const t = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const handleStarClick = (e: React.MouseEvent, msg: InboxMessage) => {
    e.stopPropagation();
    toggleStar.mutate({ accountId, uid: msg.uid, starred: !msg.starred, folder });
  };

  if (!accountId) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: "rgba(255,255,255,0.4)" }}>
        <EnvelopeIcon className="h-12 w-12" />
        <Text type="secondary">Select an account to view emails</Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Search
          placeholder="Search emails..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          allowClear
          style={{ marginBottom: 10 }}
          prefix={<MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />}
        />
        <div className="flex items-center gap-2 flex-wrap">
          {(["all", "unread", "starred", "attachments"] as MessageFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "3px 10px",
                borderRadius: 20,
                border: "1px solid",
                borderColor: filter === f ? "#6366f1" : "rgba(255,255,255,0.12)",
                background: filter === f ? "rgba(99,102,241,0.18)" : "transparent",
                color: filter === f ? "#818cf8" : "rgba(255,255,255,0.55)",
                fontSize: 12,
                cursor: "pointer",
                transition: "all 120ms",
                fontWeight: filter === f ? 600 : 400,
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <Tooltip title="Refresh">
            <button
              onClick={() => refetch()}
              style={{
                marginLeft: "auto",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 6,
                padding: "3px 8px",
                cursor: "pointer",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              <ArrowPathIcon className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {isLoading ? (
          <div style={{ padding: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} active avatar paragraph={{ rows: 1 }} style={{ marginBottom: 12 }} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<Text type="secondary">No emails found</Text>}
            style={{ marginTop: 60 }}
          />
        ) : (
          messages.map((msg) => {
            const isSelected = selectedUid === msg.uid;
            const senderName = msg.from?.name || msg.from?.address || "Unknown";
            const senderEmail = msg.from?.address || "";

            return (
              <div
                key={msg.uid}
                onClick={() => onSelect(msg.uid)}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  cursor: "pointer",
                  background: isSelected
                    ? "rgba(99,102,241,0.14)"
                    : msg.read
                    ? "transparent"
                    : "rgba(99,102,241,0.05)",
                  borderLeft: isSelected ? "3px solid #6366f1" : "3px solid transparent",
                  transition: "background 80ms",
                }}
              >
                <div className="flex items-start gap-3">
                  <Avatar
                    size={36}
                    style={{ background: avatarColor(senderEmail), fontSize: 14, flexShrink: 0 }}
                  >
                    {initials(msg.from?.name, senderEmail)}
                  </Avatar>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center justify-between gap-2">
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: msg.read ? 400 : 700,
                          color: msg.read ? "rgba(255,255,255,0.75)" : "#fff",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 140,
                        }}
                      >
                        {senderName}
                      </Text>
                      <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", flexShrink: 0 }}>
                        {relativeTime(msg.date)}
                      </Text>
                    </div>

                    <div className="flex items-center gap-1 mt-0.5">
                      {!msg.read && (
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#6366f1",
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: msg.read ? 400 : 600,
                          color: msg.read ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.9)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {msg.subject}
                      </Text>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      {msg.hasAttachments && (
                        <Tooltip title="Has attachments">
                          <PaperClipIcon className="h-3.5 w-3.5" style={{ color: "rgba(255,255,255,0.35)" }} />
                        </Tooltip>
                      )}
                      <button
                        onClick={(e) => handleStarClick(e, msg)}
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", lineHeight: 1 }}
                      >
                        {msg.starred ? (
                          <StarSolidIcon className="h-3.5 w-3.5" style={{ color: "#f59e0b" }} />
                        ) : (
                          <StarIcon className="h-3.5 w-3.5" style={{ color: "rgba(255,255,255,0.25)" }} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ─── Message viewer ──────────────────────────────────────────────────────────

type MessageViewerProps = {
  accountId: string;
  uid: number | null;
  folder: string;
};

const MessageViewer: React.FC<MessageViewerProps> = ({ accountId, uid, folder }) => {
  const { data, isLoading } = useFetchInboxMessage(accountId, uid, folder);
  const markRead = useMarkRead();
  const markUnread = useMarkUnread();
  const toggleStar = useToggleStar();

  const msg = data?.data;

  if (!uid) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4" style={{ color: "rgba(255,255,255,0.3)" }}>
        <EnvelopeOpenIcon className="h-16 w-16" />
        <div className="text-center">
          <Title level={4} style={{ color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
            Select an email
          </Title>
          <Text type="secondary">Click on any message to read it here</Text>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ padding: 32 }}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (!msg) {
    return (
      <div className="flex items-center justify-center h-full">
        <Text type="secondary">Message not found</Text>
      </div>
    );
  }

  const senderName = msg.from?.name || msg.from?.address || "Unknown";
  const senderEmail = msg.from?.address || "";

  return (
    <div className="flex flex-col h-full" style={{ overflowY: "auto" }}>
      {/* Header */}
      <div
        style={{
          padding: "20px 28px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <Title
          level={4}
          style={{ color: "#fff", marginBottom: 14, lineHeight: 1.4, fontSize: 18 }}
        >
          {msg.subject}
        </Title>

        <div className="flex items-start gap-3">
          <Avatar
            size={42}
            style={{ background: avatarColor(senderEmail), fontSize: 16, flexShrink: 0 }}
          >
            {initials(msg.from?.name, senderEmail)}
          </Avatar>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="flex items-center justify-between">
              <div>
                <Text style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{senderName}</Text>
                <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginLeft: 8 }}>
                  &lt;{senderEmail}&gt;
                </Text>
              </div>
              <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, flexShrink: 0 }}>
                {msg.date ? new Date(msg.date).toLocaleString() : ""}
              </Text>
            </div>

            {msg.to.length > 0 && (
              <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
                To:{" "}
                {msg.to.map((t) => t.name || t.address).join(", ")}
              </Text>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <Button
            size="small"
            onClick={() =>
              msg.read
                ? markUnread.mutate({ accountId, uid: msg.uid, folder })
                : markRead.mutate({ accountId, uid: msg.uid, folder })
            }
            loading={markRead.isPending || markUnread.isPending}
            icon={msg.read ? <EnvelopeIcon className="h-3.5 w-3.5" /> : <EnvelopeOpenIcon className="h-3.5 w-3.5" />}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.7)",
              fontSize: 12,
            }}
          >
            {msg.read ? "Mark unread" : "Mark read"}
          </Button>

          <Button
            size="small"
            onClick={() => toggleStar.mutate({ accountId, uid: msg.uid, starred: !msg.starred, folder })}
            loading={toggleStar.isPending}
            icon={
              msg.starred ? (
                <StarSolidIcon className="h-3.5 w-3.5" style={{ color: "#f59e0b" }} />
              ) : (
                <StarIcon className="h-3.5 w-3.5" />
              )
            }
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: msg.starred ? "#f59e0b" : "rgba(255,255,255,0.7)",
              fontSize: 12,
            }}
          >
            {msg.starred ? "Unstar" : "Star"}
          </Button>

          {msg.hasAttachments && (
            <Tag
              icon={<PaperClipIcon className="h-3 w-3 inline-block mr-1" />}
              color="default"
              style={{ fontSize: 11 }}
            >
              Attachments
            </Tag>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: "20px 28px" }}>
        {msg.body ? (
          msg.body.trim().startsWith("<") ? (
            <div
              style={{
                background: "#fff",
                borderRadius: 8,
                padding: "16px 20px",
                color: "#111",
                lineHeight: 1.6,
              }}
              dangerouslySetInnerHTML={{ __html: msg.body }}
            />
          ) : (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                color: "rgba(255,255,255,0.8)",
                fontFamily: "inherit",
                fontSize: 14,
                lineHeight: 1.7,
              }}
            >
              {msg.body}
            </pre>
          )
        ) : (
          <Text type="secondary">No message body.</Text>
        )}
      </div>
    </div>
  );
};

// ─── No inbox connected empty state ─────────────────────────────────────────

const NoInboxState: React.FC<{ hasAccounts?: boolean }> = ({ hasAccounts = false }) => {
  const router = useRouter();
  return (
    <div
      className="flex flex-col items-center justify-center h-full gap-5"
      style={{ padding: 40, textAlign: "center" }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "rgba(99,102,241,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <EnvelopeIcon className="h-9 w-9" style={{ color: "#818cf8" }} />
      </div>
      <div>
        <Title level={4} style={{ color: "#fff", marginBottom: 8 }}>
          {hasAccounts ? "Inbox not enabled" : "No inbox connected"}
        </Title>
        <Paragraph style={{ color: "rgba(255,255,255,0.5)", maxWidth: 380, margin: "0 auto 20px" }}>
          {hasAccounts
            ? "Your SMTP account does not have IMAP enabled. Edit your account in Settings → SMTP, check \"Enable Inbox\", enter your IMAP host (e.g. imap.hostinger.com), port 993, and save."
            : "Connect an SMTP account with IMAP enabled to start reading your emails here. Head to Settings → SMTP Accounts and enable the Inbox toggle."}
        </Paragraph>
        <Button
          type="primary"
          size="large"
          style={{ background: "linear-gradient(135deg,#6366f1,#818cf8)", border: "none" }}
          onClick={() => router.push("/settings?tab=smtp")}
        >
          {hasAccounts ? "Edit SMTP Account" : "Go to Settings"}
        </Button>
      </div>
    </div>
  );
};

// ─── Main ────────────────────────────────────────────────────────────────────

const MailInboxPage: React.FC = () => {
  const { data: accountsRes, isLoading: accountsLoading } = useFetchSmtpAccounts();
  const accounts = useMemo(() => accountsRes?.data ?? [], [accountsRes]);
  const inboxAccounts = useMemo(
    () => accounts.filter((a) => a.imap.enabled && a.imap.host),
    [accounts],
  );

  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedFolder, setSelectedFolder] = useState("INBOX");
  const [selectedUid, setSelectedUid] = useState<number | null>(null);

  // Auto-select first inbox-enabled account
  const activeAccountId = selectedAccountId || inboxAccounts[0]?._id || "";

  const handleSelectAccount = (id: string) => {
    setSelectedAccountId(id);
    setSelectedUid(null);
    setSelectedFolder("INBOX");
  };

  const handleSelectFolder = (folder: string) => {
    setSelectedFolder(folder);
    setSelectedUid(null);
  };

  const handleSelectMessage = (uid: number) => {
    setSelectedUid(uid);
  };

  if (accountsLoading) {
    return (
      <div style={{ padding: 32 }}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (inboxAccounts.length === 0) {
    return (
      <div
        style={{
          height: "calc(100vh - 64px)",
          background: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <NoInboxState hasAccounts={accounts.length > 0} />
      </div>
    );
  }

  return (
    <Layout
      style={{
        height: "calc(100vh - 64px)",
        background: "transparent",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Left: accounts + folders */}
      <Sider
        width={200}
        style={{
          background: "linear-gradient(to bottom, #0f0f23, #1a1a3e)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          overflow: "auto",
        }}
      >
        <div
          style={{
            padding: "14px 16px 8px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center gap-2">
            <EnvelopeIcon className="h-5 w-5" style={{ color: "#818cf8" }} />
            <Text style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Mail</Text>
          </div>
        </div>

        <AccountSidebar
          accounts={accounts}
          selectedAccountId={activeAccountId}
          onSelect={handleSelectAccount}
          selectedFolder={selectedFolder}
          onFolderSelect={handleSelectFolder}
        />
      </Sider>

      {/* Middle: message list */}
      <div
        style={{
          width: 320,
          background: "#111827",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>
            {SYSTEM_FOLDERS.find((f) => f.key === selectedFolder)?.label ?? selectedFolder}
          </Text>
        </div>
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <MessageList
            accountId={activeAccountId}
            folder={selectedFolder}
            selectedUid={selectedUid}
            onSelect={handleSelectMessage}
          />
        </div>
      </div>

      {/* Right: email viewer */}
      <Content
        style={{
          background: "#0f172a",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <MessageViewer
          accountId={activeAccountId}
          uid={selectedUid}
          folder={selectedFolder}
        />
      </Content>
    </Layout>
  );
};

export default MailInboxPage;
