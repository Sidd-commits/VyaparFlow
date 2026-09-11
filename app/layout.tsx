import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "VyaparFlow — Export Logistics Readiness Operating System",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} ${plusJakarta.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
