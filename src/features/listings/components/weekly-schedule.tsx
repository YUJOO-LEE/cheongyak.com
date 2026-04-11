'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Building2, CalendarOff } from 'lucide-react';
import { StatusChip } from '@/shared/components';
import { formatDateRange } from '@/shared/lib/format';
import type { Subscription } from '@/shared/types/api';

interface WeeklyScheduleProps {
  subscriptions: Subscription[];
}

interface DayInfo {
  shortLabel: string;
  date: Date;
  dateStr: string;
  isToday: boolean;
  isPast: boolean;
}

function getWeekdays(): DayInfo[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const shortNames = ['월', '화', '수', '목', '금'];

  return Array.from({ length: 5 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return {
      shortLabel: shortNames[i],
      date,
      dateStr: `${date.getMonth() + 1}.${date.getDate()}`,
      isToday: date.toDateString() === now.toDateString(),
      isPast: date < new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    };
  });
}

function getSubsForDate(subs: Subscription[], date: Date): Subscription[] {
  const dateStr = date.toISOString().slice(0, 10);
  return subs.filter((s) => dateStr >= s.applicationStart && dateStr <= s.applicationEnd);
}

export function WeeklySchedule({ subscriptions }: WeeklyScheduleProps) {
  const weekdays = getWeekdays();
  const todayIdx = weekdays.findIndex((d) => d.isToday);
  const [selectedDay, setSelectedDay] = useState(todayIdx >= 0 ? todayIdx : 0);

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarOff size={32} className="mx-auto text-text-tertiary mb-3" aria-hidden="true" />
        <p className="text-body-md text-text-secondary mb-2">이번 주 예정된 청약이 없습니다.</p>
        <Link href="/listings" className="text-body-md text-brand-primary-500 hover:text-brand-primary-600 transition-colors">
          전체 청약 보기
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* ═══════ Mobile ═══════ */}
      <div className="lg:hidden">
        {/* Day selector — fixed height, always 3 rows: label, date, count/placeholder */}
        <div className="flex gap-2 mb-4">
          {weekdays.map((day, i) => {
            const count = getSubsForDate(subscriptions, day.date).length;
            const isSelected = i === selectedDay;

            return (
              <button
                key={day.dateStr}
                onClick={() => setSelectedDay(i)}
                className={[
                  'flex-1 flex flex-col items-center py-2 rounded-xl',
                  'transition-all duration-normal ease-default cursor-pointer',
                  isSelected
                    ? 'bg-brand-tertiary-500 text-text-on-dark'
                    : day.isToday
                      ? 'bg-brand-tertiary-100 active:bg-brand-tertiary-200'
                      : 'bg-bg-card active:bg-bg-active',
                ].join(' ')}
              >
                <span className={[
                  'text-label-md',
                  isSelected ? 'text-text-on-dark' : 'text-text-primary',
                ].join(' ')}>
                  {day.isToday ? '오늘' : day.shortLabel}
                </span>
                <span className={[
                  'text-caption',
                  isSelected ? 'text-text-on-dark-muted' : 'text-text-tertiary',
                ].join(' ')}>
                  {day.dateStr}
                </span>
                {/* Always render count row for consistent height */}
                <span className={[
                  'text-caption font-medium h-4 mt-0.5',
                  count === 0 ? 'invisible' : '',
                  isSelected ? 'text-text-on-dark-muted' : 'text-brand-tertiary-700',
                ].join(' ')}>
                  {count}건
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected day's listings */}
        <MobileDayListings
          subscriptions={getSubsForDate(subscriptions, weekdays[selectedDay].date)}
        />
      </div>

      {/* ═══════ Desktop: flat columns, cards only ═══════ */}
      <div className="hidden lg:grid grid-cols-5 gap-6">
        {weekdays.map((day, i) => {
          const daySubs = getSubsForDate(subscriptions, day.date);

          return (
            <div
              key={day.dateStr}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Column header — no wrapper, just text */}
              <div className="text-center mb-3">
                {day.isToday ? (
                  <>
                    <div className="flex items-center justify-center gap-1.5">
                      <p className="text-label-lg text-brand-primary-700">오늘</p>
                      <span className="inline-block size-1.5 rounded-full bg-brand-primary-500 animate-pulse-soft" />
                    </div>
                    <p className="text-caption text-brand-primary-600">
                      {day.dateStr}
                      {daySubs.length > 0 && (
                        <span className="ml-1.5 font-medium">{daySubs.length}건</span>
                      )}
                    </p>
                  </>
                ) : (
                  <>
                    <p className={[
                      'text-label-lg',
                      day.isPast ? 'text-text-tertiary' : 'text-text-primary',
                    ].join(' ')}>
                      {day.shortLabel}
                    </p>
                    <p className="text-caption text-text-tertiary">
                      {day.dateStr}
                      {daySubs.length > 0 && (
                        <span className="ml-1.5 font-medium">· {daySubs.length}건</span>
                      )}
                    </p>
                  </>
                )}
              </div>

              {/* Cards — single level, no nesting */}
              {daySubs.length === 0 ? (
                <p className="text-caption text-text-tertiary text-center py-8">일정 없음</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {daySubs.map((sub) => (
                    <DesktopCard key={sub.id} subscription={sub} isPast={day.isPast} isToday={day.isToday} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ─── Shared card content (used by both mobile & desktop) ─── */

function SubscriptionInfo({ sub, compact = false }: { sub: Subscription; compact?: boolean }) {
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

/* ─── Desktop mini card ─── */

function DesktopCard({ subscription: sub, isPast, isToday }: { subscription: Subscription; isPast: boolean; isToday: boolean }) {
  return (
    <Link
      href={`/listings/${sub.id}`}
      className={[
        'block rounded-lg p-3 bg-bg-card',
        isToday ? 'shadow-md' : '',
        'transition-all duration-fast ease-default',
        'hover:-translate-y-0.5 hover:shadow-md',
        'active:translate-y-0 active:shadow-sm',
        isPast ? 'opacity-80 hover:opacity-100' : '',
      ].join(' ')}
    >
      <StatusChip status={sub.status} className="mb-2" />
      <p className="text-body-md font-medium text-text-primary line-clamp-2 mb-2">
        {sub.name}
      </p>
      <div className="flex flex-col gap-1 mb-2">
        <SubscriptionInfo sub={sub} compact />
      </div>
      <p className="text-caption text-text-tertiary">
        {sub.totalUnits.toLocaleString()}세대 · {sub.sizeRange}
      </p>
    </Link>
  );
}

/* ─── Mobile card list ─── */

function MobileDayListings({ subscriptions }: { subscriptions: Subscription[] }) {
  if (subscriptions.length === 0) {
    return (
      <div className="bg-bg-card rounded-xl p-8 text-center">
        <CalendarOff size={24} className="mx-auto text-text-tertiary mb-2" aria-hidden="true" />
        <p className="text-body-md text-text-secondary">이 날은 청약 일정이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {subscriptions.map((sub) => (
        <Link
          key={sub.id}
          href={`/listings/${sub.id}`}
          className="block bg-bg-card rounded-xl p-4 active:bg-bg-active transition-all duration-normal ease-default"
        >
          <div className="flex items-center justify-between mb-2.5">
            <StatusChip status={sub.status} />
            <span className="text-caption text-text-tertiary">
              {formatDateRange(sub.applicationStart, sub.applicationEnd)}
            </span>
          </div>

          <h3 className="text-headline-sm text-text-primary mb-2.5">
            {sub.name}
          </h3>

          <div className="flex flex-col gap-1 mb-3">
            <SubscriptionInfo sub={sub} />
          </div>

          <p className="text-caption text-text-tertiary">
            {sub.totalUnits.toLocaleString()}세대 · {sub.sizeRange}
          </p>
        </Link>
      ))}
    </div>
  );
}
