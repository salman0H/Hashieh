import type { Metadata } from "next";
import "@fontsource/vazirmatn/400.css";
import "@fontsource/vazirmatn/500.css";
import "@fontsource/vazirmatn/600.css";
import "@fontsource/vazirmatn/700.css";
import "@fontsource/vazirmatn/800.css";
import "@fontsource-variable/inter";
import "./globals.css";
export const metadata: Metadata = {
  title: "حاشیه — فضای یادگیری تو",
  description:
    "از یادداشت‌های پراکنده تا دانشی که به هم وصل می‌شود. تختهٔ شخصی، نقشهٔ یادگیری و مرور آموخته‌ها.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
