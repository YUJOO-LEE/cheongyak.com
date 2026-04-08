'use client';

import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/shared/components';
import type { SubscriptionStatus } from '@/shared/types/api';

interface FilterBarProps {
  selectedStatus: string | null;
  selectedType: string | null;
  onStatusChange: (status: string | null) => void;
  onTypeChange: (type: string | null) => void;
  onReset: () => void;
  activeCount: number;
}

const statusOptions: { value: SubscriptionStatus; label: string }[] = [
  { value: 'accepting', label: '접수중' },
  { value: 'upcoming', label: '접수예정' },
  { value: 'closing_soon', label: '마감임박' },
  { value: 'closed', label: '마감' },
];

const typeOptions = [
  { value: 'public', label: '공공' },
  { value: 'private', label: '민간' },
];

export function FilterBar({
  selectedStatus,
  selectedType,
  onStatusChange,
  onTypeChange,
  onReset,
  activeCount,
}: FilterBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop filter bar */}
      <div className="hidden lg:flex items-center gap-3 sticky top-16 z-dropdown bg-bg-card/80 backdrop-blur-glass px-6 py-3 rounded-lg shadow-sm mb-6">
        <span className="text-label-lg font-semibold text-text-secondary shrink-0">상태</span>
        <div className="flex gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                onStatusChange(selectedStatus === opt.value ? null : opt.value)
              }
              className={[
                'px-3 py-1.5 rounded-full text-label-md font-semibold transition-colors duration-fast cursor-pointer',
                selectedStatus === opt.value
                  ? 'bg-brand-primary-500 text-neutral-0'
                  : 'bg-bg-sunken text-text-secondary hover:bg-neutral-200',
              ].join(' ')}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-neutral-200 mx-2" />

        <span className="text-label-lg font-semibold text-text-secondary shrink-0">유형</span>
        <div className="flex gap-2">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                onTypeChange(selectedType === opt.value ? null : opt.value)
              }
              className={[
                'px-3 py-1.5 rounded-full text-label-md font-semibold transition-colors duration-fast cursor-pointer',
                selectedType === opt.value
                  ? 'bg-brand-primary-500 text-neutral-0'
                  : 'bg-bg-sunken text-text-secondary hover:bg-neutral-200',
              ].join(' ')}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="ml-auto flex items-center gap-1 text-label-md font-semibold text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
          >
            <X size={14} aria-hidden="true" />
            초기화
          </button>
        )}
      </div>

      {/* Mobile filter button */}
      <div className="lg:hidden sticky top-0 z-dropdown bg-bg-page/80 backdrop-blur-glass px-4 py-3 mb-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-bg-card text-text-secondary text-label-lg font-semibold shadow-sm cursor-pointer"
        >
          <SlidersHorizontal size={18} aria-hidden="true" />
          필터
          {activeCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-brand-primary-500 text-neutral-0 text-caption">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile filter sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-modal lg:hidden">
          <div
            className="absolute inset-0 bg-bg-overlay"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-bg-card rounded-t-xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-headline-sm font-bold">필터</h2>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 cursor-pointer"
                aria-label="필터 닫기"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-label-lg font-semibold text-text-secondary mb-2">상태</p>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      onStatusChange(selectedStatus === opt.value ? null : opt.value)
                    }
                    className={[
                      'px-4 py-2 rounded-full text-label-lg font-semibold transition-colors cursor-pointer',
                      selectedStatus === opt.value
                        ? 'bg-brand-primary-500 text-neutral-0'
                        : 'bg-bg-sunken text-text-secondary',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-label-lg font-semibold text-text-secondary mb-2">유형</p>
              <div className="flex flex-wrap gap-2">
                {typeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      onTypeChange(selectedType === opt.value ? null : opt.value)
                    }
                    className={[
                      'px-4 py-2 rounded-full text-label-lg font-semibold transition-colors cursor-pointer',
                      selectedType === opt.value
                        ? 'bg-brand-primary-500 text-neutral-0'
                        : 'bg-bg-sunken text-text-secondary',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              {activeCount > 0 && (
                <Button variant="tertiary" size="lg" onClick={onReset} className="flex-1">
                  초기화
                </Button>
              )}
              <Button
                variant="primary"
                size="lg"
                onClick={() => setMobileOpen(false)}
                className="flex-1"
              >
                적용
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
