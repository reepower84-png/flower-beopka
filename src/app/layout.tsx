import type { Metadata } from "next";
import { IBM_Plex_Sans_KR } from "next/font/google";
import "./globals.css";
import { SITE } from "@/site.config";

const sans = IBM_Plex_Sans_KR({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  preload: false,
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: `${SITE.name} | 용도별 화환·꽃 전국 당일배송`,
  description: `개업·취임 축하화환, 근조화환, 승진·이전 동서양란과 관엽화분, 기념일 꽃다발까지 용도별로 빠르게 고르세요. ${SITE.name} 전화 주문 ${SITE.phone}`,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`h-full antialiased ${sans.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
