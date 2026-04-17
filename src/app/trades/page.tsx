import Link from 'next/link';
import { Search, TrendingUp, BarChart3, Lock } from 'lucide-react';
import { Button } from '@/shared/components';
import { buildPageMetadata } from '@/shared/lib/seo';

export const metadata = buildPageMetadata({
  title: '실거래가',
  description:
    '전국 아파트 실거래가를 지역·단지별로 검색하고 시세 흐름과 최근 거래 내역을 한눈에 확인하세요. 곧 서비스를 시작합니다.',
  path: '/trades',
  keywords: [
    '아파트 실거래가',
    '실거래가 조회',
    '국토교통부 실거래가',
    '실거래가 공개시스템',
    '단지별 시세',
    '아파트 매매가',
    '아파트 시세',
  ],
});

const upcomingFeatures = [
  {
    icon: Search,
    title: '단지·지역 검색',
    description: '아파트 이름이나 지역명으로 빠르게 조회',
  },
  {
    icon: TrendingUp,
    title: '시세 흐름 파악',
    description: '기간별 실거래가 추이를 한눈에 시각화',
  },
  {
    icon: BarChart3,
    title: '면적·층별 비교',
    description: '같은 단지 내 타입별 거래 현황 비교',
  },
];

const previewItems = [
  { name: '래미안퍼스티지', region: '서울 서초구', price: '63억 5,000' },
  { name: '아크로리버파크', region: '서울 마포구', price: '48억 2,000' },
  { name: '반포자이', region: '서울 서초구', price: '42억 8,000' },
  { name: '잠실엘스', region: '서울 송파구', price: '38억 5,000' },
  { name: '헬리오시티', region: '서울 송파구', price: '31억 1,000' },
];

export default function TradesPage() {
  return (
    <div className="mx-auto max-w-300 px-4 lg:px-8 py-12 lg:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* 좌측: 텍스트 콘텐츠 */}
        <section>
          {/* 준비중 배지 */}
          <div
            className="inline-flex items-center gap-1.5 bg-brand-primary-50 text-brand-primary-600 text-label-md px-3 py-1 rounded-full mb-6 animate-fade-in-up"
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-brand-primary-500 animate-pulse-soft"
              aria-hidden="true"
            />
            준비중
          </div>

          <h1
            className="text-display-lg text-text-primary mb-4 animate-fade-in-up"
            style={{ animationDelay: '60ms' }}
          >
            실거래가 검색
          </h1>

          <p
            className="text-body-lg text-text-secondary mb-8 animate-fade-in-up"
            style={{ animationDelay: '120ms' }}
          >
            전국 아파트 실거래 데이터를 단지별, 지역별로 검색하고
            <br className="hidden lg:block" />
            시세 흐름과 최근 거래 내역을 한눈에 확인하세요.
          </p>

          <ul
            className="flex flex-col gap-4 mb-10 animate-fade-in-up"
            style={{ animationDelay: '180ms' }}
          >
            {upcomingFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <li key={feature.title} className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-md bg-brand-primary-50 flex items-center justify-center mt-0.5">
                    <Icon size={16} className="text-brand-primary-600" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-label-lg text-text-primary">{feature.title}</p>
                    <p className="text-body-md text-text-secondary">{feature.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div
            className="animate-fade-in-up"
            style={{ animationDelay: '240ms' }}
          >
            <Link href="/">
              <Button variant="secondary" size="lg">
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
        </section>

        {/* 우측: 블러 프리뷰 카드 */}
        <aside
          aria-hidden="true"
          className="animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          <div className="bg-bg-card rounded-xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <p className="text-label-lg text-text-primary">전국 실거래가 TOP 5</p>
              <span className="text-caption text-text-tertiary">미리보기</span>
            </div>

            <div className="flex flex-col gap-3 blur-sm opacity-60 select-none pointer-events-none">
              {previewItems.map((item, i) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-headline-sm tabular-nums text-text-tertiary w-4 shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-label-lg text-text-primary">{item.name}</p>
                      <p className="text-caption text-text-secondary">{item.region}</p>
                    </div>
                  </div>
                  <p className="text-label-lg text-brand-primary-700 tabular-nums shrink-0">
                    {item.price}
                  </p>
                </div>
              ))}
            </div>

            {/* 잠금 오버레이 */}
            <div className="absolute inset-0 bg-bg-card/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-bg-sunken flex items-center justify-center">
                <Lock size={18} className="text-text-tertiary" aria-hidden="true" />
              </div>
              <p className="text-body-md text-text-secondary text-center px-6">
                실거래가 데이터를 곧 공개할 예정입니다
              </p>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
