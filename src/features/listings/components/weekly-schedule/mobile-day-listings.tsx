import Link from 'next/link';
import { CalendarOff, MapPin } from 'lucide-react';
import { StatusChip, TypeChip } from '@/shared/components';
import type { WeeklySubscription } from '@/shared/types/api';

interface MobileDayListingsProps {
  subscriptions: WeeklySubscription[];
}

export function MobileDayListings({ subscriptions }: MobileDayListingsProps) {
  if (subscriptions.length === 0) {
    return (
      <div className="bg-bg-sunken rounded-xl p-8 text-center">
        <CalendarOff size={24} className="mx-auto text-text-tertiary mb-2" aria-hidden="true" />
        <p className="text-body-md text-text-tertiary">예정된 청약이 없어요</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {subscriptions.map((sub, i) => {
        const region = [sub.location.gugun, sub.location.dong].filter(Boolean).join(' ');

        return (
          <Link
            key={sub.id}
            href={`/listings/${sub.id}`}
            className="block bg-bg-card rounded-xl p-4 active:bg-bg-active transition-all duration-normal ease-default animate-fade-in-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex flex-wrap gap-1 mb-2.5">
              {sub.phases.map((phase) => (
                <StatusChip key={phase} status={sub.status} label={phase} size="sm" />
              ))}
              <TypeChip type={sub.type} size="sm" />
            </div>

            <h3 className="text-headline-sm text-text-primary mb-2">{sub.name}</h3>

            {region && (
              <div className="flex items-center gap-1.5 text-body-sm text-text-secondary">
                <MapPin size={14} aria-hidden="true" className="text-text-tertiary shrink-0" />
                <span className="truncate">{region}</span>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
