"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/redux/hook";

// ─── Boot ────────────────────────────────────────────────────────────────────

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

function PostHogBoot() {
  const booted = useRef(false);

  useEffect(() => {
    if (booted.current || !POSTHOG_KEY) return;
    booted.current = true;

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      // Capture page-leave events
      capture_pageview: false, // we handle this manually below
      capture_pageleave: true,
      // Respect DNT header
      respect_dnt: true,
      // Avoid sending sensitive PII in URLs
      sanitize_properties(properties) {
        // Strip potential tokens from URLs
        if (properties.$current_url) {
          try {
            const url = new URL(properties.$current_url as string);
            url.searchParams.delete("token");
            url.searchParams.delete("access_token");
            url.searchParams.delete("refresh_token");
            properties.$current_url = url.toString();
          } catch {
            // non-URL, leave as-is
          }
        }
        return properties;
      },
    });
  }, []);

  return null;
}

// ─── Page view tracker ───────────────────────────────────────────────────────

function PageViewTracker() {
  const posthogClient = usePostHog();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!posthogClient) return;
    const url =
      pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    posthogClient.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams, posthogClient]);

  return null;
}

// ─── User identity sync ──────────────────────────────────────────────────────

function PostHogIdentify() {
  const posthogClient = usePostHog();
  // Read user from Redux — adjust selector path to match your actual store shape
  const user = useAppSelector((state) => (state as any)?.auth?.user ?? null);

  useEffect(() => {
    if (!posthogClient || !user) return;

    const userId = user._id ?? user.id;
    if (!userId) return;

    posthogClient.identify(userId, {
      email: user.email,
      name: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
      plan: user.plan ?? undefined,
    });
  }, [posthogClient, user]);

  // Reset on logout
  useEffect(() => {
    if (!posthogClient || user) return;
    posthogClient.reset();
  }, [posthogClient, user]);

  return null;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!POSTHOG_KEY) {
    // No key — render children unchanged (dev / env without analytics)
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <PostHogBoot />
      {/* Suspense required because useSearchParams() is used inside */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      <PostHogIdentify />
      {children}
    </PHProvider>
  );
}
