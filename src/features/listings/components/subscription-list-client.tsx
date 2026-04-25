'use client';

import { useCallback, useState } from 'react';
import {
  createSerializer,
  parseAsArrayOf,
  parseAsInteger,
  parseAsStringEnum,
  useQueryStates,
} from 'nuqs';
import { SubscriptionCard } from './subscription-card';
import { FilterBar, FilterField } from './filter-bar';
import { statusOptions, typeOptions } from './filter-bar/filter-bar.options';
import { EmptyState, Pagination } from '@/shared/components';
import {
  REGION_GROUPS,
  REGION_LABEL_MAP,
} from '@/features/listings/lib/map-apt-sales';
import type { ItemRegionCode } from '@/shared/api/generated/schemas/itemRegionCode';
import {
  SubscriptionStatusSchema,
  SubscriptionTypeSchema,
  type Subscription,
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

// Schema shared between filter inputs and the pagination href serializer.
// Pagination needs a baseHref that carries the current filters so page
// navigation doesn't strip them. `createSerializer` drops default values
// (page=1, empty arrays), so the result is `/listings` when clean and
// `/listings?status=…&region=…` with filters applied.
const filtersSchema = {
  status: statusParser,
  type: typeParser,
  region: regionParser,
  page: parseAsInteger.withDefault(1),
};

const serializeFilters = createSerializer(filtersSchema);

interface SubscriptionListClientProps {
  subscriptions: Subscription[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Client surface for `/listings`. Data comes pre-fetched from the
 * Server Component (`page.tsx`) — this layer owns only the URL-bound
 * filter state and the mobile-sheet draft buffer.
 *
 * `useQueryStates` is configured with `shallow: false` so any filter
 * change triggers a router transition (re-runs the route, re-fetches
 * with the new searchParams, drops `loading.tsx` for the wait), and
 * `scroll: true` so the user lands at the top of the new result list.
 */
export function SubscriptionListClient({
  subscriptions,
  totalCount,
  totalPages,
  currentPage,
}: SubscriptionListClientProps) {
  const [filters, setFilters] = useQueryStates(filtersSchema, {
    shallow: false,
    scroll: true,
  });
  const {
    status: selectedStatus,
    type: selectedType,
    region: selectedRegions,
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

      {subscriptions.length === 0 ? (
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
