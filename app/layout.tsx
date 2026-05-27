import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GlobalToast from "@/components/GlobalToast";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sagrifood HRM — Hệ thống Quản lý Nhân sự",
  description: "Nền tảng quản lý nhân sự toàn diện cho Sagrifood Food Group.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <GlobalToast />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
