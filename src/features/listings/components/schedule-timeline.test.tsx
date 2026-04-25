// @vitest-environment node
/**
 * Pins the "오늘 위치 마커" contract on the schedule timeline.
 *
 * Scenario the user hit: today is 2026-04-25, 당첨자 발표 was 4/22 (past) and
 * 계약기간 starts 5/4 (future). No phase reports `state: 'current'`, so the
 * previous design left everything dim and the user could not tell where they
 * were. This test file pins:
 *   1. `findTodayMarkerIndex` — pure picker that returns the last-past index
 *      whose neighbour is future, or -1 when a current phase already covers
 *      the moment / no gap exists.
 *   2. SSR output — the "오늘" pill renders exactly when (1) returns ≥ 0,
 *      and the phase immediately after the gap carries the "다음 예정" cue.
 */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ScheduleTimeline, findTodayMarkerIndex } from './schedule-timeline';
import type { SchedulePhase } from '@/shared/types/api';

function phase(overrides: Partial<SchedulePhase> & { phase: string; state: SchedulePhase['state'] }): SchedulePhase {
  return {
    label: overrides.phase,
    startDate: '2026-04-01',
    ...overrides,
  };
}

describe('findTodayMarkerIndex', () => {
  it('returns the last past-before-future index when no phase is current', () => {
    const phases: SchedulePhase[] = [
      phase({ phase: 'p1', state: 'past' }),
      phase({ phase: 'p2', state: 'past' }),
      phase({ phase: 'p3', state: 'future' }),
      phase({ phase: 'p4', state: 'future' }),
    ];
    expect(findTodayMarkerIndex(phases)).toBe(1);
  });

  it('returns -1 when any phase is current (current handles the marker)', () => {
    const phases: SchedulePhase[] = [
      phase({ phase: 'p1', state: 'past' }),
      phase({ phase: 'p2', state: 'current' }),
      phase({ phase: 'p3', state: 'future' }),
    ];
    expect(findTodayMarkerIndex(phases)).toBe(-1);
  });

  it('returns -1 when no past→future boundary exists', () => {
    const allPast: SchedulePhase[] = [
      phase({ phase: 'p1', state: 'past' }),
      phase({ phase: 'p2', state: 'past' }),
    ];
    const allFuture: SchedulePhase[] = [
      phase({ phase: 'p1', state: 'future' }),
      phase({ phase: 'p2', state: 'future' }),
    ];
    expect(findTodayMarkerIndex(allPast)).toBe(-1);
    expect(findTodayMarkerIndex(allFuture)).toBe(-1);
  });
});

describe('<ScheduleTimeline />', () => {
  it('renders the 오늘 marker dot and 다음 예정 cue when today falls between phases', () => {
    const phases: SchedulePhase[] = [
      phase({ phase: 'announcement', label: '당첨자 발표', state: 'past', startDate: '2026-04-22' }),
      phase({ phase: 'contract', label: '계약기간', state: 'future', startDate: '2026-05-04' }),
    ];
    const html = renderToStaticMarkup(<ScheduleTimeline phases={phases} />);
    expect(html).toContain('data-testid="schedule-today-marker"');
    // Screen-reader label is the only text surface for the marker — the dot is
    // purely visual (no "오늘" pill) so we pin the a11y hook instead.
    expect(html).toContain('현재 날짜');
    expect(html).toContain('다음 예정');
  });

  it('omits the 오늘 marker when a current phase already covers today', () => {
    const phases: SchedulePhase[] = [
      phase({ phase: 'apply', label: '청약 접수', state: 'past', startDate: '2026-04-10' }),
      phase({ phase: 'announcement', label: '당첨자 발표', state: 'current', startDate: '2026-04-22' }),
      phase({ phase: 'contract', label: '계약기간', state: 'future', startDate: '2026-05-04' }),
    ];
    const html = renderToStaticMarkup(<ScheduleTimeline phases={phases} />);
    expect(html).not.toContain('schedule-today-marker');
    expect(html).not.toContain('현재 날짜');
    expect(html).not.toContain('다음 예정');
    expect(html).toContain('진행중');
  });
});
