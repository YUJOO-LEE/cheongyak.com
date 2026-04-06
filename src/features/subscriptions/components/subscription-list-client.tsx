'use client';

import { useState, useMemo } from 'react';
import { SubscriptionCard } from './subscription-card';
import { FilterBar } from './filter-bar';
import { Pagination } from '@/shared/components';
import type { Subscription } from '@/shared/types/api';

interface SubscriptionListClientProps {
  subscriptions: Subscription[];
}

const ITEMS_PER_PAGE = 20;

export function SubscriptionListClient({ subscriptions }: SubscriptionListClientProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const activeFilterCount = [selectedStatus, selectedType].filter(Boolean).length;

  const filtered = useMemo(() => {
    let result = [...subscriptions];
    if (selectedStatus) {
      result = result.filter((s) => s.status === selectedStatus);
    }
    return result;
  }, [subscriptions, selectedStatus]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  function handleReset() {
    setSelectedStatus(null);
    setSelectedType(null);
    setCurrentPage(1);
  }

  function handleStatusChange(status: string | null) {
    setSelectedStatus(status);
    setCurrentPage(1);
  }

  function handleTypeChange(type: string | null) {
    setSelectedType(type);
    setCurrentPage(1);
  }

  return (
    <>
      <FilterBar
        selectedStatus={selectedStatus}
        selectedType={selectedType}
        onStatusChange={handleStatusChange}
        onTypeChange={handleTypeChange}
        onReset={handleReset}
        activeCount={activeFilterCount}
      />

      {paged.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-body-lg text-text-secondary">
            조건에 맞는 청약 정보가 없습니다.
          </p>
          <button
            onClick={handleReset}
            className="mt-2 text-label-lg text-interactive-default hover:text-interactive-hover transition-colors cursor-pointer"
          >
            필터 초기화
          </button>
        </div>
      ) : (
        <>
          <p className="text-body-sm text-text-tertiary mb-4 px-4 lg:px-0">
            총 {filtered.length}건
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 lg:px-0">
            {paged.map((sub) => (
              <SubscriptionCard key={sub.id} subscription={sub} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseHref="/subscriptions"
            className="mt-8"
          />
        </>
      )}
    </>
  );
}
