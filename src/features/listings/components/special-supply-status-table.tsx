import type { SpecialSupplyStatusRow } from '@/shared/types/api';

interface SpecialSupplyStatusTableProps {
  rows: SpecialSupplyStatusRow[];
}

/**
 * 특별공급 신청현황 — 평형 × 유형 row. 지역별 접수건수(해당지역/기타경기/
 * 기타지역)를 함께 보여 해당지역 우선순위가 얼마나 강한지 가늠하도록 합니다.
 * 기관추천/이전기관은 지역 구분 없이 totalCount 만 있어 지역 컬럼은 "-" 로
 * 내려놓습니다.
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

  return (
    <div className="rounded-md overflow-x-auto">
      <table className="w-full min-w-150">
        <thead>
          <tr className="bg-bg-sunken">
            <Th align="left">주택형</Th>
            <Th align="left">유형</Th>
            <Th align="right">배정</Th>
            <Th align="right">해당지역</Th>
            <Th align="right">기타경기</Th>
            <Th align="right">기타지역</Th>
            <Th align="right">합계</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={`${row.houseType}-${row.categoryName}-${i}`}
              className={i % 2 === 0 ? 'bg-bg-card' : 'bg-bg-page'}
            >
              <Td align="left" className="font-medium">
                {row.houseType}
              </Td>
              <Td align="left">{row.categoryName}</Td>
              <Td align="right">
                {row.supplyCount?.toLocaleString() ?? '-'}
              </Td>
              <Td align="right">
                {row.localAreaCount?.toLocaleString() ?? '-'}
              </Td>
              <Td align="right">
                {row.metropolitanCount?.toLocaleString() ?? '-'}
              </Td>
              <Td align="right">
                {row.otherAreaCount?.toLocaleString() ?? '-'}
              </Td>
              <Td align="right" className="font-medium">
                {row.totalCount?.toLocaleString() ?? '-'}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
}: {
  align: 'left' | 'center' | 'right';
  children: React.ReactNode;
}) {
  return (
    <th
      className={[
        'text-label-lg text-text-secondary px-4 py-3 whitespace-nowrap',
        alignClass[align],
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
}: {
  align: 'left' | 'center' | 'right';
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <td
      className={[
        'text-body-sm text-text-primary px-4 py-3 whitespace-nowrap',
        alignClass[align],
        className,
      ].join(' ')}
    >
      {children}
    </td>
  );
}
