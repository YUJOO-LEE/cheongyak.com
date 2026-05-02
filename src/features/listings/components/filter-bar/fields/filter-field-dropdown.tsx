'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import type { DropdownFieldProps } from './filter-field.types';

function defaultFormatSummary(labels: string[]): string {
  if (labels.length === 0) return '';
  if (labels.length === 1) return labels[0]!;
  if (labels.length === 2) return `${labels[0]}, ${labels[1]}`;
  return `${labels[0]} 외 +${labels.length - 1}`;
}

/**
 * Dropdown field — region multi-select (filter-ui-spec §3.1).
 *
 * Desktop variant renders a popover anchored below the trigger. Mobile
 * variant expands inline inside the sheet group (no nested sub-sheet).
 * Both render the same grouped chip pool with regional subheadings.
 */
export function FilterFieldDropdown<TValue extends string>(
  props: DropdownFieldProps<TValue>,
) {
  return (
    <>
      <div className="hidden lg:block">
        <FilterFieldDropdownDesktop {...props} />
      </div>
      <div className="lg:hidden">
        <FilterFieldDropdownMobile {...props} />
      </div>
    </>
  );
}

function DropdownTrigger<TValue extends string>({
  label,
  groups,
  value,
  placeholder,
  formatSummary = defaultFormatSummary,
  triggerAriaLabel,
  open,
  onToggle,
  panelId,
}: DropdownFieldProps<TValue> & {
  open: boolean;
  onToggle: () => void;
  panelId: string;
}) {
  const flatOptions = groups.flatMap((g) => g.options);
  const selectedLabels = value
    .map((v) => flatOptions.find((o) => o.value === v)?.label)
    .filter((l): l is string => Boolean(l));
  const summary = selectedLabels.length > 0 ? formatSummary(selectedLabels) : placeholder;
  const count = value.length;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-haspopup="dialog"
      aria-controls={panelId}
      aria-label={
        triggerAriaLabel ?? `${label}, ${count > 0 ? `${count}개 선택됨` : '전체'}`
      }
      className="h-11 px-3 min-w-40 rounded-md bg-neutral-200 lg:bg-bg-sunken flex items-center justify-between gap-2 text-body-md text-text-primary cursor-pointer hover:bg-neutral-300 lg:hover:bg-bg-hover"
    >
      <span className="truncate">{summary}</span>
      <span className="flex items-center gap-1.5 shrink-0">
        {count > 0 && (
          <span
            aria-label={`선택된 ${label} ${count}개`}
            className="min-w-5 h-5 px-1.5 rounded-full bg-neutral-500 text-text-inverse text-caption inline-flex items-center justify-center"
          >
            {count}
          </span>
        )}
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={open ? 'rotate-180 transition-transform' : 'transition-transform'}
        />
      </span>
    </button>
  );
}

function DropdownPanel<TValue extends string>({
  label,
  groups,
  value,
  onChange,
  placeholder,
  panelId,
}: Omit<DropdownFieldProps<TValue>, 'triggerAriaLabel' | 'formatSummary'> & {
  panelId: string;
}) {
  function toggle(next: TValue) {
    const current = value;
    const nextValues = current.includes(next)
      ? current.filter((v) => v !== next)
      : [...current, next];
    onChange(nextValues);
  }

  return (
    <div
      id={panelId}
      role="dialog"
      aria-label={`${label} 선택`}
      className="flex flex-col"
    >
      <div className="shrink-0 p-3">
        <button
          type="button"
          aria-pressed={value.length === 0}
          onClick={() => onChange([])}
          className={[
            'w-full rounded-md px-3 py-2 text-left text-label-md transition-colors duration-fast cursor-pointer',
            value.length === 0
              ? 'bg-neutral-500 text-text-inverse shadow-sm'
              : 'bg-bg-sunken text-text-secondary hover:bg-chip-bg-hover',
          ].join(' ')}
        >
          {placeholder}
        </button>
      </div>

      <div className="lg:max-h-80 lg:overflow-y-auto overflow-x-hidden px-3 pb-3 space-y-3">
        {groups.map((group) => (
          <section key={group.label}>
            <p className="mb-1.5 px-1 text-label-md text-text-secondary">{group.label}</p>
            <div role="group" aria-label={`${group.label} ${label}`} className="flex flex-wrap gap-3">
            {group.options.map((opt) => {
              const selected = value.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={selected}
                  aria-label={`${opt.label}, ${selected ? '선택됨' : '선택 안 됨'}`}
                  onClick={() => toggle(opt.value)}
                  className={[
                    'relative h-8 px-3 rounded-full text-label-md inline-flex items-center gap-1 chip-hit-slop cursor-pointer transition-colors duration-fast active:scale-95',
                    selected
                      ? 'bg-neutral-500 text-text-inverse shadow-sm'
                      : 'bg-chip-bg text-text-secondary hover:bg-chip-bg-hover',
                  ].join(' ')}
                >
                  {selected && <Check size={14} aria-hidden="true" className="shrink-0" />}
                  {opt.label}
                </button>
              );
            })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function FilterFieldDropdownDesktop<TValue extends string>(
  props: DropdownFieldProps<TValue>,
) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <DropdownTrigger
        {...props}
        open={open}
        onToggle={() => setOpen((v) => !v)}
        panelId={panelId}
      />
      {open && (
        <div className="absolute left-0 top-full mt-1 min-w-64 max-w-lg bg-bg-elevated rounded-md shadow-md z-dropdown overflow-hidden flex flex-col">
          <DropdownPanel {...props} panelId={panelId} />
        </div>
      )}
    </div>
  );
}

function FilterFieldDropdownMobile<TValue extends string>(
  props: DropdownFieldProps<TValue>,
) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="flex flex-col gap-2">
      <p className="text-label-lg text-text-secondary">{props.label}</p>
      <DropdownTrigger
        {...props}
        open={open}
        onToggle={() => setOpen((v) => !v)}
        panelId={panelId}
      />
      {open && (
        <div className="rounded-md bg-bg-elevated overflow-hidden">
          <DropdownPanel {...props} panelId={panelId} />
        </div>
      )}
    </div>
  );
}
