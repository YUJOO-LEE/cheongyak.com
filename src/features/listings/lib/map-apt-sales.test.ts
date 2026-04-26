import { describe, expect, it } from 'vitest';
import {
  REGION_GROUPS,
  REGION_LABEL_MAP,
  mapApiDetailTypeToDomain,
  mapApiStatusToDomain,
  mapItemToSubscription,
} from './map-apt-sales';
import type { Item } from '@/shared/api/generated/schemas/item';
import { ItemRegionCode } from '@/shared/api/generated/schemas/itemRegionCode';

describe('mapApiStatusToDomain', () => {
  it('maps the five backend status codes to domain enum', () => {
    expect(mapApiStatusToDomain('SUBSCRIPTION_SCHEDULED')).toBe('upcoming');
    expect(mapApiStatusToDomain('SUBSCRIPTION_ACTIVE')).toBe('accepting');
    expect(mapApiStatusToDomain('RESULT_PENDING')).toBe('pending');
    expect(mapApiStatusToDomain('RESULT_TODAY')).toBe('result_today');
    expect(mapApiStatusToDomain('SUBSCRIPTION_COMPLETED')).toBe('closed');
  });
});

describe('mapApiDetailTypeToDomain', () => {
  it('maps PRIVATE → private, NATIONAL → public', () => {
    expect(mapApiDetailTypeToDomain('PRIVATE')).toBe('private');
    expect(mapApiDetailTypeToDomain('NATIONAL')).toBe('public');
  });
});

describe('REGION_GROUPS', () => {
  it('covers every ItemRegionCode exactly once', () => {
    const flat = REGION_GROUPS.flatMap((g) => g.codes);
    const expected = Object.values(ItemRegionCode).filter(
      (v): v is NonNullable<typeof v> => v !== null,
    );
    expect(new Set(flat)).toEqual(new Set(expected));
    expect(flat).toHaveLength(expected.length);
  });

  it('has a Korean label for every code in the map', () => {
    for (const group of REGION_GROUPS) {
      for (const code of group.codes) {
        expect(REGION_LABEL_MAP[code]).toBeTruthy();
      }
    }
  });

  it('preserves the filter-ui-spec group order', () => {
    expect(REGION_GROUPS.map((g) => g.label)).toEqual(['수도권', '광역시', '도']);
  });
});

describe('mapItemToSubscription', () => {
  const baseItem: Item = {
    id: 42,
    houseName: '테스트 단지',
    status: 'SUBSCRIPTION_ACTIVE',
    houseDetailType: 'PRIVATE',
    regionCode: 'SEOUL',
    regionName: '서울특별시',
    supplyAddress: '서울특별시 강남구 테스트동 1',
    sigunguName: '강남구',
    dongName: '테스트동',
    constructorName: '테스트건설',
    subscriptionStartDate: '2026-04-01',
    subscriptionEndDate: '2026-04-05',
    totalSupplyHousehold: 500,
    minSupplyArea: 59,
    maxSupplyArea: 84,
  };

  it('produces a valid Subscription shape', () => {
    const sub = mapItemToSubscription(baseItem);
    expect(sub).toMatchObject({
      id: '42',
      name: '테스트 단지',
      location: { sido: '서울특별시', gugun: '강남구', dong: '테스트동' },
      builder: '테스트건설',
      status: 'accepting',
      type: 'private',
      applicationStart: '2026-04-01',
      applicationEnd: '2026-04-05',
      totalUnits: 500,
      sizeRange: '59㎡ ~ 84㎡',
    });
  });

  it('collapses equal min/max supply areas to a single value', () => {
    const sub = mapItemToSubscription({
      ...baseItem,
      minSupplyArea: 59,
      maxSupplyArea: 59,
    });
    expect(sub.sizeRange).toBe('59㎡');
  });

  it('falls back to empty strings for nullable optional fields', () => {
    const sub = mapItemToSubscription({
      ...baseItem,
      sigunguName: null,
      dongName: null,
      constructorName: null,
    });
    expect(sub.location.gugun).toBe('');
    expect(sub.location.dong).toBeUndefined();
    expect(sub.builder).toBe('');
  });
});
