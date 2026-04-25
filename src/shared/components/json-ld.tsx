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
  // SearchAction was removed intentionally: Google only enables the
  // Sitelinks Search Box when the advertised urlTemplate actually runs
  // a search. /listings currently ignores ?q, so declaring SearchAction
  // would be a false capability signal. Re-enable `potentialAction` once
  // the listings client binds a q parameter (see docs/seo-keyword-map.md
  // — /tools/gajeom-calculator and filter persistence roadmap).
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
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

/**
 * `ItemList` of `RealEstateListing` entries for `/listings`.
 *
 * Embedding the visible card data as schema.org markup gives both
 * classical search and AI-overview crawlers structured access to the
 * page's main content — they no longer have to scrape the DOM. Tied to
 * the SSR cutover: the markup ships in the initial HTML so it's
 * crawler-discoverable without JS execution.
 */
export function ListingsItemListJsonLd({
  items,
}: {
  items: Array<{
    name: string;
    location: string;
    builder: string;
    url: string;
    datePosted: string;
  }>;
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'RealEstateListing',
            name: item.name,
            url: item.url,
            datePosted: item.datePosted,
            description: `${item.name} — ${item.location} ${item.builder} 아파트 청약 정보`,
            provider: {
              '@type': 'Organization',
              name: item.builder,
            },
            contentLocation: {
              '@type': 'Place',
              name: item.location,
            },
          },
        })),
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
