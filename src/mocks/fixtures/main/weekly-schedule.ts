import type {
  MainWeeklyAnnouncement,
  MainWeeklyScheduleResponse,
} from '@/shared/types/main-api';

// Servers return the same announcement on every date its application window
// covers, so the mapper has to de-duplicate by id. Reproduce that pattern in
// the fixture (announcement 1002 appears on both TUESDAY and WEDNESDAY; 1003
// on both THURSDAY and FRIDAY) to keep the mapper under test.
const hillstate: MainWeeklyAnnouncement = {
  id: 1002,
  houseName: '힐스테이트 광교중앙역',
  status: 'SUBSCRIPTION_SCHEDULED',
  houseDetailType: 'NATIONAL',
  sigunguName: '수원시',
  dongName: '하동',
  constructorName: '현대건설',
  totalSupplyHousehold: 1247,
  minSupplyArea: 84,
  maxSupplyArea: 114,
};

const xi: MainWeeklyAnnouncement = {
  id: 1003,
  houseName: 'DMC 자이 더퍼스트',
  status: 'SUBSCRIPTION_ACTIVE',
  houseDetailType: 'PRIVATE',
  sigunguName: '서울특별시 은평구',
  dongName: '수색동',
  constructorName: 'GS건설',
  totalSupplyHousehold: 880,
  minSupplyArea: 59,
  maxSupplyArea: 98,
};

const prugio: MainWeeklyAnnouncement = {
  id: 1004,
  houseName: '영등포 푸르지오 파크비엔',
  status: 'SUBSCRIPTION_ACTIVE',
  houseDetailType: 'PRIVATE',
  sigunguName: '서울특별시 영등포구',
  dongName: '문래동',
  constructorName: '대우건설',
  totalSupplyHousehold: 520,
  minSupplyArea: 59,
  maxSupplyArea: 84,
};

export const mainWeeklySchedule: MainWeeklyScheduleResponse = {
  startDate: '2026-04-13',
  endDate: '2026-04-19',
  days: [
    {
      date: '2026-04-13',
      dayOfWeek: 'MONDAY',
      count: 0,
      announcements: [],
    },
    {
      date: '2026-04-14',
      dayOfWeek: 'TUESDAY',
      count: 2,
      announcements: [hillstate, xi],
    },
    {
      date: '2026-04-15',
      dayOfWeek: 'WEDNESDAY',
      count: 2,
      announcements: [hillstate, prugio],
    },
    {
      date: '2026-04-16',
      dayOfWeek: 'THURSDAY',
      count: 1,
      announcements: [xi],
    },
    {
      date: '2026-04-17',
      dayOfWeek: 'FRIDAY',
      count: 1,
      announcements: [prugio],
    },
  ],
};
