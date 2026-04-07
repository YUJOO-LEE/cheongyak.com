import { formatDate } from '@/shared/lib/format';
import type { SchedulePhase } from '@/shared/types/api';

interface ScheduleTimelineProps {
  phases: SchedulePhase[];
}

const stateStyles = {
  past: {
    dot: 'bg-neutral-300',
    line: 'bg-neutral-200',
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
    dot: 'border-2 border-neutral-300 bg-neutral-0',
    line: 'bg-neutral-200',
    text: 'text-text-secondary',
    label: 'text-text-tertiary',
  },
};

export function ScheduleTimeline({ phases }: ScheduleTimelineProps) {
  return (
    <div className="relative pl-6">
      {/* Continuous vertical line */}
      <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-neutral-200" />

      {phases.map((phase, i) => {
        const style = stateStyles[phase.state];
        const isLast = i === phases.length - 1;

        return (
          <div
            key={phase.phase}
            className={['relative flex items-start gap-4', !isLast ? 'pb-8' : ''].join(' ')}
          >
            {/* Dot — positioned over the continuous line */}
            <div
              className={[
                'absolute -left-6 top-0.5 w-3 h-3 rounded-full z-10',
                style.dot,
              ].join(' ')}
            />

            {/* Colored segment overlay on the line for past/current */}
            {!isLast && phase.state !== 'future' && (
              <div
                className={[
                  'absolute -left-[19px] top-3 w-0.5 h-full',
                  style.line,
                ].join(' ')}
              />
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
                <span className="shrink-0 text-caption text-brand-primary-500 bg-brand-primary-50 px-2 py-0.5 rounded-full">
                  진행중
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
