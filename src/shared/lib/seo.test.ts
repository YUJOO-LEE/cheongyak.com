// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, buildPageMetadata } from './seo';

describe('buildPageMetadata', () => {
  it('builds a trailing-slash-free canonical for root', () => {
    const meta = buildPageMetadata({ path: '/' });
    expect(meta.alternates?.canonical).toBe(SITE_URL);
    expect(meta.openGraph?.url).toBe(SITE_URL);
  });

  it('preserves nested paths on canonical', () => {
    const meta = buildPageMetadata({ path: '/listings/sub-001' });
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/listings/sub-001`);
  });

  it('auto-prepends leading slash when caller forgets', () => {
    const meta = buildPageMetadata({ path: 'listings' });
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/listings`);
  });

  it('falls back to SITE_DESCRIPTION when description is omitted', () => {
    const meta = buildPageMetadata({ path: '/' });
    expect(meta.description).toBe(SITE_DESCRIPTION);
    expect(meta.openGraph?.description).toBe(SITE_DESCRIPTION);
    expect(meta.twitter?.description).toBe(SITE_DESCRIPTION);
  });

  it('generates an /og image URL when ogImage is omitted', () => {
    const meta = buildPageMetadata({ title: '청약 목록', path: '/listings' });
    const og = meta.openGraph;
    const firstImage = Array.isArray(og?.images) ? og?.images?.[0] : undefined;
    expect(firstImage).toMatchObject({
      width: 1200,
      height: 630,
    });
    if (firstImage && typeof firstImage === 'object' && 'url' in firstImage) {
      expect(String(firstImage.url)).toBe(
        `${SITE_URL}/og?title=${encodeURIComponent('청약 목록')}`,
      );
    }
  });

  it('uses SITE_NAME for OG title fallback', () => {
    const meta = buildPageMetadata({ path: '/' });
    expect(meta.openGraph?.title).toBe(SITE_NAME);
  });

  it('mirrors the same OG image URL into the Twitter card', () => {
    const meta = buildPageMetadata({ title: '실거래가', path: '/trades' });
    const og = meta.openGraph;
    const firstOgImage = Array.isArray(og?.images) ? og?.images?.[0] : undefined;
    const ogUrl = firstOgImage && typeof firstOgImage === 'object' && 'url' in firstOgImage
      ? String(firstOgImage.url)
      : undefined;
    const twitterImages = meta.twitter && 'images' in meta.twitter ? meta.twitter.images : undefined;
    const twitterUrl = Array.isArray(twitterImages) ? twitterImages[0] : twitterImages;
    expect(twitterUrl).toBe(ogUrl);
  });

  it('switches OG type to article when requested', () => {
    const meta = buildPageMetadata({
      path: '/listings/x',
      ogType: 'article',
      publishedTime: '2026-01-01T00:00:00Z',
      modifiedTime: '2026-04-18T00:00:00Z',
    });
    const og = meta.openGraph as {
      type?: string;
      publishedTime?: string;
      modifiedTime?: string;
    };
    expect(og.type).toBe('article');
    expect(og.publishedTime).toBe('2026-01-01T00:00:00Z');
    expect(og.modifiedTime).toBe('2026-04-18T00:00:00Z');
  });

  it('accepts a custom ogImage override', () => {
    const custom = 'https://cdn.example.com/custom-og.png';
    const meta = buildPageMetadata({ path: '/', ogImage: custom });
    const firstImage = Array.isArray(meta.openGraph?.images)
      ? meta.openGraph?.images?.[0]
      : undefined;
    if (firstImage && typeof firstImage === 'object' && 'url' in firstImage) {
      expect(String(firstImage.url)).toBe(custom);
    }
  });
});
