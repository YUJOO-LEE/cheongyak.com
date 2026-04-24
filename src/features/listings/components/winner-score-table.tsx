import type { WinnerScoreRow } from '@/shared/types/api';

interface WinnerScoreTableProps {
  rows: WinnerScoreRow[];
}

/**
 * 당첨가점 표 — 평형 × 거주지역 row. 가점제 미적용 단지는 API 가 빈
 * 배열을 내려주므로 이 컴포넌트 자체를 마운트하지 않는 편이 맞습니다.
 */
export function WinnerScoreTable({ rows }: WinnerScoreTableProps) {
  if (rows.length === 0) {
    return (
      <p className="text-body-md text-text-tertiary">
        가점제 적용 평형이 없거나 아직 집계 전입니다.
      </p>
    );
  }

  return (
    <div className="rounded-md overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-bg-sunken">
            <Th align="left">주택형</Th>
            <Th align="left">거주지역</Th>
            <Th align="right">최저</Th>
            <Th align="right">평균</Th>
            <Th align="right">최고</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={`${row.houseType}-${row.residence ?? 'nores'}-${i}`}
              className={i % 2 === 0 ? 'bg-bg-card' : 'bg-bg-page'}
            >
              <Td align="left" className="font-medium">
                {row.houseType}
              </Td>
              <Td align="left">{row.residence ?? '-'}</Td>
              <Td align="right">{row.lowestDisplay}</Td>
              <Td align="right">{row.averageDisplay}</Td>
              <Td align="right">{row.highestDisplay}</Td>
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
        'text-label-lg text-text-secondary px-4 py-3',
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
        'text-body-sm text-text-primary px-4 py-3',
        alignClass[align],
        className,
      ].join(' ')}
    >
      {children}
    </td>
  );
}
