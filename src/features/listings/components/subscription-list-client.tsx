'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsStringEnum,
  useQueryState,
} from 'nuqs';
import { SubscriptionCard } from './subscription-card';
import { FilterBar, FilterField } from './filter-bar';
import { statusOptions, typeOptions } from './filter-bar/filter-bar.options';
import { EmptyState, Pagination } from '@/shared/components';
import { aptSalesQueryOptions } from '@/features/listings/lib/apt-sales-query';
import {
  PAGE_SIZE,
  toAptSalesRequest,
  type ListingsFilterState,
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

export function SubscriptionListClient() {
  const [selectedStatus, setSelectedStatus] = useQueryState('status', statusParser);
  const [selectedType, setSelectedType] = useQueryState('type', typeParser);
  const [selectedRegions, setSelectedRegions] = useQueryState('region', regionParser);
  const [currentPage, setCurrentPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1),
  );

  const activeFilterCount =
    selectedStatus.length + selectedType.length + selectedRegions.length;

  // Reset page to 1 whenever a filter value changes. Centralizing this keeps
  // change handlers pure and prevents pagination drift as filters grow.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setCurrentPage(null);
  }, [selectedStatus, selectedType, selectedRegions, setCurrentPage]);

  const filterState = useMemo<ListingsFilterState>(
    () => ({
      status: selectedStatus,
      type: selectedType,
      region: selectedRegions,
      page: currentPage,
    }),
    [selectedStatus, selectedType, selectedRegions, currentPage],
  );

  const request = useMemo(() => toAptSalesRequest(filterState), [filterState]);

  const { data: envelope } = useSuspenseQuery(aptSalesQueryOptions(request));
  const response = envelope.data.data;
  const subscriptions = useMemo(
    () => (response?.items ?? []).map(mapItemToSubscription),
    [response?.items],
  );
  const totalCount = response?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function handleReset() {
    setSelectedStatus(null);
    setSelectedType(null);
    setSelectedRegions(null);
  }

  const listKey = [
    selectedStatus.join(','),
    selectedType.join(','),
    selectedRegions.join(','),
    currentPage,
  ].join('|');

  return (
    <>
      <FilterBar activeCount={activeFilterCount} onReset={handleReset}>
        <FilterBar.DesktopBar>
          <FilterField.Dropdown<RegionCode>
            label="지역"
            placeholder="지역 전체"
            groups={regionGroups}
            value={selectedRegions}
            onChange={(next) => setSelectedRegions(next.length > 0 ? next : null)}
          />
          <FilterField.Inline<SubscriptionStatus>
            label="상태"
            mode="multi"
            groupAriaLabel="청약 상태 필터"
            options={statusOptions}
            value={selectedStatus}
            onChange={(next) => setSelectedStatus(next.length > 0 ? next : null)}
          />
          <FilterField.Inline<SubscriptionType>
            label="유형"
            mode="multi"
            groupAriaLabel="공급 유형 필터"
            options={typeOptions}
            value={selectedType}
            onChange={(next) => setSelectedType(next.length > 0 ? next : null)}
          />
        </FilterBar.DesktopBar>
        <FilterBar.Sheet>
          <FilterField.Dropdown<RegionCode>
            label="지역"
            placeholder="지역 전체"
            groups={regionGroups}
            value={selectedRegions}
            onChange={(next) => setSelectedRegions(next.length > 0 ? next : null)}
          />
          <FilterField.Stacked<SubscriptionStatus>
            label="상태"
            mode="multi"
            groupAriaLabel="청약 상태 필터"
            options={statusOptions}
            value={selectedStatus}
            onChange={(next) => setSelectedStatus(next.length > 0 ? next : null)}
          />
          <FilterField.Stacked<SubscriptionType>
            label="유형"
            mode="multi"
            groupAriaLabel="공급 유형 필터"
            options={typeOptions}
            value={selectedType}
            onChange={(next) => setSelectedType(next.length > 0 ? next : null)}
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
          <p
            className="text-body-sm text-text-tertiary mb-4 px-4 lg:px-0 animate-count-up-fade"
            style={{ animationDelay: '60ms' }}
          >
            총 {totalCount}건
          </p>

          <div
            key={listKey}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 lg:px-0"
          >
            {subscriptions.map((sub, index) => (
              <div
                key={sub.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${120 + index * 30}ms` }}
              >
                <SubscriptionCard subscription={sub} />
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseHref="/listings"
            className="mt-8"
          />
        </>
      )}
    </>
  );
}
