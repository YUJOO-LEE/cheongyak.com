'use client';

import { useEffect, useMemo, useRef } from 'react';
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

interface SubscriptionListClientProps {
  subscriptions: Subscription[];
}

const ITEMS_PER_PAGE = 20;

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

// 시/도 명(예: "서울특별시") 을 region code 의 Korean label 과 매칭.
// API 바인딩 전에는 fixture 의 sido 이름이 regionCode 의 label 과 동일하므로
// 문자열 동등 비교만으로 충분하다.
function subscriptionMatchesRegion(
  subscription: Subscription,
  regionCodes: ReadonlyArray<RegionCode>,
): boolean {
  if (regionCodes.length === 0) return true;
  return regionCodes.some((code) => subscription.location.sido === REGION_LABEL_MAP[code]);
}

export function SubscriptionListClient({ subscriptions }: SubscriptionListClientProps) {
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

  const filtered = useMemo(() => {
    return subscriptions.filter((s) => {
      if (selectedStatus.length > 0 && !selectedStatus.includes(s.status)) {
        return false;
      }
      if (selectedType.length > 0 && !selectedType.includes(s.type)) {
        return false;
      }
      if (!subscriptionMatchesRegion(s, selectedRegions)) {
        return false;
      }
      return true;
    });
  }, [subscriptions, selectedStatus, selectedType, selectedRegions]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

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

      {paged.length === 0 ? (
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
            총 {filtered.length}건
          </p>

          <div
            key={listKey}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 lg:px-0"
          >
            {paged.map((sub, index) => (
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
