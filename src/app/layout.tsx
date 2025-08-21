import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}