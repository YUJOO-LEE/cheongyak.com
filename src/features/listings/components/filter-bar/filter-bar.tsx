'use client';

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
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
  triggerRef: React.RefObject<HTMLButtonElement | null>;
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
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useLockBodyScroll(mobileOpen);

  useEffect(() => {
    if (!closing) return;
    const timer = setTimeout(() => {
      setMobileOpen(false);
      setClosing(false);
      // Return focus to the trigger so keyboard / screen-reader users
      // land back where they opened the sheet from.
      triggerRef.current?.focus();
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
    triggerRef,
  };

  return (
    <FilterBarShellContext.Provider value={ctx}>
      {children}
      <MobileTrigger />
    </FilterBarShellContext.Provider>
  );
}

function MobileTrigger() {
  const { activeCount, openSheet, triggerRef } = useFilterBarShell();

  return (
    <div className="lg:hidden px-4 py-3 mb-4 animate-fade-in-up">
      <button
        ref={triggerRef}
        type="button"
        onClick={openSheet}
        className="flex items-center gap-2 px-3 min-h-11 rounded-md bg-bg-card text-text-secondary text-label-lg shadow-sm cursor-pointer"
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
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  // Mount effects that run only while the sheet is open: first-focus,
  // Tab-wrap, and Escape-to-close. We intentionally depend on
  // `mobileOpen` alone (not `closing`) so the trap stays active through
  // the 250ms close animation.
  useEffect(() => {
    if (!mobileOpen) return;
    const sheet = sheetRef.current;
    if (!sheet) return;

    // First focus — the close button is the predictable landing point
    // for both keyboard users and Korean TTS, and the sheet header is
    // not focusable by default.
    closeButtonRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeSheet();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusables = sheet!.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && active === last) {
        first.focus();
        e.preventDefault();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen, closeSheet]);

  if (!mobileOpen) return null;

  return (
    <div className="fixed inset-0 z-modal lg:hidden">
      <div
        className={`absolute inset-0 bg-bg-overlay animate-fade-in ${closing ? 'overlay-closing' : ''}`}
        onClick={closeSheet}
        aria-hidden="true"
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`absolute bottom-0 left-0 right-0 bg-bg-page/80 backdrop-blur-glass rounded-t-xl shadow-sheet-top p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] animate-slide-up-sheet ${closing ? 'sheet-closing' : ''}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id={titleId} className="text-headline-sm">
            필터
          </h2>
          <button
            ref={closeButtonRef}
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
          <Button
            variant={activeCount > 0 ? 'primary' : 'secondary'}
            size="lg"
            onClick={closeSheet}
            className="flex-1"
          >
            닫기
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
