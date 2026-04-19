import { MapPin, Building2 } from 'lucide-react';
import type { Subscription } from '@/shared/types/api';

interface SubscriptionInfoProps {
  sub: Subscription;
  compact?: boolean;
}

export function SubscriptionInfo({ sub, compact = false }: SubscriptionInfoProps) {
  const iconSize = compact ? 12 : 14;
  const textClass = compact ? 'text-caption' : 'text-body-sm';

  return (
    <>
      <div className={['flex items-center gap-1.5 text-text-secondary', textClass].join(' ')}>
        <MapPin size={iconSize} aria-hidden="true" className="text-text-tertiary shrink-0" />
        <span className="truncate">
          {sub.location.sido} {sub.location.gugun}
          {sub.location.dong ? ` ${sub.location.dong}` : ''}
        </span>
      </div>
      <div className={['flex items-center gap-1.5 text-text-secondary', textClass].join(' ')}>
        <Building2 size={iconSize} aria-hidden="true" className="text-text-tertiary shrink-0" />
        <span className="truncate">{sub.builder}</span>
      </div>
    </>
  );
}
