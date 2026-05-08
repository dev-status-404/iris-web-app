import type { Metadata } from "next";
import PhoneLinesClient from "./phone-lines-client";

export const metadata: Metadata = {
  title: "Phone Lines & SMS | Iris",
  description: "Manage your phone numbers and SMS inbox.",
};

export default function PhoneLinesPage() {
  return <PhoneLinesClient />;
}
