import { STATUS_LABELS, TYPE_LABELS } from '@/shared/lib/constants';
import type { SubscriptionStatus, SubscriptionType } from '@/shared/types/api';

export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
}

export const statusOptions: FilterOption<SubscriptionStatus>[] = (
  Object.entries(STATUS_LABELS) as [SubscriptionStatus, string][]
).map(([value, label]) => ({ value, label }));

export const typeOptions: FilterOption<SubscriptionType>[] = (
  Object.entries(TYPE_LABELS) as [SubscriptionType, string][]
).map(([value, label]) => ({ value, label }));
