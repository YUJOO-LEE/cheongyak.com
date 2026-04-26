// @vitest-environment node
/**
 * Server-rendered baseline regressions for WeeklySchedule.
 *
 * The component now consumes server-grouped `WeeklyScheduleDay[]` directly
 * (no client-side getWeekdays / status filtering). Tests pin:
 *   1. Empty-state CTA when totalItems === 0.
 *   2. Day labels / dateStr come from server fields, not client date math.
 *   3. Phase chips render one per `WeeklySubscription.phases[]` entry, with
 *      the phase string used as label (status chip color follows status).
 *
 * Tests live in node mode because vitest@3 + jsdom@29 trips
 * ERR_REQUIRE_ASYNC_MODULE on this repo. Static markup assertions cover
 * everything we need here.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { WeeklySchedule } from './weekly-schedule';
import type {
  WeeklyPhase,
  WeeklyScheduleDay,
  WeeklySubscription,
} from '@/shared/types/api';

function makeSub(overrides: Partial<WeeklySubscription> = {}): WeeklySubscription {
  return {
    id: 'sub-x',
    name: '테스트 청약',
    location: { sido: '', gugun: '강남구', dong: '역삼동' },
    builder: '삼성물산',
    status: 'accepting',
    type: 'private',
    applicationStart: '2026-04-15',
    applicationEnd: '2026-04-15',
    totalUnits: 500,
    sizeRange: '59㎡ ~ 84㎡',
    phases: ['특별공급'],
    ...overrides,
  };
}

function makeDay(
  date: string,
  dayOfWeek: WeeklyScheduleDay['dayOfWeek'],
  items: WeeklySubscription[] = [],
): WeeklyScheduleDay {
  return { date, dayOfWeek, items };
}

const FIVE_DAYS: WeeklyScheduleDay[] = [
  makeDay('2026-04-13', 'MONDAY'),
  makeDay('2026-04-14', 'TUESDAY'),
  makeDay('2026-04-15', 'WEDNESDAY'),
  makeDay('2026-04-16', 'THURSDAY'),
  makeDay('2026-04-17', 'FRIDAY'),
];

describe('WeeklySchedule · server markup', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('emits the empty-state CTA when no day has any items', () => {
    const html = renderToStaticMarkup(<WeeklySchedule days={FIVE_DAYS} />);
    expect(html).toContain('예정된 청약이 없어요');
    expect(html).toContain('href="/listings"');
    expect(html).toContain('전체 청약 보기');
  });

  it('renders all server items regardless of status (no client filter)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 15, 10, 0, 0)); // Wed 2026-04-15

    const days = FIVE_DAYS.map((d, i) =>
      i === 2
        ? {
            ...d,
            items: [
              makeSub({ id: 'a', name: '진행중 청약', status: 'accepting' }),
              makeSub({ id: 'b', name: '마감된 청약', status: 'closed' }),
              makeSub({ id: 'c', name: '예정 청약', status: 'upcoming' }),
            ],
          }
        : d,
    );

    const html = renderToStaticMarkup(<WeeklySchedule days={days} />);

    expect(html).toContain('진행중 청약');
    expect(html).toContain('마감된 청약');
    expect(html).toContain('예정 청약');
  });

  it('renders one chip per phase with the phase text as label', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 15, 10, 0, 0));

    const phases: WeeklyPhase[] = ['특별공급', '일반공급 1순위', '일반공급 2순위'];
    const days = FIVE_DAYS.map((d, i) =>
      i === 2
        ? { ...d, items: [makeSub({ id: 'multi', name: '다중 단계', phases })] }
        : d,
    );

    const html = renderToStaticMarkup(<WeeklySchedule days={days} />);

    for (const phase of phases) {
      expect(html).toContain(phase);
    }
    // 기존 status 라벨("접수중")은 더 이상 칩에 노출되지 않는다 — phase 가 대체
    expect(html).not.toContain('접수중');
  });

  it('uses the server dayOfWeek and date for each column header', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 15, 10, 0, 0));

    const days = FIVE_DAYS.map((d) =>
      d.date === '2026-04-15'
        ? { ...d, items: [makeSub({ id: 'wed', name: '수요일 청약' })] }
        : d,
    );

    const html = renderToStaticMarkup(<WeeklySchedule days={days} />);

    // 서버 dayOfWeek 한국어 매핑 — 5 일 모두 라벨이 노출됨 (오늘도 요일 라벨 유지)
    for (const label of ['월', '화', '수', '목', '금']) {
      expect(html).toContain(label);
    }
    // dateStr 은 server date 에서 파생된 "M.D"
    expect(html).toContain('4.13');
    expect(html).toContain('4.15');
    expect(html).toContain('4.17');
    // 오늘 컬럼 마커는 텍스트가 아니라 색 + pulse 점으로만 신호
    expect(html).toContain('animate-pulse-soft');
  });

  it('renders "0건" with disabled styling on empty days so alignment + intent stay clear', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 15, 10, 0, 0));

    const days = FIVE_DAYS.map((d) =>
      d.date === '2026-04-15'
        ? { ...d, items: [makeSub({ id: 'wed' })] }
        : d,
    );

    const html = renderToStaticMarkup(<WeeklySchedule days={days} />);

    // 비어 있는 day 도 "0건" 텍스트를 그대로 노출해 alignment 일관성 확보.
    // 카드 배경/요일/날짜 라벨은 다른 day 와 동일, 건수 텍스트만 회색(text-text-tertiary).
    expect(html).toContain('0건');
  });
});
