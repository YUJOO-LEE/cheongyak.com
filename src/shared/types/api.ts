import { z } from 'zod';

// ============================================================
// Status
// ============================================================

export const SubscriptionStatusSchema = z.enum([
  'upcoming',
  'accepting',
  'pending',
  'contracting',
  'closed',
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

export const SubscriptionTypeSchema = z.enum(['public', 'private']);
export type SubscriptionType = z.infer<typeof SubscriptionTypeSchema>;

export const NewsCategorySchema = z.enum([
  'all',
  'policy',
  'market',
  'analysis',
  'notice',
]);
export type NewsCategory = z.infer<typeof NewsCategorySchema>;

// ============================================================
// Subscription
// ============================================================

export const SubscriptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.object({
    sido: z.string(),
    gugun: z.string(),
    dong: z.string().optional(),
  }),
  builder: z.string(),
  status: SubscriptionStatusSchema,
  type: SubscriptionTypeSchema,
  applicationStart: z.string(),
  applicationEnd: z.string(),
  totalUnits: z.number(),
  sizeRange: z.string(),
  priceRange: z.string().optional(),
  viewCount: z.number().optional(),
});
export type Subscription = z.infer<typeof SubscriptionSchema>;

export const SchedulePhaseSchema = z.object({
  phase: z.string(),
  label: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  state: z.enum(['past', 'current', 'future']),
});
export type SchedulePhase = z.infer<typeof SchedulePhaseSchema>;

export const SupplyItemSchema = z.object({
  category: z.string(),
  units: z.number(),
  sizes: z.array(z.string()).optional(),
  note: z.string().optional(),
});
export type SupplyItem = z.infer<typeof SupplyItemSchema>;

export const SupplyBreakdownSchema = z.object({
  special: z.array(SupplyItemSchema),
  general: z.array(SupplyItemSchema),
});
export type SupplyBreakdown = z.infer<typeof SupplyBreakdownSchema>;

export const SubscriptionDetailSchema = SubscriptionSchema.extend({
  builderUrl: z.string().optional(),
  announcementUrl: z.string().optional(),
  applyHomeUrl: z.string().optional(),
  schedule: z.array(SchedulePhaseSchema),
  supply: SupplyBreakdownSchema,
});
export type SubscriptionDetail = z.infer<typeof SubscriptionDetailSchema>;

// ============================================================
// News
// ============================================================

export const NewsArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  excerpt: z.string(),
  body: z.string().optional(),
  category: NewsCategorySchema,
  thumbnailUrl: z.string().optional(),
  publishedAt: z.string(),
  relatedSubscriptionIds: z.array(z.string()).optional(),
});
export type NewsArticle = z.infer<typeof NewsArticleSchema>;

// ============================================================
// Market Insights
// ============================================================

export const MarketInsightSchema = z.object({
  label: z.string(),
  value: z.string(),
  /** 데이터가 실제로 올라갔는지/내려갔는지 — 아이콘 방향에만 사용 */
  trend: z.enum(['up', 'down', 'flat']),
  trendValue: z.string(),
});
export type MarketInsight = z.infer<typeof MarketInsightSchema>;

// ============================================================
// Top Trades (실거래가)
// ============================================================

export const TopTradeSchema = z.object({
  id: z.string(),
  aptName: z.string(),
  /** "서초구 반포동" 형태로 합쳐진 지역 — API 가 sidoName 을 내리지 않아 시도는 생략 */
  region: z.string(),
  /** "85㎡ (34평)" 형태. 면적이 없으면 undefined */
  area: z.string().optional(),
  floor: z.number().optional(),
  /** "42억 3,000만" 형태 */
  dealAmount: z.string(),
  /** yyyy-MM-dd */
  dealDate: z.string(),
});
export type TopTrade = z.infer<typeof TopTradeSchema>;

// ============================================================
// Filter Options
// ============================================================

export const RegionSchema = z.object({
  sido: z.string(),
  guguns: z.array(z.string()),
});
export type Region = z.infer<typeof RegionSchema>;

export const FilterOptionsSchema = z.object({
  regions: z.array(RegionSchema),
  builders: z.array(z.string()),
});
export type FilterOptions = z.infer<typeof FilterOptionsSchema>;

// ============================================================
// Paginated Response
// ============================================================

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    totalPages: z.number(),
  });

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

// ============================================================
// API Error
// ============================================================

export interface ApiError {
  status: number;
  code: string;
  message: string;
}
