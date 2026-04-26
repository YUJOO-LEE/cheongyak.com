import type { RelatedNewsItem } from '@/shared/types/api';

// Dev-only fixture for the listing detail "관련 뉴스" section. Real
// outlet domains are used so visual treatment matches production once
// the backend wires up the actual endpoint, but article paths are
// explicit `/news/sample-*` slugs — no real article is referenced and
// no production link is fabricated. The fixture is intentionally
// returned for every listing id so designers can preview the section
// on any listing during local review.
export const relatedNewsFixture: RelatedNewsItem[] = [
  {
    outlet: '연합뉴스',
    title: '서울 강남권 분양가 상한제 적용 단지, 청약 경쟁률 두 자릿수 기록',
    url: 'https://www.yna.co.kr/news/sample-1',
    publishedAt: '2026-04-22T09:15:00Z',
  },
  {
    outlet: '한국경제',
    title: '"실수요 청약 가점 65점도 안심 못한다" — 올해 당첨 커트라인 분석',
    url: 'https://www.hankyung.com/news/sample-2',
    publishedAt: '2026-04-19T23:40:00Z',
  },
  {
    outlet: '조선비즈',
    title: '특별공급 신청 인구 늘면서 신혼부부·다자녀 경쟁률 동반 상승',
    url: 'https://biz.chosun.com/news/sample-3',
    publishedAt: '2026-04-15T01:05:00Z',
  },
  {
    outlet: '머니투데이',
    title:
      '주택공급 정책 개편안 발표, 청약통장 가입 기간 단축이 핵심 — 시장 반응은',
    url: 'https://news.mt.co.kr/news/sample-4',
    publishedAt: '2026-04-10T12:30:00Z',
  },
];
