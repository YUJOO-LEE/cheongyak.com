interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebsiteJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: '청약닷컴',
        url: 'https://cheongyak.com',
        description: '아파트 청약 일정, 분양 정보, 청약 뉴스를 한눈에.',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://cheongyak.com/search?q={search_term_string}',
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
          name: '청약닷컴',
          url: 'https://cheongyak.com',
        },
        inLanguage: 'ko-KR',
      }}
    />
  );
}
