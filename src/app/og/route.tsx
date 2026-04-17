import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

const BRAND_PRIMARY = '#0356FF';
const BRAND_SECONDARY = '#00FFC2';
const NEUTRAL_900 = '#0D1117';
const NEUTRAL_100 = '#F4F6FA';

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
          background: `linear-gradient(135deg, ${NEUTRAL_100} 0%, #FFFFFF 55%, #E6EFFF 100%)`,
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
            color: '#475467',
            fontSize: 22,
            fontWeight: 500,
          }}
        >
          <span>아파트 청약 일정 · 분양 정보 · 실거래가</span>
          <span style={{ color: BRAND_PRIMARY, fontWeight: 700 }}>청약닷컴</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
