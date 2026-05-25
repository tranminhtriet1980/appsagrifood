import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GlobalToast from "@/components/GlobalToast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HRM System",
  description: "Human Resource Management System Boilerplate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <GlobalToast />
        {children}
      </body>
    </html>
  );
}
