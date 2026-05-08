"use client";

/**
 * WorkspaceGate — mirrors Canva/ClickUp's post-login workspace check.
 *
 * After authentication, if the user has no active workspace they are
 * redirected to /workspace/setup so they can create or join one.
 * Renders nothing visible.
 */
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWorkspaceOverview } from "@/features/workspace/hooks";
import { useAppSelector } from "@/redux/hook";

/** Paths that must never trigger the workspace redirect. */
const EXEMPT_PREFIXES = [
  "/auth",
  "/plans",
  "/onboarding",
  "/workspace",
];

const WorkspaceGate: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAppSelector((s) => s.user.isAuthenticated);
  const { data, isLoading } = useWorkspaceOverview();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (isLoading) return;
    if (EXEMPT_PREFIXES.some((p) => pathname.startsWith(p))) return;

    const hasWorkspace =
      data?.data?.active_workspace != null ||
      data?.data?.primary_workspace != null;

    if (!hasWorkspace) {
      router.replace("/workspace/setup");
    }
  }, [isAuthenticated, isLoading, data, pathname, router]);

  return null;
};

export default WorkspaceGate;
