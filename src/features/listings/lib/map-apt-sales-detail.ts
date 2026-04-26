/**
 * API ↔ domain mapping for `GET /apt-sales/{id}`.
 *
 * Keeps the view-facing `SubscriptionDetail` shape stable while the
 * backend's 5-section response (announcement / models / competitions /
 * winnerScores / specialSupplies) evolves. The mapper is the only place
 * nullable wire fields get collapsed to display-safe defaults, and the
 * only place schedule state (`past | current | future`) is derived —
 * the UI stays a dumb renderer.
 *
 * Policy echoes `docs/apt-sales-binding-plan.md` §5: generated orval
 * types stay untouched, mapping lives in the feature.
 */
import type { AptSalesDetailResponse } from '@/shared/api/generated/schemas/aptSalesDetailResponse';
import type { CompetitionItem } from '@/shared/api/generated/schemas/competitionItem';
import type { DateRange } from '@/shared/api/generated/schemas/dateRange';
import type { ModelItem } from '@/shared/api/generated/schemas/modelItem';
import type { RegulationSection } from '@/shared/api/generated/schemas/regulationSection';
import type { ScheduleSection } from '@/shared/api/generated/schemas/scheduleSection';
import type { SpecialDetailSection } from '@/shared/api/generated/schemas/specialDetailSection';
import type { SpecialSupplyItem } from '@/shared/api/generated/schemas/specialSupplyItem';
import type { WinnerScoreItem } from '@/shared/api/generated/schemas/winnerScoreItem';
import type {
  CompetitionRow,
  ModelSupply,
  RegulationFlag,
  SchedulePhase,
  SpecialSupplyBreakdownItem,
  SpecialSupplyStatusRow,
  SubscriptionDetail,
  WinnerScoreRow,
} from '@/shared/types/api';
import {
  REGION_LABEL_MAP,
  formatArea,
  formatSizeRange,
  mapApiDetailTypeToDomain,
  mapApiStatusToDomain,
} from './map-apt-sales';

// ─── 특공 세분 유형 라벨 ───────────────────────────────────────────────
// `SpecialDetailSection` 필드명 → 한국어 카테고리 라벨. `SpecialSupplyCategoryItem`
// 의 8종 enum 과 동일한 표기를 유지해 UI 에서 같은 라벨로 병합 가능하게 합니다.
const SPECIAL_DETAIL_LABELS: Record<keyof SpecialDetailSection, string> = {
  multiChild: '다자녀',
  newlywed: '신혼부부',
  firstTime: '생애최초',
  elderlyParent: '노부모부양',
  institution: '기관추천',
  etc: '기타',
  transferInstitution: '이전기관',
  youth: '청년',
  newborn: '신생아',
};

// ─── 규제 플래그 라벨 ─────────────────────────────────────────────────
export const REGULATION_LABELS: Record<RegulationFlag, string> = {
  speculativeArea: '투기과열지구',
  adjustmentArea: '조정대상지역',
  priceCeiling: '분양가상한제',
  redevelopment: '정비사업',
  publicHousingDistrict: '공공주택지구',
  largeScaleDevelopment: '대규모 택지개발지구',
  metropolitanPublicHousing: '수도권 공공주택지구',
  publicHousingSpecialLaw: '공공주택 특별법',
};

const REGULATION_KEYS: readonly RegulationFlag[] = [
  'speculativeArea',
  'adjustmentArea',
  'priceCeiling',
  'redevelopment',
  'publicHousingDistrict',
  'largeScaleDevelopment',
  'metropolitanPublicHousing',
  'publicHousingSpecialLaw',
];

// ─── 공급주소 파싱 ────────────────────────────────────────────────────
// `AnnouncementSection` 에는 시군구/읍면동 컬럼이 분리돼 있지 않아
// supplyAddress 원문에서 토큰을 뽑습니다. 주소가 비정형이면 시도만
// 채우고 나머지는 비웁니다.
export function parseSupplyAddress(
  supplyAddress: string | null | undefined,
  sido: string,
): { gugun: string; dong: string | undefined } {
  if (!supplyAddress) return { gugun: '', dong: undefined };
  const tokens = supplyAddress.trim().split(/\s+/);
  if (tokens.length === 0) return { gugun: '', dong: undefined };

  // sido 가 첫 토큰과 일치/포함하면 건너뛰고 나머지를 gugun/dong 후보로 씁니다.
  let rest = tokens;
  const first = tokens[0];
  if (first && (sido.startsWith(first) || first.startsWith(sido))) {
    rest = tokens.slice(1);
  }

  const gugunCandidate = rest[0] ?? '';
  // "수원시 영통구" 처럼 두 토큰이 시군구를 이루는 경우 이어 붙입니다.
  let gugun = gugunCandidate;
  let dongIdx = 1;
  if (rest[1] && /(시|군|구)$/.test(rest[1])) {
    gugun = `${gugunCandidate} ${rest[1]}`.trim();
    dongIdx = 2;
  }

  const dongCandidate = rest[dongIdx];
  const dong =
    dongCandidate && /(동|읍|면|가|로|리)$/.test(dongCandidate)
      ? dongCandidate
      : undefined;

  return { gugun, dong };
}

// ─── 일정 파생 ────────────────────────────────────────────────────────
function toIsoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function phaseState(
  today: Date,
  startDate: string,
  endDate: string | undefined,
): SchedulePhase['state'] {
  const todayIso = toIsoDay(today);
  const effectiveEnd = endDate ?? startDate;
  if (todayIso < startDate) return 'future';
  if (todayIso > effectiveEnd) return 'past';
  return 'current';
}

function pickRange(
  range: DateRange | null | undefined,
): { start: string | undefined; end: string | undefined } {
  if (!range) return { start: undefined, end: undefined };
  return {
    start: range.start ?? undefined,
    end: range.end ?? undefined,
  };
}

interface PhaseCandidate {
  phase: string;
  label: string;
  startDate: string | undefined;
  endDate: string | undefined;
}

/**
 * 서버가 내려주는 `ScheduleSection` + `moveInMonth` 를 7단계 phase 배열로
 * 접습니다. 날짜가 전혀 없는 phase 는 타임라인에서 빼서 빈 줄이 보이지
 * 않도록 합니다.
 */
export function deriveSchedulePhases(
  schedule: ScheduleSection | null | undefined,
  moveInMonth: string | null | undefined,
  today: Date = new Date(),
): SchedulePhase[] {
  const s = schedule ?? {};
  const specialSupply = pickRange(s.specialSupply);
  const firstRank = pickRange(s.firstRankLocal);
  const secondRank = pickRange(s.secondRankLocal);
  const contract = pickRange(s.contract);

  const candidates: PhaseCandidate[] = [
    {
      phase: 'announcement',
      label: '모집공고',
      startDate: s.announcementDate ?? undefined,
      endDate: undefined,
    },
    {
      phase: 'special-supply',
      label: '특별공급',
      startDate: specialSupply.start,
      endDate: specialSupply.end,
    },
    {
      phase: 'first-rank',
      label: '일반공급 1순위',
      startDate: firstRank.start,
      endDate: firstRank.end,
    },
    {
      phase: 'second-rank',
      label: '일반공급 2순위',
      startDate: secondRank.start,
      endDate: secondRank.end,
    },
    {
      phase: 'winner-announcement',
      label: '당첨자 발표',
      startDate: s.winnerAnnouncementDate ?? undefined,
      endDate: undefined,
    },
    {
      phase: 'contract',
      label: '계약 기간',
      startDate: contract.start,
      endDate: contract.end,
    },
    {
      phase: 'move-in',
      label: '입주 예정',
      startDate: moveInMonth ? `${moveInMonth}-01` : undefined,
      endDate: undefined,
    },
  ];

  return candidates
    .filter((c): c is PhaseCandidate & { startDate: string } => !!c.startDate)
    .map((c) => ({
      phase: c.phase,
      label: c.label,
      startDate: c.startDate,
      endDate: c.endDate,
      state: phaseState(today, c.startDate, c.endDate),
    }));
}

// ─── 규제 파생 ────────────────────────────────────────────────────────
export function pickActiveRegulations(
  regs: RegulationSection | null | undefined,
): RegulationFlag[] {
  if (!regs) return [];
  return REGULATION_KEYS.filter((key) => regs[key] === true);
}

// ─── 모델 매핑 ────────────────────────────────────────────────────────
function mapSpecialDetail(
  detail: SpecialDetailSection | null | undefined,
): SpecialSupplyBreakdownItem[] {
  if (!detail) return [];
  const entries = Object.entries(detail) as ReadonlyArray<
    [keyof SpecialDetailSection, number | null | undefined]
  >;
  return entries
    .filter(([, v]) => typeof v === 'number' && v > 0)
    .map(([k, v]) => ({
      category: SPECIAL_DETAIL_LABELS[k],
      count: v as number,
    }));
}

function mapModel(item: ModelItem): ModelSupply {
  return {
    modelNo: item.modelNo,
    houseType: item.houseType ?? undefined,
    supplyArea: item.supplyArea ?? undefined,
    generalCount: item.generalSupplyCount ?? 0,
    specialCount: item.specialSupplyCount ?? 0,
    specialBreakdown: mapSpecialDetail(item.specialDetail),
    topAmount: item.topAmount ?? undefined,
  };
}

// ─── 경쟁률/가점/특공현황 매핑 ────────────────────────────────────────
function mapCompetition(item: CompetitionItem): CompetitionRow {
  return {
    houseType: item.houseType,
    rank: item.subscriptionRank ?? undefined,
    residence: item.residenceName ?? undefined,
    supplyCount: item.supplyHouseholdCount ?? undefined,
    requestCount: item.requestCount ?? undefined,
    rateDisplay: item.competitionRateDisplay ?? undefined,
    isShortage: item.isShortage,
  };
}

function mapWinnerScore(item: WinnerScoreItem): WinnerScoreRow {
  return {
    houseType: item.houseType,
    residence: item.residenceName ?? undefined,
    lowestDisplay: item.lowestScoreDisplay ?? '-',
    highestDisplay: item.highestScoreDisplay ?? '-',
    averageDisplay: item.averageScoreDisplay ?? '-',
  };
}

function mapSpecialSupplyStatus(
  items: SpecialSupplyItem[],
): SpecialSupplyStatusRow[] {
  return items.flatMap((parent) =>
    parent.categories.map((c) => ({
      houseType: parent.houseType,
      categoryName: c.categoryName,
      supplyCount: c.supplyCount ?? undefined,
      localAreaCount: c.localAreaCount ?? undefined,
      metropolitanCount: c.metropolitanCount ?? undefined,
      otherAreaCount: c.otherAreaCount ?? undefined,
      totalCount: c.totalCount ?? undefined,
    })),
  );
}

// ─── 가격 포맷터 ──────────────────────────────────────────────────────
// 분양가는 만원 단위로 내려옵니다. "150000" → "15억", "162500" → "16억 2,500만".
export function formatPriceManWon(manWon: number): string {
  if (manWon < 0) return '';
  const eok = Math.floor(manWon / 10000);
  const remainder = manWon % 10000;
  if (eok > 0 && remainder === 0) return `${eok.toLocaleString()}억`;
  if (eok > 0) return `${eok.toLocaleString()}억 ${remainder.toLocaleString()}만`;
  return `${manWon.toLocaleString()}만`;
}

function formatPriceRange(
  min: number | undefined,
  max: number | undefined,
): string | undefined {
  if (min === undefined && max === undefined) return undefined;
  const lo = min ?? max!;
  const hi = max ?? min!;
  if (lo === hi) return formatPriceManWon(lo);
  // U+00A0 (no-break space) before "~" keeps "lower~" glued together so
  // narrow columns wrap *after* the tilde, producing
  //   "12억 5,000만~"
  //   "15억 2,000만"
  // instead of breaking before "~" or somewhere inside the lower bound.
  return `${formatPriceManWon(lo)} ~ ${formatPriceManWon(hi)}`;
}

// ─── 헬퍼: models 에서 공급면적 최소/최대 ─────────────────────────────
function minMax(
  values: ReadonlyArray<number | undefined>,
): { min: number | undefined; max: number | undefined } {
  const defined = values.filter((v): v is number => typeof v === 'number');
  if (defined.length === 0) return { min: undefined, max: undefined };
  return { min: Math.min(...defined), max: Math.max(...defined) };
}

// ─── 엔트리 포인트 ────────────────────────────────────────────────────
export function mapAptSalesDetailToSubscription(
  response: AptSalesDetailResponse,
  today: Date = new Date(),
): SubscriptionDetail {
  const { announcement, models, competitions, winnerScores, specialSupplies } =
    response;

  const sido =
    announcement.regionName ??
    (announcement.regionCode
      ? REGION_LABEL_MAP[announcement.regionCode]
      : '');
  const { gugun, dong } = parseSupplyAddress(announcement.supplyAddress, sido);

  const { start: appStart, end: appEnd } = pickRange(
    announcement.schedule?.subscription,
  );

  const areas = models.map((m) => m.supplyArea ?? undefined);
  const { min: minArea, max: maxArea } = minMax(areas);
  const prices = models.map((m) => m.topAmount ?? undefined);
  const { min: minPrice, max: maxPrice } = minMax(prices);

  const mappedModels = models.map(mapModel);

  return {
    id: String(announcement.id),
    name: announcement.houseName ?? '',
    location: { sido, gugun, dong },
    builder: announcement.constructorName ?? '',
    status: mapApiStatusToDomain(announcement.status),
    type: mapApiDetailTypeToDomain(announcement.houseDetailType ?? null),
    applicationStart: appStart ?? '',
    applicationEnd: appEnd ?? '',
    totalUnits: announcement.totalSupplyHouseholdCount ?? 0,
    sizeRange: formatSizeRange(minArea, maxArea),
    priceRange: formatPriceRange(minPrice, maxPrice),
    // Official links — API에는 시행사 홈페이지(homepageUrl)와 모집공고문
    // (announcementUrl) 두 필드만 존재. 청약홈 신청 URL은 별도 필드가 없어
    // applyHomeUrl 은 undefined 로 둡니다(차후 청약홈 deeplink 룰 도입 예정).
    builderUrl: announcement.homepageUrl ?? undefined,
    applyHomeUrl: undefined,
    announcementUrl: announcement.announcementUrl ?? undefined,
    // Extra info
    supplyAddress: announcement.supplyAddress ?? undefined,
    businessEntityName: announcement.businessEntityName ?? undefined,
    inquiryPhone: announcement.inquiryPhone ?? undefined,
    moveInMonth: announcement.moveInMonth ?? undefined,
    // Section data
    schedule: deriveSchedulePhases(
      announcement.schedule,
      announcement.moveInMonth,
      today,
    ),
    regulations: pickActiveRegulations(announcement.regulations),
    models: mappedModels,
    competitions: competitions.map(mapCompetition),
    winnerScores: winnerScores.map(mapWinnerScore),
    specialSupplyStatus: mapSpecialSupplyStatus(specialSupplies),
  };
}

// `formatArea` re-export 로 새 섹션 컴포넌트들이 동일 포맷터를 공유하도록 노출.
export { formatArea };

const HOUSE_TYPE_PATTERN = /^0*(\d+)(?:\.\d+)?([A-Za-z]*)$/;

/**
 * 주택형 라벨 정규화 — `059.9400A` → `59A`, `084.99B` → `84B`, `074` → `74`.
 * 소수점 이하 숫자는 평면도 분류용 내부값이라 사용자 화면에서는 정수+서픽스만
 * 노출하면 충분합니다. 패턴이 깨진 입력은 원문 그대로 반환합니다.
 */
export function formatHouseType(raw: string | null | undefined): string {
  if (raw == null) return '';
  const trimmed = raw.trim();
  if (trimmed === '') return '';
  const match = trimmed.match(HOUSE_TYPE_PATTERN);
  if (!match) return trimmed;
  return `${match[1]}${match[2]}`;
}
