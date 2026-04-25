import type { Metadata, Viewport } from 'next';
// TODO(beta-deferred): SearchRoot mount disabled — see docs/beta-launch-deferred-features.md#search
// import { SearchRoot } from './search-root';
import { Navigation } from '@/shared/components/navigation';
import { AppReadyMarker, AppSplash } from '@/shared/components';
import { Footer } from '@/shared/components/footer';
import { OrganizationJsonLd } from '@/shared/components/json-ld';
import { NuqsProvider, QueryProvider } from '@/shared/components/providers';
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_LOCALE, SITE_NAME, SITE_URL } from '@/shared/lib/seo';
import '@/styles/globals.css';

const ROOT_TITLE = '청약닷컴 — 청약 일정 및 정보';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: ROOT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ['청약', '아파트 분양', '청약 일정', '분양 정보', '청약홈', '실거래가'],
  applicationName: SITE_NAME,
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    title: ROOT_TITLE,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: ROOT_TITLE,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
  robots: { index: true, follow: true },
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
        <AppSplash />
        <OrganizationJsonLd />
        <NuqsProvider>
          <QueryProvider>
            <AppReadyMarker />

            {/* Desktop top padding for fixed header */}
            <div className="hidden lg:block h-16" />

            {/* TODO(beta-deferred): replaced SearchRoot with bare Navigation while
                BE search endpoint is pending. Restore <SearchRoot /> here when
                ready — see docs/beta-launch-deferred-features.md#search */}
            <Navigation />

            <main className="flex-1">
              {children}
            </main>

            <Footer />

            {/* Mobile bottom padding for fixed nav */}
            <div className="lg:hidden h-16" />
          </QueryProvider>
        </NuqsProvider>
      </body>
    </html>
  );
}
