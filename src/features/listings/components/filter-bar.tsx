'use client';

import { useState, useEffect } from 'react';
import { SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { Button } from '@/shared/components';
import { STATUS_LABELS, TYPE_LABELS } from '@/shared/lib/constants';
import type { SubscriptionStatus, SubscriptionType } from '@/shared/types/api';

interface FilterBarProps {
  selectedStatus: string | null;
  selectedType: string | null;
  onStatusChange: (status: string | null) => void;
  onTypeChange: (type: string | null) => void;
  onReset: () => void;
  activeCount: number;
}

const statusOptions = (Object.entries(STATUS_LABELS) as [SubscriptionStatus, string][]).map(
  ([value, label]) => ({ value, label }),
);

const typeOptions = (Object.entries(TYPE_LABELS) as [SubscriptionType, string][]).map(
  ([value, label]) => ({ value, label }),
);

export function FilterBar({
  selectedStatus,
  selectedType,
  onStatusChange,
  onTypeChange,
  onReset,
  activeCount,
}: FilterBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    if (!closing) return;
    const timer = setTimeout(() => {
      setMobileOpen(false);
      setClosing(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [closing]);

  const handleClose = () => setClosing(true);

  return (
    <>
      {/* Desktop filter bar */}
      <div className="hidden lg:flex items-center gap-3 sticky top-16 z-dropdown bg-bg-card/80 backdrop-blur-glass px-6 py-3 rounded-lg shadow-sm mb-6 animate-fade-in-up">
        <span className="text-label-lg text-text-secondary shrink-0">상태</span>
        <div className="flex gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                onStatusChange(selectedStatus === opt.value ? null : opt.value)
              }
              className={[
                'px-3 py-1.5 rounded-full text-label-md transition-colors duration-fast cursor-pointer active:scale-95',
                selectedStatus === opt.value
                  ? 'bg-neutral-500 text-text-inverse shadow-sm'
                  : 'bg-chip-bg text-text-secondary hover:bg-chip-bg-hover',
              ].join(' ')}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-border-divider mx-2" />

        <span className="text-label-lg text-text-secondary shrink-0">유형</span>
        <div className="flex gap-2">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                onTypeChange(selectedType === opt.value ? null : opt.value)
              }
              className={[
                'px-3 py-1.5 rounded-full text-label-md transition-colors duration-fast cursor-pointer active:scale-95',
                selectedType === opt.value
                  ? 'bg-neutral-500 text-text-inverse shadow-sm'
                  : 'bg-chip-bg text-text-secondary hover:bg-chip-bg-hover',
              ].join(' ')}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="ml-auto flex items-center gap-1 text-label-md text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
          >
            <RotateCcw size={14} aria-hidden="true" />
            초기화
          </button>
        )}
      </div>

      {/* Mobile filter button */}
      <div className="lg:hidden px-4 py-3 mb-4 animate-fade-in-up">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-bg-card text-text-secondary text-label-lg shadow-sm cursor-pointer"
        >
          <SlidersHorizontal size={18} aria-hidden="true" />
          필터
          {activeCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-neutral-500 text-text-inverse text-caption">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile filter sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-modal lg:hidden">
          <div
            className={`absolute inset-0 bg-bg-overlay animate-fade-in ${closing ? 'overlay-closing' : ''}`}
            onClick={handleClose}
            aria-hidden="true"
          />
          <div
            className={`absolute bottom-0 left-0 right-0 bg-bg-page/55 backdrop-blur-glass rounded-t-xl shadow-[0_-0.5px_0_rgba(15,23,42,0.08),0_-12px_40px_rgba(15,23,42,0.12)] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] animate-slide-up-sheet ${closing ? 'sheet-closing' : ''}`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-headline-sm">필터</h2>
              <button
                onClick={handleClose}
                className="p-2 cursor-pointer"
                aria-label="필터 닫기"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-label-lg text-text-secondary mb-2">상태</p>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      onStatusChange(selectedStatus === opt.value ? null : opt.value)
                    }
                    className={[
                      'px-4 py-2 rounded-full text-label-lg transition-colors cursor-pointer active:scale-95',
                      selectedStatus === opt.value
                        ? 'bg-neutral-500 text-text-inverse shadow-sm'
                        : 'bg-neutral-200 text-text-secondary',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-label-lg text-text-secondary mb-2">유형</p>
              <div className="flex flex-wrap gap-2">
                {typeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      onTypeChange(selectedType === opt.value ? null : opt.value)
                    }
                    className={[
                      'px-4 py-2 rounded-full text-label-lg transition-colors cursor-pointer active:scale-95',
                      selectedType === opt.value
                        ? 'bg-neutral-500 text-text-inverse shadow-sm'
                        : 'bg-neutral-200 text-text-secondary',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              {activeCount > 0 && (
                <Button variant="secondary" size="lg" onClick={onReset} className="flex-1">
                  초기화
                </Button>
              )}
              <Button
                variant="primary"
                size="lg"
                onClick={handleClose}
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
