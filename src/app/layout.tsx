import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Add C0urt 憲庭加好友",
  description: "憲政科技平台 - 別讓你的權利已讀不回。將「過去課本裡的民主成就」轉化為「被卡住的現實危機」，降低公民理解憲法法庭價值的門檻。",
  openGraph: {
    title: "Add C0urt 憲庭加好友",
    description: "憲政科技平台 - 別讓你的權利已讀不回。降低公民理解憲法法庭價值的門檻，一起守護台灣民主。",
    type: "website",
    locale: "zh_TW",
    images: [{ url: "/owl.png", width: 360, height: 360, alt: "Add C0urt 貓頭鷹法官吉祥物" }],
  },
  twitter: {
    card: "summary",
    title: "Add C0urt 憲庭加好友",
    description: "憲政科技平台 - 別讓你的權利已讀不回",
    images: ["/owl.png"],
  },
};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LaunchGate from "@/components/LaunchGate";

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
          <LaunchGate>
            {children}
          </LaunchGate>
        </main>
        <Footer />
      </body>
    </html>
  );
}
