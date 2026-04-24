import type { CompetitionRow } from '@/shared/types/api';

interface CompetitionTableProps {
  rows: CompetitionRow[];
}

/**
 * 경쟁률 표 — 평형 × 순위 × 거주지역 row. 서버가 집계 전이면 빈 배열을
 * 내려주므로 이 컴포넌트를 아예 마운트하지 않는 편이 맞고, 마운트된
 * 시점에 rows 가 비면 "집계 전" 안내를 보여 재요청을 유도합니다.
 */
export function CompetitionTable({ rows }: CompetitionTableProps) {
  if (rows.length === 0) {
    return (
      <p className="text-body-md text-text-tertiary">
        접수 집계 전이라 경쟁률이 아직 공개되지 않았습니다.
      </p>
    );
  }

  return (
    <div className="rounded-md overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-bg-sunken">
            <Th align="left">주택형</Th>
            <Th align="center">순위</Th>
            <Th align="left">거주지역</Th>
            <Th align="right">공급세대</Th>
            <Th align="right">접수건수</Th>
            <Th align="right">경쟁률</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={`${row.houseType}-${row.rank ?? 'nr'}-${row.residence ?? 'nores'}-${i}`}
              className={i % 2 === 0 ? 'bg-bg-card' : 'bg-bg-page'}
            >
              <Td align="left" className="font-medium">
                {row.houseType}
              </Td>
              <Td align="center">
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
                {row.rateDisplay ?? '-'}
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
