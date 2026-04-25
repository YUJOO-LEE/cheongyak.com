import { Fragment } from 'react';
import { formatHouseType } from '@/features/listings/lib/map-apt-sales-detail';
import type { CompetitionRow } from '@/shared/types/api';

interface CompetitionTableProps {
  rows: CompetitionRow[];
}

const TOTAL_COLS = 6;

/**
 * 경쟁률 표 — 평형 × 순위 × 거주지역 row. 서버가 집계 전이면 빈 배열을
 * 내려주므로 이 컴포넌트를 아예 마운트하지 않는 편이 맞고, 마운트된
 * 시점에 rows 가 비면 "집계 전" 안내를 보여 재요청을 유도합니다.
 *
 * 데스크톱(`sm:` 이상): 첫 컬럼에 주택형 셀을 rowSpan 으로 펼치고 가로 폭이
 * 부족하면 가로 스크롤로 흘립니다. 모바일(`< sm`): 가로 스크롤 대신 주택형을
 * 그룹 머리행으로 빼서 본문 컬럼이 좁은 화면을 더 넓게 사용하도록 합니다.
 * 셀 패딩도 모바일에서는 한 단계 좁혀 가독성을 유지합니다.
 */
export function CompetitionTable({ rows }: CompetitionTableProps) {
  if (rows.length === 0) {
    return (
      <p className="text-body-md text-text-tertiary">
        접수 집계 전이라 경쟁률이 아직 공개되지 않았습니다.
      </p>
    );
  }

  const groupSizes = computeGroupSizes(rows);

  return (
    <div className="rounded-md overflow-hidden bg-bg-card sm:overflow-x-auto">
      <table className="w-full sm:min-w-150 border-collapse">
        <thead>
          <tr className="bg-bg-sunken">
            <Th align="left" className="hidden sm:table-cell">
              주택형
            </Th>
            <Th align="left">순위</Th>
            <Th align="left">거주지역</Th>
            <Th align="right">공급</Th>
            <Th align="right">접수</Th>
            <Th align="right">경쟁률</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const groupStart = i === 0 || rows[i - 1].houseType !== row.houseType;
            const rowSpan = groupStart ? groupSizes[row.houseType] : 0;
            const rowBg = i % 2 === 0 ? 'bg-bg-card' : 'bg-bg-sunken/40';
            return (
              <Fragment
                key={`${row.houseType}-${row.rank ?? 'nr'}-${row.residence ?? 'nores'}-${i}`}
              >
                {groupStart && (
                  <tr className="sm:hidden">
                    <th
                      colSpan={TOTAL_COLS}
                      className={[
                        'bg-bg-sunken text-label-lg font-semibold text-text-primary text-left px-3 py-2',
                        i !== 0 ? 'border-t border-border-divider' : '',
                      ].join(' ')}
                    >
                      {formatHouseType(row.houseType)}
                    </th>
                  </tr>
                )}
                <tr
                  className={[
                    rowBg,
                    groupStart && i !== 0 ? 'sm:[&>td]:border-t sm:[&>td]:border-border-divider' : '',
                  ].join(' ')}
                >
                  {groupStart && (
                    <Td
                      align="left"
                      className={['font-medium align-top hidden sm:table-cell', rowBg].join(' ')}
                      rowSpan={rowSpan}
                    >
                      {formatHouseType(row.houseType)}
                    </Td>
                  )}
                  <Td align="left">
                    {row.rank != null ? `${row.rank}순위` : '-'}
                  </Td>
                  <Td align="left">{row.residence ?? '-'}</Td>
                  <Td align="right">
                    {row.supplyCount?.toLocaleString() ?? '-'}
                  </Td>
                  <Td align="right">
                    {row.requestCount?.toLocaleString() ?? '-'}
                  </Td>
                  <Td align="right" className={row.isShortage ? 'text-warning-600' : ''}>
                    {row.isShortage ? renderShortage(row) : (row.rateDisplay ?? '-')}
                  </Td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function computeGroupSizes(rows: CompetitionRow[]): Record<string, number> {
  const sizes: Record<string, number> = {};
  for (const row of rows) {
    sizes[row.houseType] = (sizes[row.houseType] ?? 0) + 1;
  }
  return sizes;
}

// 미달은 "공급 - 접수" 차이를 ▼ 아이콘과 함께 보여줍니다. supply/request 가
// 둘 다 들어와야 산식이 성립하므로 누락 시 백엔드의 rateDisplay 문구를 그대로
// 노출해 안전하게 폴백합니다. aria-label 로 "N세대 부족" 전체 문구를 제공해
// 스크린리더 사용자도 의미가 동일하게 전달되도록 보장합니다.
function renderShortage(row: CompetitionRow): React.ReactNode {
  const count =
    row.supplyCount != null && row.requestCount != null
      ? row.supplyCount - row.requestCount
      : null;
  if (count == null) return row.rateDisplay ?? '-';
  return (
    <span
      aria-label={`${count.toLocaleString()}세대 부족`}
      className="inline-flex items-center gap-0.5"
    >
      <span aria-hidden="true">△</span>
      {count.toLocaleString()}
    </span>
  );
}

const alignClass = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

function Th({
  align,
  children,
  className = '',
}: {
  align: 'left' | 'center' | 'right';
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={[
        'text-label-md text-text-secondary whitespace-nowrap px-2 py-2 sm:px-4 sm:py-3',
        alignClass[align],
        className,
      ].join(' ')}
    >
      {children}
    </th>
  );
}

function Td({
  align,
  className = '',
  children,
  rowSpan,
}: {
  align: 'left' | 'center' | 'right';
  className?: string;
  children: React.ReactNode;
  rowSpan?: number;
}) {
  return (
    <td
      rowSpan={rowSpan}
      className={[
        'text-body-sm text-text-primary whitespace-nowrap px-2 py-2 sm:px-4 sm:py-3',
        alignClass[align],
        className,
      ].join(' ')}
    >
      {children}
    </td>
  );
}
