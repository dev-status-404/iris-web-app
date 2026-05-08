"use client";

import React, { useState } from "react";
import {
  Card,
  Table,
  Tag,
  Typography,
  Input,
  Select,
  DatePicker,
  Space,
  Button,
  Tooltip,
  Badge,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import {
  ReloadOutlined,
  SearchOutlined,
  PhoneOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  AudioOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useCallHistory } from "@/features/call-logs/hooks/queries";
import type { CallRecord } from "@/types/api/telnyx";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const DIRECTION_COLORS: Record<string, string> = {
  inbound: "blue",
  outbound: "volcano",
};

const STATUS_COLORS: Record<string, string> = {
  completed: "success",
  answered: "success",
  initiated: "processing",
  ringing: "processing",
  hangup: "default",
  voicemail: "warning",
  failed: "error",
  missed: "error",
};

function formatDuration(seconds?: number) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function CallLogsTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState<string | undefined>();
  const [direction, setDirection] = useState<"inbound" | "outbound" | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[string?, string?]>([]);

  const params = {
    page,
    limit,
    search: search || undefined,
    direction,
    status: status || undefined,
    dateFrom: dateRange[0],
    dateTo: dateRange[1],
  };

  const { data, isLoading, isFetching, refetch } = useCallHistory(params);

  const calls: CallRecord[] = data?.data?.calls ?? [];
  const pagination = data?.data?.pagination;

  const columns: ColumnsType<CallRecord> = [
    {
      title: "Direction",
      dataIndex: "direction",
      key: "direction",
      width: 120,
      render: (dir: string) => (
        <Tag
          icon={
            dir === "inbound" ? <ArrowDownOutlined /> : <ArrowUpOutlined />
          }
          color={DIRECTION_COLORS[dir] ?? "default"}
        >
          {dir}
        </Tag>
      ),
    },
    {
      title: "From",
      dataIndex: "from_number",
      key: "from_number",
      render: (num: string) => <Text copyable>{num}</Text>,
    },
    {
      title: "To",
      dataIndex: "to_number",
      key: "to_number",
      render: (num: string) => <Text copyable>{num}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (s: string) => (
        <Badge
          status={STATUS_COLORS[s] as any ?? "default"}
          text={s}
        />
      ),
    },
    {
      title: "Duration",
      dataIndex: "duration_seconds",
      key: "duration_seconds",
      width: 100,
      render: (v: number) => formatDuration(v),
    },
    {
      title: "Lead",
      dataIndex: "lead_id",
      key: "lead",
      render: (lead: CallRecord["lead_id"]) =>
        lead
          ? `${lead.first_name ?? ""} ${lead.last_name ?? ""}`.trim() || "—"
          : "—",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 170,
      render: (v: string) => dayjs(v).format("MMM D, YYYY h:mm A"),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Recording",
      dataIndex: "recording_url",
      key: "recording_url",
      width: 100,
      render: (url?: string) =>
        url ? (
          <Tooltip title="Play recording">
            <Button
              type="link"
              icon={<AudioOutlined />}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
            />
          </Tooltip>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
  ];

  const handleTableChange = (pag: TablePaginationConfig) => {
    setPage(pag.current ?? 1);
    setLimit(pag.pageSize ?? 20);
  };

  return (
    <Card
      title={
        <Space>
          <PhoneOutlined />
          <span>Call Logs</span>
        </Space>
      }
      extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
          loading={isFetching}
        >
          Refresh
        </Button>
      }
    >
      {/* Filters */}
      <Space wrap style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search number..."
          prefix={<SearchOutlined />}
          allowClear
          style={{ width: 220 }}
          onPressEnter={(e) => {
            setSearch((e.target as HTMLInputElement).value);
            setPage(1);
          }}
          onChange={(e) => {
            if (!e.target.value) {
              setSearch(undefined);
              setPage(1);
            }
          }}
        />

        <Select
          allowClear
          placeholder="Direction"
          style={{ width: 140 }}
          options={[
            { value: "inbound", label: "Inbound" },
            { value: "outbound", label: "Outbound" },
          ]}
          onChange={(v) => {
            setDirection(v);
            setPage(1);
          }}
        />

        <Select
          allowClear
          placeholder="Status"
          style={{ width: 140 }}
          options={[
            "completed",
            "answered",
            "initiated",
            "ringing",
            "hangup",
            "failed",
            "missed",
          ].map((s) => ({ value: s, label: s }))}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        />

        <RangePicker
          onChange={(_, strings) => {
            setDateRange([strings[0] || undefined, strings[1] || undefined]);
            setPage(1);
          }}
        />
      </Space>

      <Table<CallRecord>
        rowKey="_id"
        columns={columns}
        dataSource={calls}
        loading={isLoading || isFetching}
        pagination={{
          current: page,
          pageSize: limit,
          total: pagination?.total ?? 0,
          showSizeChanger: true,
          showTotal: (total) => `${total} calls`,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        onChange={handleTableChange}
        scroll={{ x: 900 }}
      />
    </Card>
  );
}
