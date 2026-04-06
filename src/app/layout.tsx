import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: '청약닷컴 — 청약 일정 및 정보',
  description:
    '아파트 청약 일정, 분양 정보, 청약 뉴스를 한눈에. 청약닷컴에서 확인하세요.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
