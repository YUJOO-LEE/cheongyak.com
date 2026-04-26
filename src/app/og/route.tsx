import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

// satori (next/og) cannot resolve Tailwind utilities or CSS variables — the
// hex values below MUST stay in sync with DESIGN.md brand tokens. Chanel
// owns the source of truth; Dewey owns this file's consistency with it.
const BRAND_PRIMARY = '#005BD4'; // brand-primary-500 (matches globals.css)
const BRAND_SECONDARY = '#00FFC2'; // brand-secondary-500
const WHITE = '#FFFFFF';
const WHITE_70 = 'rgba(255, 255, 255, 0.7)';
const WHITE_85 = 'rgba(255, 255, 255, 0.85)';
const WHITE_15 = 'rgba(255, 255, 255, 0.15)';

// Logo path from src/app/icon.svg, viewBox 0 0 22 20.
const LOGO_PATH =
  'M10.3198 0.631121C10.7034 0.275181 11.2966 0.275181 11.6802 0.631122L16.3069 4.92416L11.3223 11.5703C11.1481 11.8025 10.8136 11.8381 10.5944 11.6479L8.85186 10.1348C8.65366 9.96273 8.35611 9.97321 8.1705 10.1588L7.38888 10.9404C7.18036 11.149 7.19667 11.4917 7.42405 11.6795L10.8631 14.5196C11.0719 14.692 11.38 14.6669 11.5581 14.463L18.2858 6.76041L21.2566 9.51695C21.923 10.1353 21.4855 11.25 20.5764 11.25H19V19C19 19.5523 18.5523 20 18 20H4C3.44771 20 3 19.5523 3 19V11.25H1.42356C0.514513 11.25 0.0770084 10.1353 0.74338 9.51695L10.3198 0.631121Z';

// Korean labels for SubscriptionStatus. Inlined here so OG stays edge-friendly
// and decoupled from `src/shared/lib/constants.ts` (which pulls in zod-typed
// imports). Must stay in sync with STATUS_LABELS.
const STATUS_LABEL: Record<string, string> = {
  accepting: '접수중',
  upcoming: '접수예정',
  pending: '발표대기',
  result_today: '발표일',
  closed: '청약완료',
};

// OG URLs are scraped repeatedly by social platforms — cache aggressively
// to avoid paying edge CPU on every message preview.
const CACHE_HEADERS = {
  'Cache-Control': 'public, immutable, no-transform, max-age=31536000, s-maxage=31536000',
} as const;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title')?.slice(0, 80) || '청약닷컴';
  const subtitle = searchParams.get('subtitle')?.slice(0, 60) || '';
  const statusParam = searchParams.get('status') ?? '';
  const statusLabel = STATUS_LABEL[statusParam] ?? '';
  const period = searchParams.get('period')?.slice(0, 60) ?? '';
  // ratio=kakao → 800×800 (1:1) for Kakao Share. Kakao chat list shows the
  // image as a square thumbnail; the inline feed card crops to 2:1 (top/bottom
  // shaved). A 1:1 canvas with center-stacked content keeps the title visible
  // in BOTH surfaces — the brand row + footer get partially clipped in the
  // feed card, but the title (the actual message) stays. 800×800 sits well
  // within Kakao's accepted dimension envelope.
  const isKakao = searchParams.get('ratio') === 'kakao';

  if (isKakao) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '64px 56px',
            background: BRAND_PRIMARY,
            fontFamily: 'Pretendard, system-ui, sans-serif',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              color: WHITE,
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            <svg width={44} height={40} viewBox="0 0 22 20" xmlns="http://www.w3.org/2000/svg">
              <path d={LOGO_PATH} fill={WHITE} />
            </svg>
            청약닷컴
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '28px',
              maxWidth: '720px',
            }}
          >
            {statusLabel && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: WHITE_15,
                  color: WHITE,
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  padding: '10px 22px',
                  borderRadius: 999,
                }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    background: statusParam === 'accepting' ? BRAND_SECONDARY : WHITE,
                  }}
                />
                {statusLabel}
              </div>
            )}
            <div
              style={{
                color: WHITE,
                fontSize: 80,
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                display: 'flex',
                textAlign: 'center',
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div
                style={{
                  color: WHITE_85,
                  fontSize: 36,
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  display: 'flex',
                }}
              >
                {subtitle}
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              color: WHITE_70,
              fontSize: 26,
              fontWeight: 500,
            }}
          >
            {period && <span>분양기간 {period}</span>}
            <span style={{ color: WHITE, fontWeight: 700, fontSize: 30 }}>cheongyak.com</span>
          </div>
        </div>
      ),
      { width: 800, height: 800, headers: CACHE_HEADERS },
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: BRAND_PRIMARY,
          fontFamily: 'Pretendard, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            color: WHITE,
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          <svg width={56} height={51} viewBox="0 0 22 20" xmlns="http://www.w3.org/2000/svg">
            <path d={LOGO_PATH} fill={WHITE} />
          </svg>
          청약닷컴
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px' }}>
          {(statusLabel || subtitle) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {statusLabel && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: WHITE_15,
                    color: WHITE,
                    fontSize: 32,
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    padding: '10px 22px',
                    borderRadius: 999,
                  }}
                >
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 999,
                      background: statusParam === 'accepting' ? BRAND_SECONDARY : WHITE,
                    }}
                  />
                  {statusLabel}
                </div>
              )}
              {subtitle && (
                <div
                  style={{
                    color: WHITE_85,
                    fontSize: 38,
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {subtitle}
                </div>
              )}
            </div>
          )}
          <div
            style={{
              color: WHITE,
              fontSize: 96,
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
            color: WHITE_70,
            fontSize: 30,
            fontWeight: 500,
          }}
        >
          <span>
            {period ? `분양기간 ${period}` : '아파트 청약 일정 · 분양 정보 · 실거래가'}
          </span>
          <span style={{ color: WHITE, fontWeight: 700 }}>cheongyak.com</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: CACHE_HEADERS },
  );
}
