'use client';

import { useCallback, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  createSerializer,
  parseAsArrayOf,
  parseAsInteger,
  parseAsStringEnum,
  useQueryStates,
} from 'nuqs';
import { SubscriptionCard } from './subscription-card';
import { SubscriptionListSkeleton } from './subscription-list-skeleton';
import { FilterBar, FilterField } from './filter-bar';
import { statusOptions, typeOptions } from './filter-bar/filter-bar.options';
import { EmptyState, Pagination } from '@/shared/components';
import { aptSalesQueryOptions } from '@/features/listings/lib/apt-sales-query';
import {
  PAGE_SIZE,
  toAptSalesRequest,
} from '@/features/listings/lib/listings-search-params';
import {
  REGION_GROUPS,
  REGION_LABEL_MAP,
  mapItemToSubscription,
} from '@/features/listings/lib/map-apt-sales';
import type { ItemRegionCode } from '@/shared/api/generated/schemas/itemRegionCode';
import {
  SubscriptionStatusSchema,
  SubscriptionTypeSchema,
  type SubscriptionStatus,
  type SubscriptionType,
} from '@/shared/types/api';

type RegionCode = NonNullable<ItemRegionCode>;
const REGION_CODES = Object.keys(REGION_LABEL_MAP) as RegionCode[];

const statusParser = parseAsArrayOf(
  parseAsStringEnum<SubscriptionStatus>([
    ...SubscriptionStatusSchema.options,
  ]),
).withDefault([]);

const typeParser = parseAsArrayOf(
  parseAsStringEnum<SubscriptionType>([...SubscriptionTypeSchema.options]),
).withDefault([]);

const regionParser = parseAsArrayOf(
  parseAsStringEnum<RegionCode>(REGION_CODES),
).withDefault([]);

const regionGroups = REGION_GROUPS.map((group) => ({
  label: group.label,
  options: group.codes.map((code) => ({
    value: code,
    label: REGION_LABEL_MAP[code],
  })),
}));

// All four filter URL params share one atomic setter. Committing value +
// page-reset together is what makes a chip click produce exactly one URL
// push (previously filter change and page reset fired sequentially,
// causing a double render and skeleton flicker).
const filtersSchema = {
  status: statusParser,
  type: typeParser,
  region: regionParser,
  page: parseAsInteger.withDefault(1),
};

// Pagination needs a baseHref that carries the current filters so page
// navigation doesn't strip them. `createSerializer` drops default values
// (page=1, empty arrays), so the result is `/listings` when clean and
// `/listings?status=…&region=…` with filters applied.
const serializeFilters = createSerializer(filtersSchema);

export function SubscriptionListClient() {
  const [filters, setFilters] = useQueryStates(filtersSchema);
  const {
    status: selectedStatus,
    type: selectedType,
    region: selectedRegions,
    page: currentPage,
  } = filters;

  const activeFilterCount =
    selectedStatus.length + selectedType.length + selectedRegions.length;

  // ─── Mobile sheet draft state ─────────────────────────────────────────
  // Desktop chips write straight to the URL via nuqs. The mobile sheet
  // batches selections into this draft buffer so nothing is applied
  // until the user taps 적용. On open, `seedDraft` copies committed URL
  // values into the draft; on apply, `applyDraft` writes draft → URL;
  // on close without apply, the draft is discarded (next open reseeds).
  const [draftStatus, setDraftStatus] = useState<SubscriptionStatus[]>([]);
  const [draftType, setDraftType] = useState<SubscriptionType[]>([]);
  const [draftRegions, setDraftRegions] = useState<RegionCode[]>([]);
  const draftActiveCount =
    draftStatus.length + draftType.length + draftRegions.length;

  const seedDraft = useCallback(() => {
    setDraftStatus([...selectedStatus]);
    setDraftType([...selectedType]);
    setDraftRegions([...selectedRegions]);
  }, [selectedStatus, selectedType, selectedRegions]);

  function applyDraft() {
    setFilters({
      status: draftStatus.length > 0 ? draftStatus : null,
      type: draftType.length > 0 ? draftType : null,
      region: draftRegions.length > 0 ? draftRegions : null,
      page: 1,
    });
  }

  function resetDraft() {
    setDraftStatus([]);
    setDraftType([]);
    setDraftRegions([]);
  }

  function setStatus(next: SubscriptionStatus[]) {
    setFilters({ status: next.length > 0 ? next : null, page: 1 });
  }
  function setType(next: SubscriptionType[]) {
    setFilters({ type: next.length > 0 ? next : null, page: 1 });
  }
  function setRegions(next: RegionCode[]) {
    setFilters({ region: next.length > 0 ? next : null, page: 1 });
  }

  function handleReset() {
    setFilters({ status: null, type: null, region: null, page: 1 });
  }

  const request = toAptSalesRequest({
    status: selectedStatus,
    type: selectedType,
    region: selectedRegions,
    page: currentPage,
  });

  // `keepPreviousData` lets the card grid keep rendering the old results
  // while the new ones fetch — no Suspense fallback, no skeleton flicker.
  // The route-level server file is a bare shell; this client owns the
  // first fetch too, so the route skeleton from `loading.tsx` is only
  // visible for the RSC transition (near-instant) and the
  // `SubscriptionListSkeleton` below covers the actual API wait.
  const { data: envelope } = useQuery({
    ...aptSalesQueryOptions(request),
    placeholderData: keepPreviousData,
  });

  const response = envelope?.data.data;
  const subscriptions = (response?.items ?? []).map(mapItemToSubscription);
  const totalCount = response?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <>
      <FilterBar activeCount={activeFilterCount} onReset={handleReset}>
        <FilterBar.DesktopBar>
          <FilterField.Dropdown<RegionCode>
            label="지역"
            placeholder="지역 전체"
            groups={regionGroups}
            value={selectedRegions}
            onChange={setRegions}
          />
          <FilterField.Inline<SubscriptionStatus>
            label="상태"
            mode="multi"
            groupAriaLabel="청약 상태 필터"
            options={statusOptions}
            value={selectedStatus}
            onChange={setStatus}
          />
          <FilterField.Inline<SubscriptionType>
            label="유형"
            mode="multi"
            groupAriaLabel="공급 유형 필터"
            options={typeOptions}
            value={selectedType}
            onChange={setType}
          />
        </FilterBar.DesktopBar>
        <FilterBar.Sheet
          onOpen={seedDraft}
          onApply={applyDraft}
          onResetDraft={resetDraft}
          draftActiveCount={draftActiveCount}
        >
          <FilterField.Dropdown<RegionCode>
            label="지역"
            placeholder="지역 전체"
            groups={regionGroups}
            value={draftRegions}
            onChange={setDraftRegions}
          />
          <FilterField.Stacked<SubscriptionStatus>
            label="상태"
            mode="multi"
            groupAriaLabel="청약 상태 필터"
            options={statusOptions}
            value={draftStatus}
            onChange={setDraftStatus}
          />
          <FilterField.Stacked<SubscriptionType>
            label="유형"
            mode="multi"
            groupAriaLabel="공급 유형 필터"
            options={typeOptions}
            value={draftType}
            onChange={setDraftType}
          />
        </FilterBar.Sheet>
      </FilterBar>

      {!envelope ? (
        <SubscriptionListSkeleton />
      ) : subscriptions.length === 0 ? (
        <div className="animate-scale-in">
          <EmptyState size="lg">
            <p className="text-body-lg text-text-secondary">
              조건에 맞는 청약 정보가 없습니다.
            </p>
            <button
              onClick={handleReset}
              className="mt-2 text-label-lg text-interactive-default hover:text-interactive-hover transition-colors cursor-pointer"
            >
              필터 초기화
            </button>
          </EmptyState>
        </div>
      ) : (
        <>
          <p className="text-body-sm text-text-tertiary mb-4 px-4 lg:px-0">
            총 {totalCount.toLocaleString()}건
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 lg:px-0">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="animate-fade-in-up">
                <SubscriptionCard subscription={sub} />
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseHref={serializeFilters('/listings', {
              status: selectedStatus,
              type: selectedType,
              region: selectedRegions,
              page: 1,
            })}
            className="mt-8"
          />
        </>
      )}
    </>
  );
}
