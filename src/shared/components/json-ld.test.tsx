// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  BreadcrumbListJsonLd,
  JsonLd,
  OrganizationJsonLd,
  SubscriptionJsonLd,
} from './json-ld';
import { SITE_URL } from '@/shared/lib/seo';

function parseJsonLd(html: string): Record<string, unknown> {
  const match = html.match(/<script[^>]*>(.*?)<\/script>/s);
  expect(match).not.toBeNull();
  return JSON.parse(match![1]!.replace(/\\u003c/g, '<'));
}

describe('JsonLd base', () => {
  it('escapes </script> sequences to prevent tag closing', () => {
    const html = renderToStaticMarkup(
      <JsonLd data={{ payload: 'A</script>B' }} />,
    );
    const body = html.match(/<script[^>]*>(.*?)<\/script>/s)![1]!;
    // The payload's `<` must be neutralized so the browser does not
    // prematurely close the script tag. Escaping only `<` is sufficient.
    expect(body).not.toContain('</script>');
    expect(body).toContain('\\u003c/script>B');
  });
});

describe('OrganizationJsonLd', () => {
  it('emits a valid Organization with SITE_URL', () => {
    const html = renderToStaticMarkup(<OrganizationJsonLd />);
    const data = parseJsonLd(html);
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('Organization');
    expect(data.url).toBe(SITE_URL);
    expect(data.logo).toBe(`${SITE_URL}/logo.svg`);
  });
});

describe('BreadcrumbListJsonLd', () => {
  it('normalizes the home breadcrumb to SITE_URL without trailing slash', () => {
    const html = renderToStaticMarkup(
      <BreadcrumbListJsonLd items={[{ name: '홈', url: '/' }]} />,
    );
    const data = parseJsonLd(html);
    const list = data.itemListElement as Array<Record<string, unknown>>;
    expect(list[0]!.item).toBe(SITE_URL);
  });

  it('prefixes relative paths with SITE_URL and enforces a leading slash', () => {
    const html = renderToStaticMarkup(
      <BreadcrumbListJsonLd
        items={[
          { name: '홈', url: '/' },
          { name: '청약 목록', url: '/listings' },
          { name: '예시', url: 'listings/x' },
        ]}
      />,
    );
    const data = parseJsonLd(html);
    const list = data.itemListElement as Array<Record<string, unknown>>;
    expect(list[1]!.item).toBe(`${SITE_URL}/listings`);
    expect(list[2]!.item).toBe(`${SITE_URL}/listings/x`);
  });

  it('preserves absolute URLs as-is', () => {
    const html = renderToStaticMarkup(
      <BreadcrumbListJsonLd
        items={[{ name: '외부', url: 'https://example.com/x' }]}
      />,
    );
    const data = parseJsonLd(html);
    const list = data.itemListElement as Array<Record<string, unknown>>;
    expect(list[0]!.item).toBe('https://example.com/x');
  });

  it('assigns 1-based positions in order', () => {
    const html = renderToStaticMarkup(
      <BreadcrumbListJsonLd
        items={[
          { name: 'A', url: '/' },
          { name: 'B', url: '/b' },
          { name: 'C', url: '/c' },
        ]}
      />,
    );
    const data = parseJsonLd(html);
    const list = data.itemListElement as Array<Record<string, unknown>>;
    expect(list.map((item) => item.position)).toEqual([1, 2, 3]);
  });
});

describe('SubscriptionJsonLd', () => {
  it('emits RealEstateListing with provider and contentLocation', () => {
    const html = renderToStaticMarkup(
      <SubscriptionJsonLd
        name="래미안 원베일리"
        location="서울특별시 서초구"
        builder="삼성물산"
        url={`${SITE_URL}/listings/sub-001`}
      />,
    );
    const data = parseJsonLd(html);
    expect(data['@type']).toBe('RealEstateListing');
    expect(data.url).toBe(`${SITE_URL}/listings/sub-001`);
    expect((data.provider as Record<string, unknown>).name).toBe('삼성물산');
    expect((data.contentLocation as Record<string, unknown>).name).toBe(
      '서울특별시 서초구',
    );
  });
});
