'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { TextFieldProps } from './filter-field.types';

/**
 * Text field — keyword search (filter-ui-spec §3.1).
 *
 * Mirrors the URL-bound `value` into a local string for uncommitted input,
 * then flushes to `onChange` on a debounce timer. Composition events (IME)
 * pause commits until `compositionend` fires so Korean input never commits
 * mid-syllable.
 *
 * The parent owns the canonical value (URL query). When the URL moves out
 * from under us (back/forward navigation, external reset), the effect on
 * `value` rehydrates the local draft without triggering another commit.
 */
export function FilterFieldText({
  label,
  value,
  onChange,
  placeholder,
  maxLength = 50,
  debounceMs = 300,
  helperText,
  inputAriaLabel,
  clearAriaLabel = '검색어 지우기',
}: TextFieldProps) {
  const [draft, setDraft] = useState(value);
  const isComposingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rehydrate the draft when the canonical value changes externally
  // (URL reset, back/forward, parent clear). Skip self-origin updates —
  // draft already equals value.
  useEffect(() => {
    setDraft((current) => (current === value ? current : value));
  }, [value]);

  function scheduleCommit(next: string) {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (debounceMs === 0) {
      onChange(next);
      return;
    }
    timerRef.current = setTimeout(() => {
      onChange(next);
      timerRef.current = null;
    }, debounceMs);
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const truncated = raw.length > maxLength ? raw.slice(0, maxLength) : raw;
    setDraft(truncated);
    if (isComposingRef.current) return;
    scheduleCommit(truncated);
  }

  function handleCompositionStart() {
    isComposingRef.current = true;
  }

  function handleCompositionEnd(e: React.CompositionEvent<HTMLInputElement>) {
    isComposingRef.current = false;
    scheduleCommit(e.currentTarget.value.slice(0, maxLength));
  }

  function handleClear() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setDraft('');
    onChange('');
    inputRef.current?.focus();
  }

  const hasValue = draft.length > 0;

  return (
    <div role="search" className="flex flex-col gap-1">
      <label className="text-label-lg text-text-secondary" htmlFor="filter-keyword">
        {label}
      </label>
      <div className="relative flex items-center h-11 bg-bg-sunken rounded-md px-3">
        <Search size={18} aria-hidden="true" className="text-text-tertiary shrink-0" />
        <input
          ref={inputRef}
          id="filter-keyword"
          type="search"
          value={draft}
          onChange={handleInput}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder={placeholder}
          maxLength={maxLength}
          aria-label={inputAriaLabel ?? label}
          className="flex-1 min-w-0 bg-transparent outline-none px-2 text-body-md text-text-primary placeholder:text-text-tertiary"
        />
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            aria-label={clearAriaLabel}
            className="shrink-0 min-h-11 min-w-11 inline-flex items-center justify-center text-text-tertiary hover:text-text-secondary cursor-pointer"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>
      {helperText && (
        <p
          className="text-caption text-text-tertiary"
          aria-live="polite"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
