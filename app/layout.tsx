import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
