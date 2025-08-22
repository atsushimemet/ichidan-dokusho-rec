import type { Metadata } from "next";
import Script from "next/script";
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
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8YPNZ4VYKX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8YPNZ4VYKX');
          `}
        </Script>
      </head>
      <body className="antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}