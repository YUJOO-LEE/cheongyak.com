'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SupplyBreakdown as SupplyBreakdownType, SupplyItem } from '@/shared/types/api';

interface SupplyBreakdownProps {
  supply: SupplyBreakdownType;
}

export function SupplyBreakdown({ supply }: SupplyBreakdownProps) {
  return (
    <div className="flex flex-col gap-6">
      <CollapsibleSection title="특별공급" items={supply.special} defaultOpen />
      <CollapsibleSection title="일반공급" items={supply.general} defaultOpen />
    </div>
  );
}

interface CollapsibleSectionProps {
  title: string;
  items: SupplyItem[];
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, items, defaultOpen = false }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const totalUnits = items.reduce((sum, item) => sum + item.units, 0);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left py-2 cursor-pointer"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-headline-sm text-text-primary">{title}</h3>
          <span className="text-body-sm text-text-tertiary">
            총 {totalUnits.toLocaleString()}세대
          </span>
        </div>
        <ChevronDown
          size={20}
          className={[
            'text-text-tertiary transition-transform duration-fast',
            open ? 'rotate-180' : '',
          ].join(' ')}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="mt-2 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-sunken">
                <th className="text-left text-label-lg text-text-secondary px-4 py-3">
                  구분
                </th>
                <th className="text-right text-label-lg text-text-secondary px-4 py-3">
                  세대수
                </th>
                <th className="text-left text-label-lg text-text-secondary px-4 py-3 hidden sm:table-cell">
                  평형
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr
                  key={item.category}
                  className={i % 2 === 0 ? 'bg-bg-card' : 'bg-bg-page'}
                >
                  <td className="text-body-md text-text-primary px-4 py-3">
                    {item.category}
                  </td>
                  <td className="text-body-md text-text-primary text-right px-4 py-3">
                    {item.units.toLocaleString()}
                  </td>
                  <td className="text-body-sm text-text-secondary px-4 py-3 hidden sm:table-cell">
                    {item.sizes?.join(', ') || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
