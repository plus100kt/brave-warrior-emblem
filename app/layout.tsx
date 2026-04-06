import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "엠블럼 길드 대시보드",
  description: "Prisma + SQLite CRUD 버전"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
