'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarOff } from 'lucide-react';
import { EmptyState } from '@/shared/components';
import type { Subscription } from '@/shared/types/api';
import { getWeekdays, getSubsForDate } from './weekly-schedule.utils';
import { DesktopCard } from './desktop-card';
import { MobileDayListings } from './mobile-day-listings';

interface WeeklyScheduleProps {
  subscriptions: Subscription[];
}

export function WeeklySchedule({ subscriptions }: WeeklyScheduleProps) {
  const weekdays = getWeekdays();
  const todayIdx = weekdays.findIndex((d) => d.isToday);
  const [selectedDay, setSelectedDay] = useState(todayIdx >= 0 ? todayIdx : 0);

  if (subscriptions.length === 0) {
    return (
      <EmptyState>
        <CalendarOff size={32} className="mx-auto text-text-tertiary mb-3" aria-hidden="true" />
        <p className="text-body-md text-text-secondary mb-2">예정된 청약이 없어요</p>
        <Link href="/listings" className="text-body-md text-brand-primary-500 hover:text-brand-primary-600 transition-colors">
          전체 청약 보기
        </Link>
      </EmptyState>
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
                      : 'bg-bg-card active:bg-bg-active active:scale-[0.96]',
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
          subscriptions={getSubsForDate(subscriptions, weekdays[selectedDay]!.date)}
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
                <div className="rounded-lg bg-bg-sunken py-8">
                  <p className="text-caption text-text-tertiary text-center">예정된 일정이 없어요</p>
                </div>
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
