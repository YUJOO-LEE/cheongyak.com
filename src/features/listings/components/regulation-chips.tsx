import { AlertTriangle } from 'lucide-react';

import { REGULATION_LABELS } from '@/features/listings/lib/map-apt-sales-detail';
import type { RegulationFlag } from '@/shared/types/api';

interface RegulationChipsProps {
  regulations: RegulationFlag[];
}

// TODO: [DESIGN_TOKEN_NEEDED] DESIGN.md §11 에 RegulationChip 사양이 없음.
// 현재 구현은 Jobs/Chanel 합의로 warning 패밀리(법적 주의 환기) + AlertTriangle
// 아이콘으로 §11.3 "color + icon/text" 페어 룰을 충족시킨 정공. 시스템 spec
// 추가는 별도 PR 예정.

/**
 * 활성 규제 플래그를 warning 톤 칩으로 나열합니다. 규제 정보는 청약 자격·
 * 전매 제한 판단에 직접 영향을 주는 법적 메타라, color + icon 페어로 시각
 * 단서를 강화합니다(이전의 의미 없는 좌측 dot 은 제거).
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
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-warning-100 text-label-md text-warning-700"
        >
          <AlertTriangle size={14} aria-hidden="true" className="shrink-0" />
          {REGULATION_LABELS[flag]}
        </li>
      ))}
    </ul>
  );
}
