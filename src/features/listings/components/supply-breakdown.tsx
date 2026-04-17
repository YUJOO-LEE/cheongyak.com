import { CollapsibleSection } from './collapsible-section';
import type { SupplyBreakdown as SupplyBreakdownType } from '@/shared/types/api';

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
