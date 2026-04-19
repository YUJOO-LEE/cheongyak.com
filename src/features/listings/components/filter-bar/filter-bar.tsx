'use client';

import { useState, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useLockBodyScroll } from '@/shared/hooks/use-lock-body-scroll';
import { FilterBarDesktop } from './filter-bar-desktop';
import { FilterBarSheet } from './filter-bar-sheet';

interface FilterBarProps {
  selectedStatus: string | null;
  selectedType: string | null;
  onStatusChange: (status: string | null) => void;
  onTypeChange: (type: string | null) => void;
  onReset: () => void;
  activeCount: number;
}

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

  useLockBodyScroll(mobileOpen);

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
      <FilterBarDesktop
        selectedStatus={selectedStatus}
        selectedType={selectedType}
        onStatusChange={onStatusChange}
        onTypeChange={onTypeChange}
        onReset={onReset}
        activeCount={activeCount}
      />

      {/* Mobile filter trigger */}
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

      <FilterBarSheet
        open={mobileOpen}
        closing={closing}
        selectedStatus={selectedStatus}
        selectedType={selectedType}
        onStatusChange={onStatusChange}
        onTypeChange={onTypeChange}
        onReset={onReset}
        onClose={handleClose}
        activeCount={activeCount}
      />
    </>
  );
}
