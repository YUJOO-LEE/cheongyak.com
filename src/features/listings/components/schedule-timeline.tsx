import { formatDate } from '@/shared/lib/format';
import type { SchedulePhase } from '@/shared/types/api';

interface ScheduleTimelineProps {
  phases: SchedulePhase[];
}

const stateStyles = {
  past: {
    dot: 'bg-bg-active',
    // Match the past dot tone so the completed portion reads as one continuous
    // "already passed" stroke instead of a darker dot sitting on a lighter line.
    line: 'bg-bg-active',
    text: 'text-text-tertiary',
    label: 'text-text-tertiary',
  },
  current: {
    dot: 'bg-brand-primary-500 ring-4 ring-brand-primary-100',
    line: 'bg-brand-primary-200',
    text: 'text-brand-primary-700 font-semibold',
    label: 'text-brand-primary-500',
  },
  future: {
    dot: 'border-2 border-border-divider bg-bg-card',
    line: 'bg-border-divider',
    text: 'text-text-secondary',
    label: 'text-text-tertiary',
  },
  // Applied to the phase immediately after a today-marker gap so the user has
  // a clear "next thing to wait for" even when no phase is live right now.
  nextUp: {
    dot: 'border-2 border-brand-primary-300 bg-bg-card',
    line: 'bg-border-divider',
    text: 'text-text-primary font-medium',
    label: 'text-text-secondary',
  },
};

// When today falls between phases (no `current`), surface the gap between the
// last past and the first future phase — returns -1 when a `current` already
// covers the moment or no past→future boundary exists.
export function findTodayMarkerIndex(phases: SchedulePhase[]): number {
  if (phases.some((p) => p.state === 'current')) return -1;
  for (let i = 0; i < phases.length - 1; i++) {
    if (phases[i].state === 'past' && phases[i + 1].state === 'future') {
      return i;
    }
  }
  return -1;
}

export function ScheduleTimeline({ phases }: ScheduleTimelineProps) {
  const todayMarkerIndex = findTodayMarkerIndex(phases);
  const nextUpIndex = todayMarkerIndex >= 0 ? todayMarkerIndex + 1 : -1;

  return (
    <div className="relative pl-6">
      {phases.map((phase, i) => {
        const style = i === nextUpIndex ? stateStyles.nextUp : stateStyles[phase.state];
        const isLast = i === phases.length - 1;
        const showTodayMarker = i === todayMarkerIndex;

        return (
          <div
            key={phase.phase}
            className={['relative flex items-start gap-4 animate-fade-in-up', !isLast ? 'pb-8' : ''].join(' ')}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Per-item base connector — only renders between items so the
                last dot terminates cleanly with no overflow line. */}
            {!isLast && (
              <div className="absolute -left-[19px] top-3 -bottom-2.5 w-0.5 bg-border-divider" />
            )}

            {/* Dot — optical-center aligned with first line of the label. */}
            <div
              className={[
                'absolute -left-6 top-1 w-3 h-3 rounded-full z-10',
                style.dot,
              ].join(' ')}
            />

            {/* Colored segment overlay on the connector for past/current.
                Suppressed when a today marker lives on this item — the today
                overlay paints past-tone up to the dot, and the base divider
                handles the future-tone portion below. */}
            {!isLast && phase.state !== 'future' && !showTodayMarker && (
              <div
                className={[
                  'absolute -left-[19px] top-3 -bottom-2.5 w-0.5',
                  style.line,
                ].join(' ')}
              />
            )}

            {/* Today marker — solid brand-primary dot anchored to the exact
                midpoint between this past phase's dot and the next phase's
                dot. Both dots sit at `top-1` (center y=10 from their items'
                tops), so the visual midpoint is always `50% + 10px` from this
                item's top, regardless of label height. No pulse, no outline:
                the colour shift against the past-tone line is the signal. */}
            {showTodayMarker && (
              <>
                {/* Past → today portion meets the dot's top edge exactly.
                    Gradient eases from the previous (past) dot's tone into
                    the today dot's tone so the eye reads the transition as
                    continuous travel rather than a hard color step. */}
                <div
                  className="absolute -left-[19px] top-3 w-0.5 bg-linear-to-b from-bg-active from-40% to-brand-primary-300 bottom-[calc(50%-6px)]"
                  aria-hidden="true"
                />
                <div
                  data-testid="schedule-today-marker"
                  className="absolute -left-[22px] top-[calc(50%+6px)] w-2 h-2 rounded-full bg-brand-primary-500 z-10"
                  aria-hidden="true"
                />
                <span className="sr-only">현재 날짜</span>
              </>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
              <div>
                <p className={['text-body-md leading-tight', style.text].join(' ')}>
                  {phase.label}
                </p>
                <p className={['text-body-sm mt-1', style.label].join(' ')}>
                  {formatDate(phase.startDate)}
                  {phase.endDate && ` ~ ${formatDate(phase.endDate)}`}
                </p>
              </div>

              {phase.state === 'current' && (
                <span className="shrink-0 text-caption text-brand-primary-500 bg-brand-primary-50 px-2 py-0.5 rounded-full animate-pulse-soft">
                  진행중
                </span>
              )}

              {i === nextUpIndex && (
                <span className="shrink-0 text-caption text-brand-primary-500 bg-brand-primary-50 px-2 py-0.5 rounded-full">
                  다음 예정
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
