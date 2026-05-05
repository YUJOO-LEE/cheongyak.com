/**
 * Behavioural pin for PhaseChip.
 *
 * `WeeklyCard` previously rendered `<StatusChip status={sub.status} label={phase} />`,
 * which made the same phase shift color across days as the announcement-wide
 * `status` flipped relative to today. PhaseChip locks each phase to a fixed
 * (icon, bg, text) trio so that "당첨자 발표 on Mon" looks identical to
 * "당첨자 발표 on Fri" — and the next time someone reaches for `StatusChip`
 * to label a phase, the type system will route them here instead.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { PhaseChip } from './phase-chip';
import type { WeeklyPhase } from '@/shared/types/api';

describe('PhaseChip', () => {
  it.each<{
    phase: WeeklyPhase;
    bg: string;
    text: string;
  }>([
    {
      phase: '특별공급',
      bg: 'bg-info-50',
      text: 'text-info-700',
    },
    {
      phase: '일반공급 1순위',
      bg: 'bg-brand-primary-100',
      text: 'text-brand-primary-800',
    },
    {
      phase: '일반공급 2순위',
      bg: 'bg-brand-primary-50',
      text: 'text-brand-primary-700',
    },
    {
      phase: '당첨자 발표',
      bg: 'bg-warning-50',
      text: 'text-warning-700',
    },
  ])('renders $phase with the locked bg/text token pair', ({ phase, bg, text }) => {
    const { container } = render(<PhaseChip phase={phase} />);
    expect(screen.getByText(phase)).toBeTruthy();
    const chip = container.firstElementChild;
    expect(chip?.className).toContain(bg);
    expect(chip?.className).toContain(text);
  });

  it('uses the sm size token by default and md when requested', () => {
    const { container: smC } = render(<PhaseChip phase="특별공급" />);
    expect(smC.firstElementChild?.className).toContain('px-1.5 py-0.5');
    expect(smC.firstElementChild?.className).toContain('text-caption');

    const { container: mdC } = render(<PhaseChip phase="특별공급" size="md" />);
    expect(mdC.firstElementChild?.className).toContain('px-2 py-1');
    expect(mdC.firstElementChild?.className).toContain('text-label-md');
  });

  it('forwards className so callers can layer spacing utilities', () => {
    const { container } = render(
      <PhaseChip phase="당첨자 발표" className="ml-2" />,
    );
    expect(container.firstElementChild?.className).toContain('ml-2');
  });
});
