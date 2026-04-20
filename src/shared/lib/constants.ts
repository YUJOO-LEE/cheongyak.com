import type { SubscriptionStatus, SubscriptionType, NewsCategory } from '@/shared/types/api';

export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  upcoming: '접수예정',
  accepting: '접수중',
  pending: '발표대기',
  result_today: '발표일',
  closed: '청약완료',
};

export const TYPE_LABELS: Record<SubscriptionType, string> = {
  public: '공공',
  private: '민간',
};

export const NEWS_CATEGORY_LABELS: Record<Exclude<NewsCategory, 'all'>, string> = {
  policy: '정책',
  market: '시장동향',
  analysis: '분석',
  notice: '공지',
};
