import { z } from 'zod';

// ============================================================
// Server enums (raw API shape)
// ============================================================

export const ApiAnnouncementStatusSchema = z.enum([
  'ANNOUNCEMENT_SCHEDULED',
  'SUBSCRIPTION_SCHEDULED',
  'SUBSCRIPTION_ACTIVE',
  'RESULT_PENDING',
  'RESULT_TODAY',
  'SUBSCRIPTION_COMPLETED',
]);
export type ApiAnnouncementStatus = z.infer<typeof ApiAnnouncementStatusSchema>;

export const ApiHouseDetailTypeSchema = z.enum(['PRIVATE', 'NATIONAL']).nullable();
export type ApiHouseDetailType = z.infer<typeof ApiHouseDetailTypeSchema>;

export const ApiDayOfWeekSchema = z.enum([
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]);
export type ApiDayOfWeek = z.infer<typeof ApiDayOfWeekSchema>;

// ============================================================
// GET /main/featured
// ============================================================

export const MainFeaturedResponseSchema = z.object({
  id: z.number(),
  houseName: z.string(),
  status: ApiAnnouncementStatusSchema,
  houseDetailType: ApiHouseDetailTypeSchema,
  sidoName: z.string().nullable(),
  sigunguName: z.string().nullable(),
  dongName: z.string().nullable(),
  constructorName: z.string().nullable(),
  totalSupplyHousehold: z.number().nullable(),
  minSupplyArea: z.number().nullable(),
  maxSupplyArea: z.number().nullable(),
  minTopAmount: z.number().nullable(),
  maxTopAmount: z.number().nullable(),
  subscriptionStartDate: z.string().nullable(),
  subscriptionEndDate: z.string().nullable(),
});
export type MainFeaturedResponse = z.infer<typeof MainFeaturedResponseSchema>;

// ============================================================
// GET /main/stats
// ============================================================

export const MainStatsResponseSchema = z.object({
  avgCompetitionRate: z.number(),
  competitionRateChange: z.number().nullable(),
  totalSupplyHousehold: z.number(),
  supplyHouseholdChange: z.number().nullable(),
  popularRegion: z
    .object({
      sigunguName: z.string(),
      avgCompetitionRate: z.number(),
    })
    .nullable(),
});
export type MainStatsResponse = z.infer<typeof MainStatsResponseSchema>;

// ============================================================
// GET /main/weekly-schedule
// ============================================================

export const MainWeeklyAnnouncementSchema = z.object({
  id: z.number(),
  houseName: z.string(),
  status: ApiAnnouncementStatusSchema,
  houseDetailType: ApiHouseDetailTypeSchema,
  sigunguName: z.string().nullable(),
  dongName: z.string().nullable(),
  constructorName: z.string().nullable(),
  totalSupplyHousehold: z.number().nullable(),
  minSupplyArea: z.number().nullable(),
  maxSupplyArea: z.number().nullable(),
});
export type MainWeeklyAnnouncement = z.infer<typeof MainWeeklyAnnouncementSchema>;

export const MainWeeklyScheduleDaySchema = z.object({
  date: z.string(),
  dayOfWeek: ApiDayOfWeekSchema,
  count: z.number(),
  announcements: z.array(MainWeeklyAnnouncementSchema),
});
export type MainWeeklyScheduleDay = z.infer<typeof MainWeeklyScheduleDaySchema>;

export const MainWeeklyScheduleResponseSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  days: z.array(MainWeeklyScheduleDaySchema),
});
export type MainWeeklyScheduleResponse = z.infer<typeof MainWeeklyScheduleResponseSchema>;

// ============================================================
// GET /main/top-trades
// ============================================================

export const TopTradeResponseSchema = z.object({
  id: z.number(),
  aptName: z.string(),
  sigunguName: z.string().nullable(),
  dongName: z.string().nullable(),
  exclusiveArea: z.number().nullable(),
  floor: z.number().nullable(),
  // 서버 스펙상 "만원 단위" long. 원 단위 혼입 시 매퍼가 warn 로그.
  dealAmount: z.number().nullable(),
  dealDate: z.string(),
});
export type TopTradeResponse = z.infer<typeof TopTradeResponseSchema>;

// ============================================================
// Generic envelope { data: T }
// ============================================================

export const apiEnvelope = <T extends z.ZodTypeAny>(inner: T) =>
  z.object({ data: inner });

export type ApiEnvelope<T> = { data: T };

// Returns a parser that validates `{ data: T }` via zod `safeParse` and
// throws `Error("Invalid <label> response: ...")` on schema mismatch.
// The thrown-message format is load-bearing — call sites log it via
// substring matching, so pass an endpoint-like label (e.g. "/main/stats").
export function createEnvelopeParser<S extends z.ZodTypeAny>(
  schema: S,
  label: string,
): (raw: unknown) => z.infer<S> {
  return (raw) => {
    const result = apiEnvelope(schema).safeParse(raw);
    if (!result.success) {
      throw new Error(`Invalid ${label} response: ${result.error.message}`);
    }
    return result.data.data;
  };
}
