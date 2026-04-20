'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import type { DropdownFieldProps } from './filter-field.types';

function defaultFormatSummary(labels: string[]): string {
  if (labels.length === 0) return '';
  if (labels.length === 1) return labels[0]!;
  if (labels.length === 2) return `${labels[0]}, ${labels[1]}`;
  return `${labels[0]} 외 +${labels.length - 1}`;
}

/**
 * Dropdown field — region multi-select (filter-ui-spec §3.2).
 *
 * Desktop variant renders a Popover anchored below the trigger. Mobile
 * variant expands inline inside the sheet group (no nested sub-sheet).
 * Both render the same option list with grouped subheadings.
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
}: DropdownFieldProps<TValue> & { open: boolean; onToggle: () => void }) {
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
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-label={
        triggerAriaLabel ?? `${label}, ${count > 0 ? `${count}개 선택됨` : '전체'}`
      }
      className="h-11 px-3 min-w-40 rounded-md bg-bg-sunken flex items-center justify-between gap-2 text-body-md text-text-primary cursor-pointer hover:bg-bg-hover"
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

function DropdownList<TValue extends string>({
  label,
  groups,
  value,
  onChange,
  placeholder,
}: Omit<DropdownFieldProps<TValue>, 'triggerAriaLabel' | 'formatSummary'>) {
  function toggle(next: TValue) {
    const current = value;
    const nextValues = current.includes(next)
      ? current.filter((v) => v !== next)
      : [...current, next];
    onChange(nextValues);
  }

  return (
    <ul
      role="listbox"
      aria-multiselectable="true"
      aria-label={label}
      className="py-2 max-h-80 overflow-y-auto"
    >
      <li>
        <button
          type="button"
          role="option"
          aria-selected={value.length === 0}
          onClick={() => onChange([])}
          className="w-full min-h-11 px-3 py-2.5 rounded-md flex items-center gap-2 text-body-md text-text-secondary hover:bg-bg-hover cursor-pointer"
        >
          {placeholder}
        </button>
      </li>
      {groups.map((group) => (
        <li key={group.label} className="mt-1">
          <p className="text-label-md text-text-tertiary px-3 py-1.5">{group.label}</p>
          <ul>
            {group.options.map((opt) => {
              const selected = value.includes(opt.value);
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => toggle(opt.value)}
                    className={[
                      'w-full min-h-11 px-3 py-2.5 rounded-md flex items-center gap-2 text-body-md cursor-pointer',
                      selected
                        ? 'text-text-primary bg-bg-hover font-medium'
                        : 'text-text-primary hover:bg-bg-hover',
                    ].join(' ')}
                  >
                    <span className="w-4 shrink-0 inline-flex items-center justify-center">
                      {selected && (
                        <Check
                          size={14}
                          aria-hidden="true"
                          className="text-brand-primary-500"
                        />
                      )}
                    </span>
                    <span>{opt.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ul>
  );
}

function FilterFieldDropdownDesktop<TValue extends string>(
  props: DropdownFieldProps<TValue>,
) {
  const [open, setOpen] = useState(false);
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
      />
      {open && (
        <div className="absolute left-0 top-full mt-1 min-w-64 bg-bg-elevated rounded-md shadow-md z-dropdown overflow-hidden">
          <DropdownList {...props} />
        </div>
      )}
    </div>
  );
}

function FilterFieldDropdownMobile<TValue extends string>(
  props: DropdownFieldProps<TValue>,
) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-label-lg text-text-secondary">{props.label}</p>
      <DropdownTrigger
        {...props}
        open={open}
        onToggle={() => setOpen((v) => !v)}
      />
      {open && (
        <div className="max-h-[60vh] overflow-y-auto rounded-md bg-bg-sunken">
          <DropdownList {...props} />
        </div>
      )}
    </div>
  );
}
