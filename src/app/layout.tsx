import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'أكاديمية السادات للعلوم الإدارية | بوابة الشكاوى الأكاديمية والتوجيه الذكي',
  description: 'البوابة المركزية الموحدة لاستقبال وتصنيف ومتابعة شكاوى ومقترحات طلاب أكاديمية السادات للعلوم الإدارية بكافة الفروع.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
