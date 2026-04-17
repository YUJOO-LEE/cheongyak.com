import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/shared/lib/seo';

interface JsonLdProps {
  data: Record<string, unknown>;
}

// Escape `</script>` sequences that could prematurely close the tag when
// user-supplied strings end up in structured data.
function serialize(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  );
}

function normalizeBreadcrumbUrl(url: string): string {
  if (url.startsWith('http')) return url;
  if (url === '/' || url === '') return SITE_URL;
  return `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`;
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo.svg`,
        description: SITE_DESCRIPTION,
        sameAs: [] as string[],
      }}
    />
  );
}

export function WebsiteJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/listings?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
        inLanguage: 'ko-KR',
      }}
    />
  );
}

export function SubscriptionJsonLd({
  name,
  location,
  builder,
  url,
}: {
  name: string;
  location: string;
  builder: string;
  url: string;
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name,
        url,
        description: `${name} - ${location} ${builder} 아파트 청약 정보`,
        provider: {
          '@type': 'Organization',
          name: builder,
        },
        contentLocation: {
          '@type': 'Place',
          name: location,
        },
      }}
    />
  );
}

export function NewsArticleJsonLd({
  title,
  description,
  url,
  publishedAt,
}: {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: title,
        description,
        url,
        datePublished: publishedAt,
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
        },
        inLanguage: 'ko-KR',
      }}
    />
  );
}

export function BreadcrumbListJsonLd({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: normalizeBreadcrumbUrl(item.url),
        })),
      }}
    />
  );
}
