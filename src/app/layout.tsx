import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Red_Hat_Display } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/hooks/language/use-language";
import Providers from "@/providers/react-query";
import StoreProvider from "@/redux/store-provider";
import { PostHogProvider } from "@/providers/posthog";
import "react-quill-new/dist/quill.snow.css";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const redHatDisplay = Red_Hat_Display({
  variable: "--font-red-hat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "iriscalls",
  description:
    "Welcome to iriscalls. Get qualified leads and grow your business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${redHatDisplay.variable} antialiased `}
      >
        <LanguageProvider>
          <Providers>
            <StoreProvider>
              <PostHogProvider>
                <AntdRegistry>{children}</AntdRegistry>
              </PostHogProvider>
            </StoreProvider>
          </Providers>
        </LanguageProvider>
      </body>
    </html>
  );
}
