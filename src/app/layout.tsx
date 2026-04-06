import type { Metadata, Viewport } from 'next';
import { Navigation } from '@/shared/components/navigation';
import { Footer } from '@/shared/components/footer';
import { QueryProvider } from '@/shared/components/providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: '청약닷컴 — 청약 일정 및 정보',
    template: '%s | 청약닷컴',
  },
  description:
    '아파트 청약 일정, 분양 정보, 청약 뉴스를 한눈에. 청약닷컴에서 확인하세요.',
  keywords: ['청약', '아파트 분양', '청약 일정', '분양 정보', '청약홈'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="antialiased">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-dvh flex flex-col bg-bg-page text-text-primary font-sans">
        <QueryProvider>
          {/* Desktop top padding for fixed header */}
          <div className="hidden lg:block h-16" />

          <Navigation />

          <main className="flex-1">
            {children}
          </main>

          <Footer />

          {/* Mobile bottom padding for fixed nav */}
          <div className="lg:hidden h-16" />
        </QueryProvider>
      </body>
    </html>
  );
}
