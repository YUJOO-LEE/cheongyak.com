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
  },
  current: {
    dot: 'bg-brand-primary-500 ring-4 ring-brand-primary-100',
    line: 'bg-brand-primary-200',
    text: 'text-brand-primary-700 font-semibold',
  },
  future: {
    dot: 'bg-neutral-200',
    line: 'bg-neutral-200',
    text: 'text-text-secondary',
  },
};

export function ScheduleTimeline({ phases }: ScheduleTimelineProps) {
  return (
    <div className="relative">
      {phases.map((phase, i) => {
        const style = stateStyles[phase.state];
        const isLast = i === phases.length - 1;

        return (
          <div key={phase.phase} className="flex gap-4 pb-6 last:pb-0">
            {/* Timeline track */}
            <div className="flex flex-col items-center">
              <div className={['w-3 h-3 rounded-full shrink-0 mt-1.5', style.dot].join(' ')} />
              {!isLast && (
                <div className={['w-0.5 flex-1 min-h-6 mt-1', style.line].join(' ')} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={['text-body-md', style.text].join(' ')}>
                {phase.label}
              </p>
              <p className="text-body-sm text-text-tertiary mt-0.5">
                {formatDate(phase.startDate)}
                {phase.endDate && ` ~ ${formatDate(phase.endDate)}`}
              </p>
            </div>

            {/* Current indicator */}
            {phase.state === 'current' && (
              <span className="text-caption text-brand-primary-500 bg-brand-primary-50 px-2 py-0.5 rounded-full self-start mt-1">
                진행중
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
