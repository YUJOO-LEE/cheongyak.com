import type { NewsArticle } from '@/shared/types/api';

export const newsArticles: NewsArticle[] = [
  {
    id: 'news-001',
    title: '2026년 2분기 수도권 분양 일정 총정리',
    excerpt:
      '올해 2분기 수도권에서 분양 예정인 주요 단지들의 일정과 특징을 정리했습니다. 서울 강남권과 경기 남부 지역의 대단지 분양이 예정되어 있어 실수요자들의 관심이 집중됩니다.',
    body: '<h2>2분기 주요 분양 일정</h2><p>2026년 2분기에는 수도권에서 총 15개 단지, 약 2만 가구의 분양이 예정되어 있습니다.</p><p>특히 서울 서초구와 강남구에서 대규모 재건축 단지가 분양에 나서며, 분양가 상한제 적용 여부에 따라 시장에 큰 영향을 미칠 것으로 보입니다.</p>',
    category: 'market',
    thumbnailUrl: '/placeholder.svg',
    publishedAt: '2026-04-05T09:00:00Z',
    relatedSubscriptionIds: ['sub-001', 'sub-002'],
  },
  {
    id: 'news-002',
    title: '특별공급 소득기준 2026년 개정안 발표',
    excerpt:
      '국토교통부가 2026년도 특별공급 소득기준 개정안을 발표했습니다. 신혼부부와 생애최초 특별공급의 소득 상한이 상향 조정되어 더 많은 가구가 혜택을 받을 수 있게 됩니다.',
    body: '<h2>주요 개정 내용</h2><p>신혼부부 특별공급 소득기준이 도시근로자 월평균 소득 140%에서 160%로 상향됩니다.</p>',
    category: 'policy',
    thumbnailUrl: '/placeholder.svg',
    publishedAt: '2026-04-03T14:30:00Z',
  },
  {
    id: 'news-003',
    title: '전국 아파트 청약 경쟁률 분석: 3월 리포트',
    excerpt:
      '3월 전국 아파트 청약 경쟁률을 분석한 결과, 수도권 평균 경쟁률이 전월 대비 15% 상승했습니다. 특히 교통 호재가 있는 지역의 경쟁률이 두드러지게 높았습니다.',
    body: '<h2>3월 청약 경쟁률 요약</h2><p>전국 평균 청약 경쟁률은 12.3:1로 전월 10.7:1 대비 상승했습니다.</p>',
    category: 'analysis',
    thumbnailUrl: '/placeholder.svg',
    publishedAt: '2026-04-01T10:00:00Z',
  },
  {
    id: 'news-004',
    title: '청약홈 시스템 점검 안내 (4월 12일)',
    excerpt:
      '청약홈 시스템 정기 점검이 4월 12일 토요일 오전 2시부터 6시까지 실시됩니다. 해당 시간 동안 청약 접수 및 당첨 조회가 불가능합니다.',
    category: 'notice',
    publishedAt: '2026-03-30T16:00:00Z',
  },
  {
    id: 'news-005',
    title: '2026년 청약가점 계산법 완벽 가이드',
    excerpt:
      '청약 가점제의 세 가지 평가 항목(무주택기간, 부양가족 수, 청약통장 가입기간)에 대한 상세 계산 방법과 주의사항을 정리했습니다.',
    body: '<h2>청약 가점제란?</h2><p>가점제는 무주택기간(32점), 부양가족 수(35점), 청약통장 가입기간(17점) 등 총 84점 만점으로 당첨자를 선정하는 방식입니다.</p>',
    category: 'analysis',
    thumbnailUrl: '/placeholder.svg',
    publishedAt: '2026-03-28T11:00:00Z',
  },
  {
    id: 'news-006',
    title: '경기도 신도시 분양가 동향: 상승세 지속',
    excerpt:
      '경기도 주요 신도시의 분양가가 지속적으로 상승하고 있습니다. 광교, 동탄, 위례 등 주요 택지지구의 최근 분양가를 비교 분석했습니다.',
    category: 'market',
    thumbnailUrl: '/placeholder.svg',
    publishedAt: '2026-03-25T09:30:00Z',
  },
];
