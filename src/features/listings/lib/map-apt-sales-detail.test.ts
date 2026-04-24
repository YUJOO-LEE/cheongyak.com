import { describe, expect, it } from 'vitest';
import type { AptSalesDetailResponse } from '@/shared/api/generated/schemas/aptSalesDetailResponse';
import {
  deriveSchedulePhases,
  mapAptSalesDetailToSubscription,
  parseSupplyAddress,
  pickActiveRegulations,
  formatPriceManWon,
} from './map-apt-sales-detail';

describe('pickActiveRegulations', () => {
  it('returns only truthy flag keys in stable order', () => {
    const active = pickActiveRegulations({
      speculativeArea: true,
      adjustmentArea: false,
      priceCeiling: null,
      redevelopment: true,
      publicHousingDistrict: undefined,
      largeScaleDevelopment: false,
      metropolitanPublicHousing: null,
      publicHousingSpecialLaw: true,
    });
    expect(active).toEqual([
      'speculativeArea',
      'redevelopment',
      'publicHousingSpecialLaw',
    ]);
  });

  it('returns empty array when section is null', () => {
    expect(pickActiveRegulations(null)).toEqual([]);
    expect(pickActiveRegulations(undefined)).toEqual([]);
  });
});

describe('parseSupplyAddress', () => {
  it('strips sido prefix and extracts gugun + dong', () => {
    expect(
      parseSupplyAddress('서울특별시 서초구 반포동 1-1', '서울특별시'),
    ).toEqual({ gugun: '서초구', dong: '반포동' });
  });

  it('combines "시 + 구" two-token sigungu', () => {
    expect(
      parseSupplyAddress('경기도 수원시 영통구 하동 900', '경기도'),
    ).toEqual({ gugun: '수원시 영통구', dong: '하동' });
  });

  it('leaves dong undefined when token is purely numeric', () => {
    expect(
      parseSupplyAddress('세종특별자치시 나성동 123', '세종특별자치시'),
    ).toEqual({ gugun: '나성동', dong: undefined });
  });

  it('returns empty when address is missing', () => {
    expect(parseSupplyAddress(null, '서울특별시')).toEqual({
      gugun: '',
      dong: undefined,
    });
  });
});

describe('deriveSchedulePhases', () => {
  const schedule = {
    announcementDate: '2026-03-20',
    subscription: { start: '2026-04-06', end: '2026-04-10' },
    specialSupply: { start: '2026-04-06', end: '2026-04-06' },
    firstRankLocal: { start: '2026-04-07', end: '2026-04-07' },
    firstRankGyeonggi: null,
    firstRankOther: null,
    secondRankLocal: { start: '2026-04-10', end: '2026-04-10' },
    secondRankGyeonggi: null,
    secondRankOther: null,
    winnerAnnouncementDate: '2026-04-25',
    contract: { start: '2026-05-01', end: '2026-05-14' },
  };

  it('produces phases in canonical order and excludes nulls', () => {
    const phases = deriveSchedulePhases(
      { ...schedule, firstRankLocal: null }, // drop 1순위
      '2028-06',
      new Date('2026-04-08'),
    );
    expect(phases.map((p) => p.phase)).toEqual([
      'announcement',
      'special-supply',
      'second-rank',
      'winner-announcement',
      'contract',
      'move-in',
    ]);
  });

  it('tags the current phase based on today', () => {
    const phases = deriveSchedulePhases(
      schedule,
      '2028-06',
      new Date('2026-04-07'),
    );
    const byPhase = Object.fromEntries(phases.map((p) => [p.phase, p.state]));
    expect(byPhase.announcement).toBe('past');
    expect(byPhase['special-supply']).toBe('past');
    expect(byPhase['first-rank']).toBe('current');
    expect(byPhase['second-rank']).toBe('future');
    expect(byPhase['move-in']).toBe('future');
  });

  it('returns empty array when schedule + moveInMonth are all null', () => {
    expect(deriveSchedulePhases(null, null, new Date('2026-04-08'))).toEqual(
      [],
    );
  });

  it('synthesizes yyyy-MM-01 for move-in phase', () => {
    const phases = deriveSchedulePhases(
      { announcementDate: '2026-03-20' },
      '2028-06',
      new Date('2026-04-08'),
    );
    const moveIn = phases.find((p) => p.phase === 'move-in');
    expect(moveIn?.startDate).toBe('2028-06-01');
    expect(moveIn?.state).toBe('future');
  });
});

describe('formatPriceManWon', () => {
  it('prints whole 억 without remainder', () => {
    expect(formatPriceManWon(150000)).toBe('15억');
  });

  it('prints 억 + 만 when there is a remainder', () => {
    expect(formatPriceManWon(162500)).toBe('16억 2,500만');
  });

  it('prints 만 only for values under 1억', () => {
    expect(formatPriceManWon(7500)).toBe('7,500만');
  });
});

describe('mapAptSalesDetailToSubscription', () => {
  const response: AptSalesDetailResponse = {
    announcement: {
      id: 1,
      houseName: '래미안 원베일리',
      status: 'SUBSCRIPTION_ACTIVE',
      houseDetailType: 'PRIVATE',
      regionCode: 'SEOUL',
      regionName: '서울특별시',
      supplyAddress: '서울특별시 서초구 반포동 1-1',
      supplyZipCode: '06526',
      totalSupplyHouseholdCount: 2990,
      constructorName: '삼성물산',
      businessEntityName: '삼성물산(주)',
      inquiryPhone: '02-2222-3333',
      homepageUrl: 'https://example.com/raemian',
      announcementUrl: 'https://apply.example.com/1',
      moveInMonth: '2028-06',
      schedule: {
        announcementDate: '2026-03-20',
        subscription: { start: '2026-04-06', end: '2026-04-10' },
        specialSupply: { start: '2026-04-06', end: '2026-04-06' },
        firstRankLocal: { start: '2026-04-07', end: '2026-04-07' },
        firstRankGyeonggi: null,
        firstRankOther: null,
        secondRankLocal: { start: '2026-04-10', end: '2026-04-10' },
        secondRankGyeonggi: null,
        secondRankOther: null,
        winnerAnnouncementDate: '2026-04-25',
        contract: { start: '2026-05-01', end: '2026-05-14' },
      },
      regulations: {
        speculativeArea: true,
        adjustmentArea: false,
        priceCeiling: true,
        redevelopment: null,
        publicHousingDistrict: null,
        largeScaleDevelopment: null,
        metropolitanPublicHousing: null,
        publicHousingSpecialLaw: null,
      },
    },
    models: [
      {
        modelNo: '01',
        houseType: '059.9400A',
        supplyArea: 59.94,
        generalSupplyCount: 100,
        specialSupplyCount: 60,
        specialDetail: {
          multiChild: 20,
          newlywed: 30,
          firstTime: 10,
          elderlyParent: null,
          institution: null,
          etc: null,
          transferInstitution: null,
          youth: null,
          newborn: null,
        },
        topAmount: 120000,
      },
      {
        modelNo: '02',
        houseType: '084.9345A',
        supplyArea: 84.93,
        generalSupplyCount: 120,
        specialSupplyCount: 80,
        specialDetail: {
          multiChild: 30,
          newlywed: 40,
          firstTime: 10,
          elderlyParent: null,
          institution: null,
          etc: null,
          transferInstitution: null,
          youth: null,
          newborn: null,
        },
        topAmount: 200000,
      },
    ],
    competitions: [
      {
        houseType: '084.9345A',
        subscriptionRank: 1,
        residenceName: '해당지역',
        supplyHouseholdCount: 120,
        requestCount: 1800,
        competitionRate: 15.0,
        competitionRateDisplay: '15.0',
        isShortage: false,
      },
    ],
    winnerScores: [
      {
        houseType: '084.9345A',
        residenceName: '해당지역',
        lowestScore: 63,
        highestScore: 72,
        averageScore: 67.5,
        lowestScoreDisplay: '63',
        highestScoreDisplay: '72',
        averageScoreDisplay: '67.5',
      },
    ],
    specialSupplies: [
      {
        houseType: '084.9345A',
        totalSupplyCount: 80,
        subscriptionResult: '완료',
        categories: [
          {
            categoryName: '신혼부부',
            supplyCount: 40,
            localAreaCount: 35,
            metropolitanCount: 3,
            otherAreaCount: 2,
            totalCount: 40,
            preparCount: null,
          },
          {
            categoryName: '다자녀',
            supplyCount: 30,
            localAreaCount: 25,
            metropolitanCount: 3,
            otherAreaCount: 2,
            totalCount: 30,
            preparCount: null,
          },
        ],
      },
    ],
  };

  it('folds the 5-section response into SubscriptionDetail', () => {
    const domain = mapAptSalesDetailToSubscription(
      response,
      new Date('2026-04-07'),
    );
    expect(domain.id).toBe('1');
    expect(domain.name).toBe('래미안 원베일리');
    expect(domain.location).toEqual({
      sido: '서울특별시',
      gugun: '서초구',
      dong: '반포동',
    });
    expect(domain.status).toBe('accepting');
    expect(domain.type).toBe('private');
    expect(domain.applicationStart).toBe('2026-04-06');
    expect(domain.applicationEnd).toBe('2026-04-10');
    expect(domain.totalUnits).toBe(2990);
    expect(domain.sizeRange).toBe('59.9㎡ ~ 84.9㎡');
    expect(domain.priceRange).toBe('12억 ~ 20억');
    expect(domain.builderUrl).toBe('https://example.com/raemian');
    expect(domain.applyHomeUrl).toBe('https://apply.example.com/1');
    expect(domain.moveInMonth).toBe('2028-06');
    expect(domain.inquiryPhone).toBe('02-2222-3333');
    expect(domain.regulations).toEqual(['speculativeArea', 'priceCeiling']);
    expect(domain.models).toHaveLength(2);
    expect(domain.models[0].specialBreakdown).toEqual([
      { category: '다자녀', count: 20 },
      { category: '신혼부부', count: 30 },
      { category: '생애최초', count: 10 },
    ]);
    expect(domain.competitions[0].rateDisplay).toBe('15.0');
    expect(domain.winnerScores[0].averageDisplay).toBe('67.5');
    expect(domain.specialSupplyStatus).toHaveLength(2);
    expect(domain.specialSupplyStatus[0]).toMatchObject({
      houseType: '084.9345A',
      categoryName: '신혼부부',
      totalCount: 40,
    });
    // 타임라인이 비어있지 않고 phase 개수가 예상대로인지
    expect(domain.schedule.length).toBeGreaterThanOrEqual(6);
  });
});
