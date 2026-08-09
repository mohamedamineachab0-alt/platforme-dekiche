import type { Metadata, Viewport } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "ديكيش أكاديمي | Dekich Academy",
  description: "منصة التعليم الجزائرية الأولى للتحضير لشهادة البكالوريا",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
