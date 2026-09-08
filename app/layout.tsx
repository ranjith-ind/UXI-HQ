import { ClientCacheCleaner } from "@/components/providers/client-cache-cleaner";
import type { Metadata } from "next";
import { fontSans } from "@/app/fonts";
import "./globals.css";
import { RootShell } from "@/components/layout/root-shell";

export const metadata: Metadata = {
  title: "UXI HQ — Unified Xperience Intelligence",
  description:
    "Private internal operating system and business management platform for UXI web development company.",
  icons: {
    icon: "/uxi-logo.png",
    shortcut: "/uxi-logo.png",
    apple: "/uxi-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontSans.variable} scroll-smooth`}>
      <body className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-[#2451EB] selection:text-white">
        <ClientCacheCleaner />
        <RootShell>{children}</RootShell>
      </body>
    </html>
  );
}
