import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VyaparFlow — Export Logistics Readiness Platform",
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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
