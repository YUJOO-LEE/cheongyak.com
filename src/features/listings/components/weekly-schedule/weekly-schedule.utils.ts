import type { Subscription } from '@/shared/types/api';

export interface DayInfo {
  shortLabel: string;
  date: Date;
  dateStr: string;
  isToday: boolean;
  isPast: boolean;
}

export function getWeekdays(): DayInfo[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const monday = new Date(now);
  if (isWeekend) {
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 2;
    monday.setDate(now.getDate() + daysUntilMonday);
  } else {
    monday.setDate(now.getDate() - (dayOfWeek - 1));
  }
  const shortNames = ['월', '화', '수', '목', '금'];

  return Array.from({ length: 5 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return {
      shortLabel: shortNames[i]!,
      date,
      dateStr: `${date.getMonth() + 1}.${date.getDate()}`,
      isToday: date.toDateString() === now.toDateString(),
      isPast: date < new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    };
  });
}

// 서버 /main/weekly-schedule 은 주간에 속한 모든 상태(마감 포함) 를 내려주므로
// 이번 주 "진행 중" 일정만 보여주기 위해 accepting/result_today 만 통과시킨다.
const ACTIVE_STATUSES = new Set<Subscription['status']>(['accepting', 'result_today']);

export function getSubsForDate(subs: Subscription[], date: Date): Subscription[] {
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return subs.filter(
    (s) =>
      ACTIVE_STATUSES.has(s.status) &&
      dateStr >= s.applicationStart &&
      dateStr <= s.applicationEnd,
  );
}
