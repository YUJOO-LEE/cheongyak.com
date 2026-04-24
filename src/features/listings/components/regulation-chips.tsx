import { REGULATION_LABELS } from '@/features/listings/lib/map-apt-sales-detail';
import type { RegulationFlag } from '@/shared/types/api';

interface RegulationChipsProps {
  regulations: RegulationFlag[];
}

/**
 * 활성 규제 플래그를 neutral 칩으로 나열합니다. 규제 여부는 청약 자격·
 * 전매 제한 판단에 직접 영향을 주므로 가독성 높은 라벨을 우선합니다.
 */
export function RegulationChips({ regulations }: RegulationChipsProps) {
  if (regulations.length === 0) return null;
  return (
    <ul
      className="flex flex-wrap gap-2"
      aria-label="적용 중인 규제 정보"
    >
      {regulations.map((flag) => (
        <li
          key={flag}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-bg-sunken text-label-md text-text-secondary"
        >
          <span
            aria-hidden="true"
            className="w-1.5 h-1.5 rounded-full bg-warning-500"
          />
          {REGULATION_LABELS[flag]}
        </li>
      ))}
    </ul>
  );
}
