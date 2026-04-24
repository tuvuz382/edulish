import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Edulish — Học Tiếng Anh Thông Minh",
  description:
    "Nền tảng học tiếng Anh thân thiện hiệu quả.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-slate-100" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
