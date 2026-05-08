import type { Metadata } from "next";
import IntegrationsPage from "@/features/integrations";

export const metadata: Metadata = {
  title: "Integrations | Iris",
  description: "Connect Gmail, Google Calendar, Google Sheets and more.",
};

export default function IntegrationsRoute() {
  return <IntegrationsPage />;
}
