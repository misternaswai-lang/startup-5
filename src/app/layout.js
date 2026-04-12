"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning lang="ru">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} bg-black text-white`}
      >
        {/* Header */}
        <Header />

        {/* Content */}
        <main className=" p-6">{children}</main>
      </body>
    </html>
  );
}
