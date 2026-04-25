import { Fragment } from 'react';
import { formatHouseType } from '@/features/listings/lib/map-apt-sales-detail';
import type { WinnerScoreRow } from '@/shared/types/api';

interface WinnerScoreTableProps {
  rows: WinnerScoreRow[];
}

const TOTAL_COLS = 5;

/**
 * 당첨가점 표 — 평형 × 거주지역 row. 가점제 미적용 단지는 API 가 빈
 * 배열을 내려주므로 이 컴포넌트 자체를 마운트하지 않는 편이 맞습니다.
 *
 * 데스크톱(`sm:` 이상): 첫 컬럼에 주택형 셀을 rowSpan 으로 펼치고 가로 폭이
 * 부족하면 가로 스크롤로 흘립니다. 모바일(`< sm`): 가로 스크롤 대신 주택형을
 * 그룹 머리행으로 빼서 본문 컬럼이 좁은 화면을 더 넓게 사용하도록 합니다.
 */
export function WinnerScoreTable({ rows }: WinnerScoreTableProps) {
  if (rows.length === 0) {
    return (
      <p className="text-body-md text-text-tertiary">
        가점제 적용 평형이 없거나 아직 집계 전입니다.
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
            <Th align="left">거주지역</Th>
            <Th align="right">최저</Th>
            <Th align="right">평균</Th>
            <Th align="right">최고</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const groupStart = i === 0 || rows[i - 1].houseType !== row.houseType;
            const rowSpan = groupStart ? groupSizes[row.houseType] : 0;
            const rowBg = i % 2 === 0 ? 'bg-bg-card' : 'bg-bg-sunken/40';
            return (
              <Fragment
                key={`${row.houseType}-${row.residence ?? 'nores'}-${i}`}
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
                  <Td align="left">{row.residence ?? '-'}</Td>
                  <Td align="right">{row.lowestDisplay}</Td>
                  <Td align="right">{row.averageDisplay}</Td>
                  <Td align="right">{row.highestDisplay}</Td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function computeGroupSizes(rows: WinnerScoreRow[]): Record<string, number> {
  const sizes: Record<string, number> = {};
  for (const row of rows) {
    sizes[row.houseType] = (sizes[row.houseType] ?? 0) + 1;
  }
  return sizes;
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
