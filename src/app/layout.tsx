import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { getProfile } from "@/lib/auth/get-profile";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "완숙 — 요청하면 딱 맞는 숙소 견적",
  description: "여행객의 조건에 맞춰 숙소 사장님이 견적을 보내는 역제안 숙박 매칭 서비스",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getProfile();

  return (
    <html lang="ko" className={`${nunito.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Header profile={profile} />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[var(--color-border)] bg-white/60 py-6 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} 완숙 MVP · 따뜻한 숙소 매칭을 연결해 드려요
        </footer>
      </body>
    </html>
  );
}
