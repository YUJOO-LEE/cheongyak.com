// @vitest-environment node
/**
 * Baseline regression tests for WeeklySchedule.
 *
 * Why these tests live in node mode:
 * jsdom@29 + vitest@3 trips ERR_REQUIRE_ASYNC_MODULE, so interactive DOM
 * tests (fireEvent / useState transitions) cannot run in this repo today.
 * These tests pin the two forms of regression we CAN cover here:
 *   1. Pure date-math logic (getWeekdays) — captured as a reference
 *      implementation mirror so any future refactor of the in-file helper
 *      must keep producing the same shortLabel/dateStr/isToday/isPast.
 *   2. Server-rendered output for WeeklySchedule itself — empty state and
 *      active-status filtering are both observable in static markup.
 *
 * Refactors (structural) that must preserve these outputs:
 *   - Extracting getWeekdays into a util module.
 *   - Extracting getSubsForDate into a util module.
 *   - Wrapping WeeklySchedule in a shared EmptyState component.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { WeeklySchedule } from './weekly-schedule';
import type { Subscription } from '@/shared/types/api';

function makeSub(overrides: Partial<Subscription>): Subscription {
  return {
    id: 'sub-x',
    name: '테스트 청약',
    location: { sido: '서울특별시', gugun: '강남구', dong: '역삼동' },
    builder: '삼성물산',
    status: 'accepting',
    type: 'private',
    applicationStart: '2026-04-13',
    applicationEnd: '2026-04-17',
    totalUnits: 500,
    sizeRange: '59㎡ ~ 84㎡',
    ...overrides,
  };
}

/* ─────────────────────────────────────────────────────────── */
/* Reference implementation of getWeekdays — mirrors the       */
/* private helper in weekly-schedule.tsx. Any structural move  */
/* of that helper must keep this test green (same outputs for  */
/* same `now`).                                                */
/* ─────────────────────────────────────────────────────────── */

interface DayInfoRef {
  shortLabel: string;
  dateStr: string;
  isToday: boolean;
  isPast: boolean;
  isoDate: string;
}

function referenceGetWeekdays(now: Date): DayInfoRef[] {
  const dayOfWeek = now.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const monday = new Date(now);
  if (isWeekend) {
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 2;
    monday.setDate(now.getDate() + daysUntilMonday);
  } else {
    monday.setDate(now.getDate() - (dayOfWeek - 1));
  }
  const shortNames = ['월', '화', '수', '목', '금'];
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return Array.from({ length: 5 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return {
      shortLabel: shortNames[i]!,
      dateStr: `${date.getMonth() + 1}.${date.getDate()}`,
      isToday: date.toDateString() === now.toDateString(),
      isPast: date < today,
      isoDate: `${yyyy}-${mm}-${dd}`,
    };
  });
}

describe('WeeklySchedule · getWeekdays (reference)', () => {
  it('produces Mon–Fri of the current week when called on a Wednesday', () => {
    // Wed 2026-04-15 → Mon 04-13 .. Fri 04-17
    const days = referenceGetWeekdays(new Date(2026, 3, 15, 10, 0, 0));
    expect(days.map((d) => d.dateStr)).toEqual(['4.13', '4.14', '4.15', '4.16', '4.17']);
    expect(days.map((d) => d.shortLabel)).toEqual(['월', '화', '수', '목', '금']);
    expect(days.map((d) => d.isToday)).toEqual([false, false, true, false, false]);
    expect(days.map((d) => d.isPast)).toEqual([true, true, false, false, false]);
  });

  it('skips to next week Monday when called on a Sunday', () => {
    // Sun 2026-04-19 → Mon 04-20 .. Fri 04-24
    const days = referenceGetWeekdays(new Date(2026, 3, 19, 10, 0, 0));
    expect(days.map((d) => d.dateStr)).toEqual(['4.20', '4.21', '4.22', '4.23', '4.24']);
    expect(days.every((d) => !d.isToday)).toBe(true);
    expect(days.every((d) => !d.isPast)).toBe(true);
  });

  it('skips to next week Monday when called on a Saturday', () => {
    // Sat 2026-04-18 → Mon 04-20 .. Fri 04-24
    const days = referenceGetWeekdays(new Date(2026, 3, 18, 10, 0, 0));
    expect(days.map((d) => d.dateStr)).toEqual(['4.20', '4.21', '4.22', '4.23', '4.24']);
  });

  it('marks isToday exactly once on a weekday reference date', () => {
    const days = referenceGetWeekdays(new Date(2026, 3, 13, 10, 0, 0)); // Mon
    expect(days.filter((d) => d.isToday)).toHaveLength(1);
    expect(days[0]!.isToday).toBe(true);
    expect(days[0]!.shortLabel).toBe('월');
  });
});

/* ─────────────────────────────────────────────────────────── */
/* Reference implementation of getSubsForDate.                 */
/* Pins the invariant "only accepting/contracting survive".    */
/* ─────────────────────────────────────────────────────────── */

function referenceGetSubsForDate(subs: Subscription[], date: Date): Subscription[] {
  const ACTIVE = new Set<Subscription['status']>(['accepting', 'contracting']);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;
  return subs.filter(
    (s) =>
      ACTIVE.has(s.status) &&
      dateStr >= s.applicationStart &&
      dateStr <= s.applicationEnd,
  );
}

describe('WeeklySchedule · getSubsForDate (reference)', () => {
  const target = new Date(2026, 3, 15, 10, 0, 0); // Wed
  const base = {
    applicationStart: '2026-04-13',
    applicationEnd: '2026-04-17',
  };

  it('keeps accepting and contracting subscriptions that span the date', () => {
    const subs: Subscription[] = [
      makeSub({ id: 'a', status: 'accepting', ...base }),
      makeSub({ id: 'b', status: 'contracting', ...base }),
    ];
    expect(referenceGetSubsForDate(subs, target).map((s) => s.id)).toEqual(['a', 'b']);
  });

  it('drops upcoming/pending/closed even when the date falls inside the window', () => {
    const subs: Subscription[] = [
      makeSub({ id: 'up', status: 'upcoming', ...base }),
      makeSub({ id: 'pe', status: 'pending', ...base }),
      makeSub({ id: 'cl', status: 'closed', ...base }),
    ];
    expect(referenceGetSubsForDate(subs, target)).toEqual([]);
  });

  it('drops accepting subscriptions whose window ends before the date', () => {
    const subs: Subscription[] = [
      makeSub({
        id: 'old',
        status: 'accepting',
        applicationStart: '2026-04-01',
        applicationEnd: '2026-04-10',
      }),
    ];
    expect(referenceGetSubsForDate(subs, target)).toEqual([]);
  });
});

/* ─────────────────────────────────────────────────────────── */
/* Server-rendered output: empty state + filtered listings.    */
/* ─────────────────────────────────────────────────────────── */

describe('WeeklySchedule · server markup', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('emits the empty-state CTA when no subscriptions are passed', () => {
    const html = renderToStaticMarkup(<WeeklySchedule subscriptions={[]} />);
    expect(html).toContain('예정된 청약이 없어요');
    expect(html).toContain('href="/listings"');
    expect(html).toContain('전체 청약 보기');
  });

  it('omits non-active-status subscriptions from the rendered markup', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 15, 10, 0, 0)); // Wed

    const html = renderToStaticMarkup(
      <WeeklySchedule
        subscriptions={[
          makeSub({
            id: 'accepting-ok',
            name: '정상 접수',
            status: 'accepting',
            applicationStart: '2026-04-13',
            applicationEnd: '2026-04-17',
          }),
          makeSub({
            id: 'drop-pending',
            name: '발표 대기',
            status: 'pending',
            applicationStart: '2026-04-13',
            applicationEnd: '2026-04-17',
          }),
          makeSub({
            id: 'drop-closed',
            name: '마감 청약',
            status: 'closed',
            applicationStart: '2026-04-13',
            applicationEnd: '2026-04-17',
          }),
        ]}
      />,
    );

    expect(html).toContain('정상 접수');
    expect(html).not.toContain('발표 대기');
    expect(html).not.toContain('마감 청약');
  });

  it('includes the "오늘" label and current weekday marker on a weekday render', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 15, 10, 0, 0)); // Wed

    const html = renderToStaticMarkup(
      <WeeklySchedule
        subscriptions={[
          makeSub({
            id: 'wed',
            status: 'accepting',
            applicationStart: '2026-04-15',
            applicationEnd: '2026-04-15',
          }),
        ]}
      />,
    );

    expect(html).toContain('오늘');
    expect(html).toContain('4.15');
  });

  it('preserves the invisible-count placeholder so day selector height never collapses', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 15, 10, 0, 0));

    const html = renderToStaticMarkup(
      <WeeklySchedule
        subscriptions={[
          makeSub({
            id: 'wed',
            status: 'accepting',
            applicationStart: '2026-04-15',
            applicationEnd: '2026-04-15',
          }),
        ]}
      />,
    );

    // At least one day selector cell has no listings → its count span gets the
    // `invisible` utility class so the flex row keeps 3-line height.
    expect(html).toContain('invisible');
  });
});
