'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { useLockBodyScroll } from '@/shared/hooks/use-lock-body-scroll';
import { Button } from '@/shared/components';

interface FilterBarShellContextValue {
  activeCount: number;
  onReset: () => void;
  mobileOpen: boolean;
  closing: boolean;
  openSheet: () => void;
  closeSheet: () => void;
}

const FilterBarShellContext = createContext<FilterBarShellContextValue | null>(null);

function useFilterBarShell(): FilterBarShellContextValue {
  const ctx = useContext(FilterBarShellContext);
  if (!ctx) {
    throw new Error(
      'FilterBar.DesktopBar and FilterBar.Sheet must be rendered inside <FilterBar>.',
    );
  }
  return ctx;
}

interface FilterBarProps {
  activeCount: number;
  onReset: () => void;
  children: ReactNode;
}

/**
 * Shell composition. Owns only cross-viewport concerns:
 *   - active filter count badge
 *   - reset affordance
 *   - mobile sheet open/close lifecycle (with 250ms closing animation)
 *
 * Field composition lives in `FilterBar.DesktopBar` and `FilterBar.Sheet`
 * so the caller chooses which fields appear on each viewport via the
 * FilterField.* slots (see `./fields`).
 */
function FilterBarRoot({ activeCount, onReset, children }: FilterBarProps) {
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

  const ctx: FilterBarShellContextValue = {
    activeCount,
    onReset,
    mobileOpen,
    closing,
    openSheet: () => setMobileOpen(true),
    closeSheet: () => setClosing(true),
  };

  return (
    <FilterBarShellContext.Provider value={ctx}>
      {children}
      <MobileTrigger />
    </FilterBarShellContext.Provider>
  );
}

function MobileTrigger() {
  const { activeCount, openSheet } = useFilterBarShell();

  return (
    <div className="lg:hidden px-4 py-3 mb-4 animate-fade-in-up">
      <button
        type="button"
        onClick={openSheet}
        className="flex items-center gap-2 px-4 py-2 rounded-md bg-bg-card text-text-secondary text-label-lg shadow-sm cursor-pointer min-h-11"
      >
        <SlidersHorizontal size={18} aria-hidden="true" />
        필터
        {activeCount > 0 && (
          <span
            className="ml-1 px-1.5 py-0.5 rounded-full bg-neutral-500 text-text-inverse text-caption"
            aria-label={`선택된 필터 ${activeCount}개`}
          >
            {activeCount}
          </span>
        )}
      </button>
    </div>
  );
}

interface DesktopBarProps {
  children: ReactNode;
}

function DesktopBar({ children }: DesktopBarProps) {
  const { activeCount, onReset } = useFilterBarShell();

  return (
    <div className="hidden lg:flex items-center flex-wrap gap-x-4 gap-y-3 sticky top-16 z-dropdown bg-bg-card/80 backdrop-blur-glass px-6 py-3 rounded-lg shadow-sm mb-6 animate-fade-in-up">
      {children}
      {activeCount > 0 && (
        <button
          type="button"
          onClick={onReset}
          className="ml-auto flex items-center gap-1 text-label-md text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer min-h-11"
        >
          <RotateCcw size={14} aria-hidden="true" />
          초기화
        </button>
      )}
    </div>
  );
}

interface SheetProps {
  children: ReactNode;
}

function Sheet({ children }: SheetProps) {
  const { activeCount, onReset, mobileOpen, closing, closeSheet } = useFilterBarShell();

  if (!mobileOpen) return null;

  return (
    <div className="fixed inset-0 z-modal lg:hidden">
      <div
        className={`absolute inset-0 bg-bg-overlay animate-fade-in ${closing ? 'overlay-closing' : ''}`}
        onClick={closeSheet}
        aria-hidden="true"
      />
      <div
        className={`absolute bottom-0 left-0 right-0 bg-bg-page/80 backdrop-blur-glass rounded-t-xl shadow-sheet-top p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] animate-slide-up-sheet ${closing ? 'sheet-closing' : ''}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-headline-sm">필터</h2>
          <button
            type="button"
            onClick={closeSheet}
            className="p-3 cursor-pointer"
            aria-label="필터 닫기"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col gap-6 mb-6">{children}</div>

        <div className="flex gap-3">
          {activeCount > 0 && (
            <Button variant="secondary" size="lg" onClick={onReset} className="flex-1">
              초기화
            </Button>
          )}
          <Button variant="primary" size="lg" onClick={closeSheet} className="flex-1">
            적용
          </Button>
        </div>
      </div>
    </div>
  );
}

export const FilterBar = Object.assign(FilterBarRoot, {
  DesktopBar,
  Sheet,
});
