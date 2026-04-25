import type { DayOfWeek, WeeklyScheduleDay } from '@/shared/types/api';

export interface DayInfo {
  shortLabel: string;
  /** "M.D" 형식 (예: "4.15") */
  dateStr: string;
  isToday: boolean;
  isPast: boolean;
}

const DAY_OF_WEEK_LABEL: Record<DayOfWeek, string> = {
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
  SUNDAY: '일',
};

// 서버 day(date + dayOfWeek) 와 클라이언트 현재 시각을 받아 UI 표시용
// 파생 정보(요일 라벨, M.D 문자열, 오늘/과거 여부)를 만든다.
// 오늘/과거 비교는 사용자 환경 시각이 기준이라 서버에서 내려줄 수 없다.
export function deriveDayInfo(day: WeeklyScheduleDay, now: Date): DayInfo {
  const [yStr, mStr, dStr] = day.date.split('-');
  const year = Number(yStr);
  const month = Number(mStr);
  const dayNum = Number(dStr);
  const dateStr = `${month}.${dayNum}`;

  const todayY = now.getFullYear();
  const todayM = now.getMonth() + 1;
  const todayD = now.getDate();

  const isToday = year === todayY && month === todayM && dayNum === todayD;
  const isPast =
    year < todayY ||
    (year === todayY && month < todayM) ||
    (year === todayY && month === todayM && dayNum < todayD);

  return {
    shortLabel: DAY_OF_WEEK_LABEL[day.dayOfWeek],
    dateStr,
    isToday,
    isPast,
  };
}
