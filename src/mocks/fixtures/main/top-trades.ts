import type { TopTradeResponse } from '@/shared/types/main-api';

// dealAmount is 만원 per the DTO. Values mix "n억 딱 떨어짐" (280000 = 28억,
// 350000 = 35억, 510000 = 51억) with "n억 n,nnn만" leftovers (423000 =
// 42억 3,000만, 320500 = 32억 500만) so the mapper's formatAmount branch
// coverage exercises both paths.
export const mainTopTrades: TopTradeResponse[] = [
  {
    id: 7001,
    aptName: '한강변 아크로리버파크',
    sigunguName: '서울특별시 서초구',
    dongName: '반포동',
    exclusiveArea: 84.99,
    floor: 32,
    dealAmount: 423000,
    dealDate: '2026-04-15',
  },
  {
    id: 7002,
    aptName: '은마아파트',
    sigunguName: '서울특별시 강남구',
    dongName: '대치동',
    exclusiveArea: 76.79,
    floor: 14,
    dealAmount: 280000,
    dealDate: '2026-04-14',
  },
  {
    id: 7003,
    aptName: '개포 래미안 블레스티지',
    sigunguName: '서울특별시 강남구',
    dongName: '개포동',
    exclusiveArea: 99.43,
    floor: 21,
    dealAmount: 350000,
    dealDate: '2026-04-13',
  },
  {
    id: 7004,
    aptName: '잠실 엘스',
    sigunguName: '서울특별시 송파구',
    dongName: '잠실동',
    exclusiveArea: 84.88,
    floor: 17,
    dealAmount: 320500,
    dealDate: '2026-04-12',
  },
  {
    id: 7005,
    aptName: '압구정 현대',
    sigunguName: '서울특별시 강남구',
    dongName: '압구정동',
    exclusiveArea: 131.48,
    floor: 9,
    dealAmount: 510000,
    dealDate: '2026-04-11',
  },
];
