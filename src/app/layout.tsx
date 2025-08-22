import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from './layout-client';

export const metadata: Metadata = {
  title: "読書レコメンド | あなたにぴったりの一冊を見つけよう",
  description: "3つの質問に答えるだけで、あなたの嗜好に合った書籍をレコメンドします。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}