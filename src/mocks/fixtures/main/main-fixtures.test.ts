/**
 * Schema validation for the /main/* mock fixtures.
 *
 * Each fixture must round-trip through its corresponding zod schema —
 * that is the contract the handlers ({ data: fixture }) will rely on.
 * A drift here (typo, missing nullable, enum regression) would only
 * surface as a runtime Invalid /main/... response error thrown by
 * createEnvelopeParser, which is a silent failure mode in dev. Pin it.
 */
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  MainFeaturedResponseSchema,
  MainStatsResponseSchema,
  MainWeeklyScheduleResponseSchema,
  TopTradeResponseSchema,
  apiEnvelope,
} from '@/shared/types/main-api';
import {
  mainFeatured,
  mainStats,
  mainWeeklySchedule,
  mainTopTrades,
} from './index';

describe('/main/* fixtures · schema round-trip', () => {
  it('mainFeatured parses against MainFeaturedResponseSchema', () => {
    expect(() => MainFeaturedResponseSchema.parse(mainFeatured)).not.toThrow();
  });

  it('mainStats parses against MainStatsResponseSchema', () => {
    expect(() => MainStatsResponseSchema.parse(mainStats)).not.toThrow();
  });

  it('mainWeeklySchedule parses against MainWeeklyScheduleResponseSchema', () => {
    expect(() =>
      MainWeeklyScheduleResponseSchema.parse(mainWeeklySchedule),
    ).not.toThrow();
  });

  it('mainTopTrades array parses against z.array(TopTradeResponseSchema)', () => {
    expect(() =>
      z.array(TopTradeResponseSchema).parse(mainTopTrades),
    ).not.toThrow();
  });
});

describe('/main/* fixtures · envelope shape used by handlers', () => {
  it('{ data: mainFeatured } parses as apiEnvelope(Featured)', () => {
    expect(() =>
      apiEnvelope(MainFeaturedResponseSchema).parse({ data: mainFeatured }),
    ).not.toThrow();
  });

  it('{ data: mainStats } parses as apiEnvelope(Stats)', () => {
    expect(() =>
      apiEnvelope(MainStatsResponseSchema).parse({ data: mainStats }),
    ).not.toThrow();
  });

  it('{ data: mainWeeklySchedule } parses as apiEnvelope(WeeklySchedule)', () => {
    expect(() =>
      apiEnvelope(MainWeeklyScheduleResponseSchema).parse({
        data: mainWeeklySchedule,
      }),
    ).not.toThrow();
  });

  it('{ data: mainTopTrades } parses as apiEnvelope(TopTrade[])', () => {
    expect(() =>
      apiEnvelope(z.array(TopTradeResponseSchema)).parse({ data: mainTopTrades }),
    ).not.toThrow();
  });
});

describe('/main/weekly-schedule fixture · mapper-relevant invariants', () => {
  it('contains at least one announcement that appears on multiple days', () => {
    const byId = new Map<number, number>();
    for (const day of mainWeeklySchedule.days) {
      for (const a of day.announcements) {
        byId.set(a.id, (byId.get(a.id) ?? 0) + 1);
      }
    }
    const duplicated = [...byId.values()].filter((n) => n > 1);
    expect(duplicated.length).toBeGreaterThan(0);
  });

  it('emits day.count === day.announcements.length for every day', () => {
    for (const day of mainWeeklySchedule.days) {
      expect(day.count).toBe(day.announcements.length);
    }
  });
});
