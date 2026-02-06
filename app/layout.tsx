import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Whisper Blueprint Engine",
  description: "AI-Powered UI Paradigm Shift",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans bg-[#fdfdfd] text-slate-900 selection:bg-brand-primary/20 selection:text-brand-primary`}
      >
        <Sidebar />
        <main className="min-h-screen relative">{children}</main>
      </body>
    </html>
  );
}
