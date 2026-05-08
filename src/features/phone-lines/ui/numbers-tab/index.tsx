"use client";

import React, { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
  theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CopyOutlined,
  DeleteOutlined,
  MessageOutlined,
  PhoneOutlined,
  PlusOutlined,
  ReloadOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { PhoneNumber } from "@/types/api/numbers";
import {
  useAllNumbers,
  useAssignNumber,
  useMyNumber,
  usePurchaseNumber,
  useReleaseNumber,
} from "@/features/phone-lines/hooks/numbers";
import { useIsDark } from "@/hooks/use-is-dark";

const { Text, Title } = Typography;
const { Option } = Select;

const STATUS_CONFIG: Record<string, { label: string; dot: string }> = {
  active:   { label: "Active",   dot: "#52c41a" },
  pool:     { label: "In Pool",  dot: "#1677ff" },
  released: { label: "Released", dot: "#bfbfbf" },
};

function formatPhone(n: string) {
  const m = n.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  return m ? `+1 (${m[1]}) ${m[2]}-${m[3]}` : n;
}

// ─── Hero card for user's active number ──────────────────────────────────────

function MyNumberCard({
  number,
  onSmsClick,
}: {
  number: PhoneNumber;
  onSmsClick?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(number.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1677ff 0%, #0550ae 100%)",
        borderRadius: 16,
        padding: "22px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
        boxShadow: "0 6px 28px rgba(22,119,255,0.26)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <PhoneOutlined style={{ fontSize: 22, color: "#fff" }} />
        </div>
        <div>
          <Text
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              display: "block",
              marginBottom: 2,
            }}
          >
            Your active number
          </Text>
          <Title
            level={3}
            style={{
              color: "#fff",
              margin: 0,
              fontWeight: 800,
              fontFamily: "monospace",
              letterSpacing: "0.5px",
            }}
          >
            {formatPhone(number.number)}
          </Title>
          <Text
            style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 2, display: "block" }}
          >
            {number.provider ?? "Telnyx"} · since {dayjs(number.createdAt).format("MMM D, YYYY")}
          </Text>
        </div>
      </div>

      <Space wrap>
        <Button
          icon={<CopyOutlined />}
          onClick={copy}
          style={{
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.22)",
            color: "#fff",
            borderRadius: 8,
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </Button>
        {onSmsClick && (
          <Button
            icon={<MessageOutlined />}
            onClick={onSmsClick}
            style={{
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.22)",
              color: "#fff",
              borderRadius: 8,
            }}
          >
            Go to SMS
          </Button>
        )}
      </Space>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PhoneNumbersTab({
  onSmsTabClick,
}: {
  onSmsTabClick?: () => void;
}) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [form] = Form.useForm<{ phone_number: string }>();
  const { token } = theme.useToken();
  const isDark = useIsDark();

  const { data: myData } = useMyNumber();
  const { data, isLoading, isFetching, refetch } = useAllNumbers({
    page,
    limit: 20,
    status: statusFilter,
  });
  const assignMutation   = useAssignNumber();
  const purchaseMutation = usePurchaseNumber();
  const releaseMutation  = useReleaseNumber();

  const myNumber                  = myData?.data?.phoneNumber;
  const numbers: PhoneNumber[]    = data?.data?.numbers ?? [];
  const pagination                = data?.data?.pagination;

  const activeCount = numbers.filter((n) => n.status === "active").length;
  const poolCount   = numbers.filter((n) => n.status === "pool").length;
  const total       = pagination?.total ?? numbers.length;

  const handleAssign = async () => {
    try {
      await assignMutation.mutateAsync();
      message.success("Number assigned from pool!");
    } catch (e: any) {
      message.error(e?.response?.data?.message ?? "Failed to assign number");
    }
  };

  const handleRelease = async (id: string) => {
    try {
      await releaseMutation.mutateAsync(id);
      message.success("Number released back to pool");
    } catch (e: any) {
      message.error(e?.response?.data?.message ?? "Failed to release");
    }
  };

  const handlePurchase = async (values: { phone_number: string }) => {
    try {
      await purchaseMutation.mutateAsync({ phone_number: values.phone_number });
      message.success("Number purchased and assigned!");
      setPurchaseOpen(false);
      form.resetFields();
    } catch (e: any) {
      message.error(e?.response?.data?.message ?? "Failed to purchase");
    }
  };

  const columns: ColumnsType<PhoneNumber> = [
    {
      title: "Phone Number",
      dataIndex: "number",
      key: "number",
      render: (num: string, record) => (
        <Space size={10}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: record.status === "active"
                ? (isDark ? "rgba(22,119,255,0.18)" : "#e6f4ff")
                : token.colorFillTertiary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <PhoneOutlined
              style={{
                color: record.status === "active" ? "#1677ff" : "#bfbfbf",
                fontSize: 14,
              }}
            />
          </div>
          <div>
            <Text
              strong
              copyable={{ text: num, tooltips: ["Copy", "Copied!"] }}
              style={{ fontFamily: "monospace", fontSize: 14 }}
            >
              {formatPhone(num)}
            </Text>
            {myNumber?._id === record._id && (
              <Tag color="blue" style={{ marginLeft: 6, fontSize: 10, borderRadius: 4 }}>
                yours
              </Tag>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (s: string) => {
        const cfg = STATUS_CONFIG[s] ?? { label: s, dot: "#bfbfbf" };
        return (
          <Badge
            color={cfg.dot}
            text={<Text style={{ fontSize: 13 }}>{cfg.label}</Text>}
          />
        );
      },
    },
    {
      title: "Provider",
      dataIndex: "provider",
      key: "provider",
      width: 100,
      render: (p: string) => (
        <Tag style={{ fontSize: 11, borderRadius: 6 }}>{p ?? "Telnyx"}</Tag>
      ),
    },
    {
      title: "Assigned",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (v: string) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {dayjs(v).format("MMM D, YYYY")}
        </Text>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 56,
      render: (_, record) =>
        record.status === "active" ? (
          <Popconfirm
            title="Release this number?"
            description="It will return to the shared pool."
            onConfirm={() => handleRelease(record._id)}
            okText="Release"
            okButtonProps={{ danger: true }}
            placement="topRight"
          >
            <Tooltip title="Release number">
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
                type="text"
                loading={
                  releaseMutation.isPending && releaseMutation.variables === record._id
                }
              />
            </Tooltip>
          </Popconfirm>
        ) : null,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Stats row ─────────────────────────────────────────── */}
      <Row gutter={12}>
        {[
          { label: "Total Numbers", value: total,       accent: "#1677ff", bg: isDark ? "rgba(22,119,255,0.12)"  : "#e6f4ff" },
          { label: "Active",        value: activeCount, accent: "#52c41a", bg: isDark ? "rgba(82,196,26,0.12)"  : "#f6ffed" },
          { label: "In Pool",       value: poolCount,   accent: "#722ed1", bg: isDark ? "rgba(114,46,209,0.12)" : "#f9f0ff" },
        ].map((s) => (
          <Col key={s.label} xs={8}>
            <div
              style={{
                padding: "14px 18px",
                borderRadius: 12,
                background: s.bg,
                border: `1px solid ${s.accent}22`,
              }}
            >
              <Text
                style={{
                  color: token.colorTextSecondary,
                  fontSize: 12,
                  fontWeight: 500,
                  display: "block",
                  marginBottom: 2,
                }}
              >
                {s.label}
              </Text>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.accent, lineHeight: 1.1 }}>
                {s.value}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* ── My number hero ────────────────────────────────────── */}
      {myNumber && (
        <MyNumberCard number={myNumber} onSmsClick={onSmsTabClick} />
      )}

      {/* ── Numbers table ─────────────────────────────────────── */}
      <Card
        styles={{ body: { padding: 0 } }}
        style={{ borderRadius: 14, border: `1px solid ${token.colorBorderSecondary}` }}
        title={
          <Space size={8}>
            <Text strong>All Numbers</Text>
            <Text type="secondary" style={{ fontWeight: 400, fontSize: 13 }}>
              {total} total
            </Text>
          </Space>
        }
        extra={
          <Space size={6} wrap>
            <Select
              placeholder="All statuses"
              allowClear
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
              style={{ width: 140 }}
              size="small"
            >
              <Option value="active">Active</Option>
              <Option value="pool">In Pool</Option>
              <Option value="released">Released</Option>
            </Select>
            <Tooltip title="Refresh">
              <Button
                icon={<ReloadOutlined spin={isFetching} />}
                size="small"
                onClick={() => refetch()}
              />
            </Tooltip>
            <Button
              size="small"
              icon={<SwapOutlined />}
              onClick={handleAssign}
              loading={assignMutation.isPending}
            >
              Assign from pool
            </Button>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setPurchaseOpen(true)}
            >
              Purchase number
            </Button>
          </Space>
        }
      >
        <Table<PhoneNumber>
          rowKey="_id"
          columns={columns}
          dataSource={numbers}
          loading={isLoading || isFetching}
          pagination={{
            current: page,
            pageSize: 20,
            total: pagination?.total ?? 0,
            showTotal: (t, r) => `${r[0]}–${r[1]} of ${t}`,
            onChange: setPage,
            size: "small",
          }}
          scroll={{ x: 580 }}
          locale={{
            emptyText: (
              <div style={{ padding: "44px 0", textAlign: "center" }}>
                <PhoneOutlined
                  style={{ fontSize: 36, color: "#d9d9d9", display: "block", marginBottom: 12 }}
                />
                <Text type="secondary" style={{ display: "block", marginBottom: 14 }}>
                  No phone numbers yet
                </Text>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setPurchaseOpen(true)}
                >
                  Get your first number
                </Button>
              </div>
            ),
          }}
        />
      </Card>

      {/* ── Purchase modal ────────────────────────────────────── */}
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
              <PhoneOutlined style={{ color: "#1677ff" }} />
            </div>
            <span>Purchase a phone number</span>
          </Space>
        }
        open={purchaseOpen}
        onCancel={() => {
          setPurchaseOpen(false);
          form.resetFields();
        }}
        onOk={form.submit}
        okText="Purchase & assign"
        confirmLoading={purchaseMutation.isPending}
        centered
        width={480}
      >
        <Alert
          type="info"
          showIcon
          message="Enter a valid E.164 number (e.g. +12025551234) to purchase from Telnyx."
          style={{ marginBottom: 20, borderRadius: 8 }}
        />
        <Form form={form} onFinish={handlePurchase} layout="vertical">
          <Form.Item
            name="phone_number"
            label="Phone number"
            rules={[
              { required: true, message: "Enter a phone number" },
              {
                pattern: /^\+[1-9]\d{7,14}$/,
                message: "Must be a valid E.164 number (e.g. +12025551234)",
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="+12025551234"
              size="large"
              style={{ borderRadius: 10, fontFamily: "monospace" }}
              autoFocus
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
