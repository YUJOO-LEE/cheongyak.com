import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

// satori (next/og) cannot resolve Tailwind utilities or CSS variables — the
// hex values below MUST stay in sync with DESIGN.md brand tokens. Chanel
// owns the source of truth; Dewey owns this file's consistency with it.
const BRAND_PRIMARY = '#0356FF'; // brand-primary-500
const BRAND_SECONDARY = '#00FFC2'; // brand-secondary-500
const BRAND_PRIMARY_50 = '#EEF4FF'; // brand-primary-50
const NEUTRAL_50 = '#F8F9FA'; // neutral-50 (page canvas)
const NEUTRAL_600 = '#475569'; // neutral-600 (text-secondary)
const NEUTRAL_900 = '#0F172A'; // neutral-900 (text-primary)

// OG URLs are scraped repeatedly by social platforms — cache aggressively
// to avoid paying edge CPU on every message preview.
const CACHE_HEADERS = {
  'Cache-Control': 'public, immutable, no-transform, max-age=31536000, s-maxage=31536000',
} as const;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title')?.slice(0, 80) || '청약닷컴';
  const subtitle = searchParams.get('subtitle')?.slice(0, 60) || '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background: `linear-gradient(135deg, ${NEUTRAL_50} 0%, #FFFFFF 55%, ${BRAND_PRIMARY_50} 100%)`,
          fontFamily: 'Pretendard, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            color: BRAND_PRIMARY,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: BRAND_PRIMARY,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: BRAND_SECONDARY,
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            청
          </div>
          cheongyak.com
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px' }}>
          {subtitle && (
            <div
              style={{
                color: BRAND_PRIMARY,
                fontSize: 30,
                fontWeight: 600,
                letterSpacing: '-0.01em',
              }}
            >
              {subtitle}
            </div>
          )}
          <div
            style={{
              color: NEUTRAL_900,
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              display: 'flex',
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: NEUTRAL_600,
            fontSize: 22,
            fontWeight: 500,
          }}
        >
          <span>아파트 청약 일정 · 분양 정보 · 실거래가</span>
          <span style={{ color: BRAND_PRIMARY, fontWeight: 700 }}>청약닷컴</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: CACHE_HEADERS },
  );
}
