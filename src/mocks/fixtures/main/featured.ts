import type { MainFeaturedResponse } from '@/shared/types/main-api';

// minTopAmount / maxTopAmount are in 만원 (10 000 KRW) units per the backend
// DTO contract. 150000 = 15억, 450000 = 45억.
export const mainFeatured: MainFeaturedResponse = {
  id: 1001,
  houseName: '래미안 원베일리',
  status: 'SUBSCRIPTION_ACTIVE',
  houseDetailType: 'PRIVATE',
  sidoName: '서울특별시',
  sigunguName: '서초구',
  dongName: '반포동',
  constructorName: '삼성물산',
  totalSupplyHousehold: 2990,
  minSupplyArea: 59,
  maxSupplyArea: 191,
  minTopAmount: 150000,
  maxTopAmount: 450000,
  subscriptionStartDate: '2026-04-06',
  subscriptionEndDate: '2026-04-10',
};
