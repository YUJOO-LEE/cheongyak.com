import type { WeeklyPhase } from '@/shared/types/api';

type ChipSize = 'sm' | 'md';

interface PhaseChipProps {
  phase: WeeklyPhase;
  size?: ChipSize;
  className?: string;
}

interface PhaseConfig {
  bg: string;
  text: string;
}

// Phase 별 시각 정체성. status chip(announcement 단위 today-relative)과 의미가
// 달라 별도 컴포넌트로 분리. 1·2순위는 같은 brand-primary hue 안에서 명도 단계로
// 위계를 표현하고, 특별공급은 info(StatusChip upcoming 과 같은 hue 의 한 단계
// 옅은 명도), 당첨자 발표는 warning(StatusChip result_today 와 같은 토큰 페어 —
// "발표일" 의미가 두 칩에서 동일하므로 시각도 동일하게 유지).
const phaseConfigs: Record<WeeklyPhase, PhaseConfig> = {
  특별공급: {
    bg: 'bg-info-50',
    text: 'text-info-700',
  },
  '일반공급 1순위': {
    bg: 'bg-brand-primary-100',
    text: 'text-brand-primary-800',
  },
  '일반공급 2순위': {
    bg: 'bg-brand-primary-50',
    text: 'text-brand-primary-700',
  },
  '당첨자 발표': {
    bg: 'bg-warning-50',
    text: 'text-warning-700',
  },
};

// text-caption(weight 400) 만으로는 sm 칩이 너무 얇아 font-semibold 로 보강.
// StatusChip / TypeChip 과 동일한 보정. TODO: [DESIGN_TOKEN_NEEDED] text-label-sm.
const sizeStyles: Record<ChipSize, string> = {
  sm: 'px-1.5 py-0.5 text-caption font-semibold',
  md: 'px-2 py-1 text-label-md',
};

export function PhaseChip({
  phase,
  size = 'sm',
  className = '',
}: PhaseChipProps) {
  const config = phaseConfigs[phase];

  return (
    <span
      className={[
        'inline-flex items-center rounded-full',
        sizeStyles[size],
        config.bg,
        config.text,
        className,
      ].join(' ')}
    >
      {phase}
    </span>
  );
}

export type { PhaseChipProps };
