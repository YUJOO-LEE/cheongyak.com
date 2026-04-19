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
    if (selectedType) {
      result = result.filter((s) => s.type === selectedType);
    }
    return result;
  }, [subscriptions, selectedStatus, selectedType]);

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
        <div className="text-center py-16 animate-scale-in">
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
          <p
            className="text-body-sm text-text-tertiary mb-4 px-4 lg:px-0 animate-count-up-fade"
            style={{ animationDelay: '60ms' }}
          >
            총 {filtered.length}건
          </p>

          <div
            key={`${selectedStatus}-${selectedType}-${currentPage}`}
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
