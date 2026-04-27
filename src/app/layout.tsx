import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Add C0urt 憲庭加好友",
  description: "憲政科技平台 - 別讓你的權利已讀不回",
};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="antialiased min-h-screen flex flex-col font-sans">
        <a href="#main-content" className="skip-link">跳至主要內容</a>
        <Navbar />
        <main id="main-content" className="flex-grow flex flex-col w-full relative">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
