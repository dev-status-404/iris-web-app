"use client";
import React from "react";
import { Layout } from "antd";
import AppSider from "../app-sider";
import AppContent from "../app-content";
import AppHeader from "../app-header";
import { usePathname } from "next/navigation";
import SubscriptionInitializer from "./subscription-initializer";
import WorkspaceGate from "../workspace-gate";

const AppLayout = ({ childrens }: { childrens: React.ReactNode }) => {
  const path = usePathname();
  const isAuthPath = path.startsWith("/auth");
  const isPlansRoute = path.startsWith("/plans");
  const isOnboardingPath = path.startsWith("/onboarding");
  const isWorkspacePath = path.startsWith("/workspace");

  if (isAuthPath || isPlansRoute || isOnboardingPath || isWorkspacePath) {
    return (
      <section className="auth-page-shell">
        {childrens}
      </section>
    );
  }
  return (
    <Layout hasSider>
      <SubscriptionInitializer />
      <WorkspaceGate />
      <AppSider />
      <Layout>
        <AppHeader />
        <AppContent children={childrens} />
      </Layout>
    </Layout>
  );
};

export default AppLayout;
