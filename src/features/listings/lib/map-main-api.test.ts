import { describe, it, expect } from 'vitest';
import { mapStatsToInsights } from './map-main-api';
import type { MainStatsResponse } from '@/shared/types/main-api';

const baseStats: MainStatsResponse = {
  avgCompetitionRate: 12.3,
  competitionRateChange: 1.6,
  totalSupplyHousehold: 8450,
  supplyHouseholdChange: 2100,
  popularRegion: {
    sigunguName: '서초구',
    avgCompetitionRate: 45,
  },
};

describe('mapStatsToInsights · 3rd insight prioritization', () => {
  it('prefers topCompetitionApt over popularRegion when present', () => {
    const insights = mapStatsToInsights({
      ...baseStats,
      topCompetitionApt: {
        announcementId: 1001,
        houseName: '래미안 원베일리',
        avgCompetitionRate: 152.4,
      },
    });
    const last = insights[2]!;
    expect(last.label).toBe('최대 경쟁률 단지');
    expect(last.value).toBe('래미안 원베일리');
    expect(last.trendValue).toBe('152.4:1');
    expect(last.href).toBe('/listings/1001');
  });

  it('falls back to popularRegion when topCompetitionApt is null', () => {
    const insights = mapStatsToInsights({
      ...baseStats,
      topCompetitionApt: null,
    });
    const last = insights[2]!;
    expect(last.label).toBe('인기 지역');
    expect(last.value).toBe('서초구');
    expect(last.trendValue).toBe('45.0:1');
    expect(last.href).toBeUndefined();
  });

  it('falls back to popularRegion when topCompetitionApt field is omitted', () => {
    const insights = mapStatsToInsights(baseStats);
    expect(insights[2]!.label).toBe('인기 지역');
    expect(insights[2]!.value).toBe('서초구');
  });

  it('renders 집계 중 placeholder when both highlights are null', () => {
    const insights = mapStatsToInsights({
      ...baseStats,
      popularRegion: null,
      topCompetitionApt: null,
    });
    const last = insights[2]!;
    expect(last.label).toBe('인기 지역');
    expect(last.value).toBe('집계 중');
    expect(last.href).toBeUndefined();
  });
});
