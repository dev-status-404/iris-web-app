import type { Metadata } from "next";
import CallLogsTable from "@/features/call-logs/ui/table";

export const metadata: Metadata = {
  title: "Call Logs | Iris",
  description: "View your inbound and outbound call history.",
};

export default function CallLogsPage() {
  return (
    <div className="p-6">
      <CallLogsTable />
    </div>
  );
}
