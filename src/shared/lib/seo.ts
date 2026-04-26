import type { Metadata } from 'next';

// Required env. Set explicitly in every environment so canonical URLs,
// sitemap entries, OG metadata, and share links resolve correctly:
//   - Vercel production / preview / development → https://cheongyak.com
//   - Local .env.local                          → http://localhost:715
//   - Vitest test setup (src/test-setup.ts)     → https://cheongyak.com
// No silent fallback — a missing value should fail loudly at boot rather
// than ship a wrong canonical to Google.
function readSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) {
    throw new Error(
      'NEXT_PUBLIC_SITE_URL is required. Set it in .env.local (locally) and in Vercel (production / preview / development).',
    );
  }
  return raw.replace(/\/+$/, '');
}

export const SITE_URL = readSiteUrl();
export const SITE_NAME = '청약닷컴';
export const SITE_LOCALE = 'ko_KR';
export const SITE_DESCRIPTION =
  '아파트 청약 일정, 분양 정보, 실거래가를 한눈에. 청약닷컴에서 확인하세요.';

export const DEFAULT_OG_IMAGE = {
  url: `${SITE_URL}/og?title=${encodeURIComponent(SITE_NAME)}`,
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — 청약 일정과 분양 정보`,
} as const;

type PageMetaInput = {
  title?: string;
  description?: string;
  path: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
};

export function buildPageMetadata(input: PageMetaInput): Metadata {
  const canonicalPath = input.path.startsWith('/') ? input.path : `/${input.path}`;
  const canonical = `${SITE_URL}${canonicalPath === '/' ? '' : canonicalPath}`;
  const description = input.description ?? SITE_DESCRIPTION;
  const ogImageUrl =
    input.ogImage ??
    `${SITE_URL}/og?title=${encodeURIComponent(input.title ?? SITE_NAME)}`;

  return {
    title: input.title,
    description,
    keywords: input.keywords,
    alternates: { canonical },
    openGraph: {
      type: input.ogType ?? 'website',
      url: canonical,
      title: input.title ?? SITE_NAME,
      description,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: input.title ?? SITE_NAME,
        },
      ],
      ...(input.publishedTime && { publishedTime: input.publishedTime }),
      ...(input.modifiedTime && { modifiedTime: input.modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title ?? SITE_NAME,
      description,
      images: [ogImageUrl],
    },
  };
}
