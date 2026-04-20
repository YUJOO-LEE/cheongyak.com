import { Check } from 'lucide-react';
import type { ChipFieldProps } from './filter-field.types';

/**
 * Inline chip field — desktop usage. Label and chips sit on the same row.
 *
 * Supports two modes:
 *   - `single` (default): clicking the active chip clears to null.
 *   - `multi`: clicking a chip toggles its membership in a value[] array.
 *
 * Multi-select chips prepend a `Check` icon when active to satisfy the
 * color-only status rule in DESIGN.md §9.
 */
export function FilterFieldInline<TValue extends string>(
  props: ChipFieldProps<TValue>,
) {
  const { label, options, groupAriaLabel } = props;
  const multi = props.mode === 'multi';

  function isSelected(value: TValue): boolean {
    if (multi) {
      return (props.value as ReadonlyArray<TValue>).includes(value);
    }
    return props.value === value;
  }

  function toggle(value: TValue) {
    if (multi) {
      const current = props.value as ReadonlyArray<TValue>;
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      props.onChange(next);
      return;
    }
    props.onChange(props.value === value ? null : value);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-label-lg text-text-secondary shrink-0">{label}</span>
      <div
        role="group"
        aria-label={groupAriaLabel ?? label}
        className="flex flex-wrap gap-2"
      >
        {options.map((opt) => {
          const selected = isSelected(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              aria-pressed={selected}
              aria-label={`${opt.label}, ${selected ? '선택됨' : '선택 안 됨'}`}
              className={[
                'min-h-11 px-3 rounded-full text-label-md transition-colors duration-fast cursor-pointer active:scale-95 inline-flex items-center gap-1',
                selected
                  ? 'bg-neutral-500 text-text-inverse shadow-sm'
                  : 'bg-chip-bg text-text-secondary hover:bg-chip-bg-hover',
              ].join(' ')}
            >
              {multi && selected && (
                <Check size={14} aria-hidden="true" className="shrink-0" />
              )}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
