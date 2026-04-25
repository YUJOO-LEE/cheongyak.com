import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components';
import { buildPageMetadata } from '@/shared/lib/seo';

export const metadata = buildPageMetadata({
  title: '소개',
  description:
    '청약닷컴 — 청약 일정, 한 화면에서. 청약홈·LH·국토교통부에 흩어진 분양 정보를 한 곳에 모아서 보여드립니다.',
  path: '/about',
  keywords: [
    '청약닷컴 소개',
    '청약 정보 서비스',
    '아파트 분양 데이터',
    '한국부동산원',
    '국토교통부 데이터',
    'LH 청약',
  ],
});

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-300 px-4 lg:px-8 py-12 lg:py-20">
      {/* Hero */}
      <section className="hero-gradient-mesh rounded-xl px-6 lg:px-12 py-16 lg:py-24 mb-16 lg:mb-20">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 bg-brand-primary-50 text-brand-primary-700 text-label-md px-3 py-1 rounded-full mb-6 animate-fade-in-up">
            청약닷컴
          </span>

          <h1
            className="text-display-lg text-text-primary mb-6 animate-fade-in-up"
            style={{ animationDelay: '60ms' }}
          >
            청약 일정,
            <br />
            한 화면에서
          </h1>

          <p
            className="text-body-lg text-text-secondary animate-fade-in-up"
            style={{ animationDelay: '120ms' }}
          >
            청약홈·LH·국토교통부 분양 정보 제공
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-8 lg:py-12">
        <p className="text-body-lg text-text-secondary mb-6">
          이번 주 청약 일정이 궁금하다면
        </p>
        <Link href="/listings" aria-label="청약 일정 보러 가기">
          <Button variant="primary" size="lg">
            청약 일정 보러 가기
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </Link>
      </section>
    </article>
  );
}
