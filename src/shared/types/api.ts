import { z } from 'zod';

// ============================================================
// Status
// ============================================================

export const SubscriptionStatusSchema = z.enum([
  'accepting',
  'upcoming',
  'closing_soon',
  'closed',
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

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
  trend: z.enum(['up', 'down', 'flat']),
  trendValue: z.string(),
});
export type MarketInsight = z.infer<typeof MarketInsightSchema>;

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
