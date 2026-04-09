import { StatusChip, TypeChip } from '@/shared/components';
import { statusToChipStatus } from '@/shared/lib/format';
import type { SubscriptionDetail } from '@/shared/types/api';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const startStr = formatDate(start);
  if (s.getFullYear() === e.getFullYear()) {
    return `${startStr} ~ ${e.getMonth() + 1}.${e.getDate()}`;
  }
  return `${startStr} ~ ${formatDate(end)}`;
}

interface SubscriptionHeaderProps {
  subscription: SubscriptionDetail;
}

export function SubscriptionHeader({ subscription }: SubscriptionHeaderProps) {
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <StatusChip status={statusToChipStatus(subscription.status)} />
          <TypeChip type={subscription.type} />
        </div>
        <h1 className="text-display-sm text-text-primary leading-tight">
          {subscription.name}
        </h1>
      </div>

      <dl className="bg-bg-card rounded-lg p-6 grid grid-cols-1 min-[375px]:grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
          <InfoItem label="위치">
            {subscription.location.sido} {subscription.location.gugun}
            {subscription.location.dong && ` ${subscription.location.dong}`}
          </InfoItem>
          <InfoItem label="시행사">
            {subscription.builder}
          </InfoItem>
          <InfoItem label="세대수">
            총 {subscription.totalUnits.toLocaleString()}세대
          </InfoItem>
          <InfoItem label="평형">
            {subscription.sizeRange}
          </InfoItem>
          {subscription.priceRange && (
            <InfoItem label="분양가">
              {subscription.priceRange}
            </InfoItem>
          )}
          <InfoItem label="접수기간">
            {formatDateRange(subscription.applicationStart, subscription.applicationEnd)}
          </InfoItem>
      </dl>
    </div>
  );
}

function InfoItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-label-md text-text-tertiary mb-0.5">{label}</dt>
      <dd className="text-body-md text-text-primary font-medium">{children}</dd>
    </div>
  );
}
