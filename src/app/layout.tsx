import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shift Schedule — ตารางกะทีม",
  description: "จัดตารางกะงานของทีมแบบออนไลน์ ดูง่าย แก้ง่าย แลกกะได้",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Apply saved theme before paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
