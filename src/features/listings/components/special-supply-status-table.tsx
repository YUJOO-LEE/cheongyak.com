import { Fragment } from 'react';
import { formatHouseType } from '@/features/listings/lib/map-apt-sales-detail';
import type { SpecialSupplyStatusRow } from '@/shared/types/api';

interface SpecialSupplyStatusTableProps {
  rows: SpecialSupplyStatusRow[];
}

/**
 * 특별공급 신청현황 — 평형 × 유형 row. 지역별 접수건수(해당지역/수도권/
 * 기타지역)를 함께 보여 해당지역 우선순위가 얼마나 강한지 가늠하도록 합니다.
 * 기관추천/이전기관은 지역 구분 없이 totalCount 만 있어 지역 컬럼은 "-" 로
 * 내려놓습니다.
 *
 * 수도권(`metropolitanCount`) 컬럼은 비수도권 분양에서는 의미가 없으므로 모든
 * row 의 값이 0/누락이면 헤더와 데이터 셀을 함께 숨겨 노이즈를 제거합니다.
 *
 * 데스크톱(`sm:` 이상): 첫 컬럼에 주택형 셀을 rowSpan 으로 펼치고 가로 폭이
 * 부족하면 가로 스크롤로 흘립니다. 모바일(`< sm`): 가로 스크롤 대신 주택형을
 * 그룹 머리행으로 빼서 본문 컬럼이 좁은 화면을 더 넓게 사용하도록 합니다.
 */
export function SpecialSupplyStatusTable({
  rows,
}: SpecialSupplyStatusTableProps) {
  if (rows.length === 0) {
    return (
      <p className="text-body-md text-text-tertiary">
        특별공급 신청현황이 아직 집계되지 않았습니다.
      </p>
    );
  }

  const groupSizes = computeGroupSizes(rows);
  const showMetropolitan = rows.some((r) => (r.metropolitanCount ?? 0) > 0);
  const totalCols = showMetropolitan ? 7 : 6;

  return (
    <div className="rounded-md overflow-hidden bg-bg-card sm:overflow-x-auto">
      <table className="w-full sm:min-w-150 border-collapse">
        <thead>
          <tr className="bg-bg-sunken">
            <Th align="left" className="hidden sm:table-cell">
              주택형
            </Th>
            <Th align="left">유형</Th>
            <Th align="right">배정</Th>
            <Th align="right">해당지역</Th>
            {showMetropolitan && <Th align="right">수도권</Th>}
            <Th align="right">기타지역</Th>
            <Th align="right">합계</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const groupStart = i === 0 || rows[i - 1].houseType !== row.houseType;
            const rowSpan = groupStart ? groupSizes[row.houseType] : 0;
            const rowBg = i % 2 === 0 ? 'bg-bg-card' : 'bg-bg-sunken/40';
            return (
              <Fragment key={`${row.houseType}-${row.categoryName}-${i}`}>
                {groupStart && (
                  <tr className="sm:hidden">
                    <th
                      colSpan={totalCols}
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
                  <Td align="left">{row.categoryName}</Td>
                  <Td align="right">
                    {row.supplyCount?.toLocaleString() ?? '-'}
                  </Td>
                  <Td align="right">
                    {row.localAreaCount?.toLocaleString() ?? '-'}
                  </Td>
                  {showMetropolitan && (
                    <Td align="right">
                      {row.metropolitanCount?.toLocaleString() ?? '-'}
                    </Td>
                  )}
                  <Td align="right">
                    {row.otherAreaCount?.toLocaleString() ?? '-'}
                  </Td>
                  <Td align="right" className="font-medium">
                    {row.totalCount?.toLocaleString() ?? '-'}
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

function computeGroupSizes(rows: SpecialSupplyStatusRow[]): Record<string, number> {
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
