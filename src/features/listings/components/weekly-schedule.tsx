'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Building2, CalendarOff } from 'lucide-react';
import { StatusChip } from '@/shared/components';
import { statusToChipStatus, formatDateRange } from '@/shared/lib/format';
import type { Subscription } from '@/shared/types/api';

interface WeeklyScheduleProps {
  subscriptions: Subscription[];
}

interface DayInfo {
  shortLabel: string;
  date: Date;
  dateStr: string;
  isToday: boolean;
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
                  'transition-all duration-fast ease-default cursor-pointer',
                  isSelected
                    ? 'bg-brand-tertiary-500 text-neutral-0'
                    : day.isToday
                      ? 'bg-brand-tertiary-100 active:bg-brand-tertiary-200'
                      : 'bg-bg-card active:bg-neutral-200',
                ].join(' ')}
              >
                <span className={[
                  'text-label-md font-semibold',
                  isSelected ? 'text-neutral-0' : 'text-text-primary',
                ].join(' ')}>
                  {day.isToday ? '오늘' : day.shortLabel}
                </span>
                <span className={[
                  'text-caption',
                  isSelected ? 'text-neutral-0/70' : 'text-text-tertiary',
                ].join(' ')}>
                  {day.dateStr}
                </span>
                {/* Always render count row for consistent height */}
                <span className={[
                  'text-caption font-medium h-4 mt-0.5',
                  count === 0 ? 'invisible' : '',
                  isSelected ? 'text-neutral-0/70' : 'text-brand-tertiary-700',
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

      {/* ═══════ Desktop: unified column cards ═══════ */}
      <div className="hidden lg:grid grid-cols-5 gap-4">
        {weekdays.map((day) => {
          const daySubs = getSubsForDate(subscriptions, day.date);

          return (
            <div
              key={day.dateStr}
              className={[
                'rounded-xl overflow-hidden',
                day.isToday ? 'bg-brand-tertiary-500' : 'bg-bg-card',
              ].join(' ')}
            >
              {/* Integrated header — part of the same card */}
              <div className="text-center py-3">
                <p className={[
                  'text-label-lg font-bold',
                  day.isToday ? 'text-neutral-0' : 'text-text-primary',
                ].join(' ')}>
                  {day.shortLabel}
                </p>
                <p className={[
                  'text-caption',
                  day.isToday ? 'text-neutral-0/70' : 'text-text-tertiary',
                ].join(' ')}>
                  {day.dateStr}
                  {daySubs.length > 0 && (
                    <span className="ml-1.5 font-medium">
                      · {daySubs.length}건
                    </span>
                  )}
                </p>
              </div>

              {/* Body — seamless continuation */}
              <div className="p-3 pt-1 min-h-36">
                {daySubs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-28 text-text-tertiary">
                    <CalendarOff size={18} aria-hidden="true" />
                    <span className="text-caption mt-1.5">일정 없음</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {daySubs.map((sub) => (
                      <DesktopCard key={sub.id} subscription={sub} isToday={day.isToday} />
                    ))}
                  </div>
                )}
              </div>
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

function DesktopCard({ subscription: sub, isToday }: { subscription: Subscription; isToday: boolean }) {
  return (
    <Link
      href={`/listings/${sub.id}`}
      className={[
        'block rounded-lg p-4 transition-all duration-fast ease-default',
        isToday ? 'bg-brand-tertiary-200 hover:bg-brand-tertiary-100' : 'bg-brand-tertiary-50 hover:bg-brand-tertiary-100',
      ].join(' ')}
    >
      <StatusChip status={statusToChipStatus(sub.status)} className="mb-3" />
      <p className="text-body-lg font-semibold text-text-primary line-clamp-2 mb-3">
        {sub.name}
      </p>
      <div className="flex flex-col gap-1.5 mb-3">
        <SubscriptionInfo sub={sub} compact />
      </div>
      <p className="text-caption text-text-secondary">
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
          className="block bg-bg-card rounded-xl p-4 active:bg-neutral-50 transition-all duration-fast ease-default"
        >
          <div className="flex items-center justify-between mb-2.5">
            <StatusChip status={statusToChipStatus(sub.status)} />
            <span className="text-caption text-text-tertiary">
              {formatDateRange(sub.applicationStart, sub.applicationEnd)}
            </span>
          </div>

          <h3 className="text-headline-sm font-bold text-text-primary mb-2.5">
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
