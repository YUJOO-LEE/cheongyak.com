import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SearchRoot } from './search-root';
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
  themeColor: '#0356FF',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="antialiased">
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TW32X6NK');`,
          }}
        />
        {/* End Google Tag Manager */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-dvh flex flex-col bg-bg-page text-text-primary font-sans">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TW32X6NK"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {/*
          Skip link — KWCAG / WCAG 2.2 AA. Hidden visually until it
          receives keyboard focus, at which point it appears in the
          top-left so a screen-reader / keyboard user can jump past
          the navigation straight into the main content. Must remain
          the first focusable element in the document.
        */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-brand-primary-500 focus:text-text-inverse focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg focus:outline-none"
        >
          본문 바로가기
        </a>
        <AppSplash />
        <OrganizationJsonLd />
        <NuqsProvider>
          <QueryProvider>
            <AppReadyMarker />

            {/* Desktop top padding for fixed header */}
            <div className="hidden lg:block h-16" />

            <SearchRoot />

            <main id="main-content" className="flex-1">
              {children}
            </main>

            <Footer />

            {/* Mobile bottom padding for fixed nav */}
            <div className="lg:hidden h-16" />
          </QueryProvider>
        </NuqsProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
