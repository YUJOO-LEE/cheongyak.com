'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarOff } from 'lucide-react';
import { EmptyState } from '@/shared/components';
import type { WeeklyScheduleDay } from '@/shared/types/api';
import { deriveDayInfo } from './weekly-schedule.utils';
import { WeeklyCard } from './weekly-card';

interface WeeklyScheduleProps {
  days: WeeklyScheduleDay[];
}

export function WeeklySchedule({ days }: WeeklyScheduleProps) {
  const totalItems = days.reduce((acc, d) => acc + d.items.length, 0);

  // 서버 day 와 클라이언트의 현재 시각을 묶어 한 번에 dayInfo 를 파생.
  // useState 초기값에는 useState(() => ...) 를 쓰지 않는데, 서버 컴포넌트에서
  // 한 번 렌더된 후 클라이언트 hydration 시점에서 다시 계산되어도 같은 결과를
  // 내야 SSR/CSR 불일치 경고를 피할 수 있다. now 는 모든 day 에 대해 동일한
  // 값으로 잡아 일관성을 보장한다.
  const now = new Date();
  const enriched = days.map((day) => ({
    day,
    info: deriveDayInfo(day, now),
  }));

  const todayIdx = enriched.findIndex((e) => e.info.isToday);
  const [selectedDay, setSelectedDay] = useState(todayIdx >= 0 ? todayIdx : 0);

  if (totalItems === 0) {
    return (
      <div data-section="weekly-schedule">
        <EmptyState>
          <CalendarOff size={32} className="mx-auto text-text-tertiary mb-3" aria-hidden="true" />
          <p className="text-body-md text-text-secondary mb-2">예정된 청약이 없어요</p>
          <Link href="/listings" className="text-body-md text-brand-primary-500 hover:text-brand-primary-600 transition-colors">
            전체 청약 보기
          </Link>
        </EmptyState>
      </div>
    );
  }

  const selected = enriched[selectedDay] ?? enriched[0]!;

  return (
    <>
      {/* ═══════ Mobile ═══════ */}
      <div data-section="weekly-schedule" className="lg:hidden">
        {/* Day selector — fixed height, always 3 rows: label, date, count/placeholder */}
        <div className="flex gap-2 mb-4">
          {enriched.map(({ day, info }, i) => {
            const count = day.items.length;
            const isSelected = i === selectedDay;
            const isEmpty = count === 0;

            return (
              <button
                key={day.date}
                onClick={() => setSelectedDay(i)}
                className={[
                  'flex-1 flex flex-col items-center py-2 rounded-xl',
                  'transition-all duration-normal ease-default cursor-pointer',
                  isSelected
                    ? 'bg-brand-tertiary-500 text-text-on-dark'
                    : info.isToday
                      ? 'bg-brand-tertiary-100 active:bg-brand-tertiary-200'
                      : 'bg-bg-card active:bg-bg-active active:scale-[0.96]',
                ].join(' ')}
              >
                <span className={[
                  'text-label-md',
                  isSelected ? 'text-text-on-dark' : 'text-text-primary',
                ].join(' ')}>
                  {info.isToday ? '오늘' : info.shortLabel}
                </span>
                <span className={[
                  'text-caption',
                  isSelected ? 'text-text-on-dark-muted' : 'text-text-tertiary',
                ].join(' ')}>
                  {info.dateStr}
                </span>
                {/* 0건도 텍스트로 노출 — 배경/라벨은 다른 day 와 동일하게 두고 건수 텍스트만 회색 처리. */}
                <span className={[
                  'text-caption font-medium h-4 mt-0.5',
                  isSelected
                    ? 'text-text-on-dark-muted'
                    : isEmpty
                      ? 'text-text-tertiary'
                      : 'text-brand-tertiary-700',
                ].join(' ')}>
                  {count}건
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected day's listings */}
        {selected.day.items.length === 0 ? (
          <div className="bg-bg-sunken rounded-xl p-8 text-center">
            <CalendarOff size={24} className="mx-auto text-text-tertiary mb-2" aria-hidden="true" />
            <p className="text-body-md text-text-tertiary">예정된 청약이 없어요</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {selected.day.items.map((sub, i) => (
              <WeeklyCard key={sub.id} subscription={sub} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* ═══════ Desktop: flat columns, cards only ═══════ */}
      {/* 서버는 평일(월~금) 5개 day 를 내려보내며 skeleton 과 마찬가지로 5열 그리드 고정. */}
      <div data-section="weekly-schedule" className="hidden lg:grid grid-cols-5 gap-6">
        {enriched.map(({ day, info }, i) => {
          const daySubs = day.items;

          return (
            <div
              key={day.date}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Column header — no wrapper, just text */}
              <div className="text-center mb-3">
                {info.isToday ? (
                  <>
                    <div className="flex items-center justify-center gap-1.5">
                      <p className="text-label-lg text-brand-primary-700">오늘</p>
                      <span className="inline-block size-1.5 rounded-full bg-brand-primary-500 animate-pulse-soft" />
                    </div>
                    <p className="text-caption text-brand-primary-600">
                      {info.dateStr}
                      {daySubs.length > 0 && (
                        <span className="ml-1.5 font-medium">{daySubs.length}건</span>
                      )}
                    </p>
                  </>
                ) : (
                  <>
                    <p className={[
                      'text-label-lg',
                      info.isPast ? 'text-text-tertiary' : 'text-text-primary',
                    ].join(' ')}>
                      {info.shortLabel}
                    </p>
                    <p className="text-caption text-text-tertiary">
                      {info.dateStr}
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
                    <WeeklyCard
                      key={`${day.date}-${sub.id}`}
                      subscription={sub}
                      isPast={info.isPast}
                      isToday={info.isToday}
                    />
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
