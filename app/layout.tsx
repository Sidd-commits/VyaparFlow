import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#EA580C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.vyaparflow.online"),
  title: {
    default: "VyaparFlow — Export Logistics Readiness Platform",
    template: "%s | VyaparFlow",
  },
  description:
    "Deterministic export readiness, compliance, certification, and multi-carrier logistics SaaS platform for Indian MSMEs.",
  keywords: [
    "Export Readiness",
    "MSME Exports",
    "Logistics SaaS",
    "Customs Compliance",
    "Pan-India MSME Exporters",
    "Global Trade Logistics",
    "VyaparFlow",
  ],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "VyaparFlow — Export Logistics Readiness Operating System",
    description:
      "Deterministic export readiness, compliance, and multi-carrier execution for Indian MSMEs.",
    url: "https://www.vyaparflow.online",
    siteName: "VyaparFlow",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VyaparFlow Export Readiness Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VyaparFlow — Export Logistics Readiness Platform",
    description:
      "Deterministic export readiness, compliance, and multi-carrier execution for Indian MSMEs.",
    images: ["/og-image.png"],
  },
};

import { Suspense } from "react";
import TopProgressIndicator from "@/components/TopProgressIndicator";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} ${plusJakarta.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <TopProgressIndicator />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
