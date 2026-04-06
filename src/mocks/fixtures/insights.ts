import type { MarketInsight } from '@/shared/types/api';

export const marketInsights: MarketInsight[] = [
  {
    label: '이번 달 평균 경쟁률',
    value: '12.3:1',
    trend: 'up',
    trendValue: '+15.2%',
  },
  {
    label: '이번 달 분양 세대수',
    value: '8,450',
    trend: 'up',
    trendValue: '+2,100',
  },
  {
    label: '인기 지역',
    value: '서울 서초구',
    trend: 'up',
    trendValue: '경쟁률 45:1',
  },
];
