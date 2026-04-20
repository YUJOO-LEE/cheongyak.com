import { Check } from 'lucide-react';
import type { ChipFieldProps } from './filter-field.types';

/**
 * Stacked chip field — mobile sheet usage. Label sits above a wrapping row
 * of larger chips.
 *
 * Supports the same `single` / `multi` modes as FilterFieldInline, with a
 * larger tap surface appropriate for the bottom sheet.
 */
export function FilterFieldStacked<TValue extends string>(
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
    <div>
      <p className="text-label-lg text-text-secondary mb-2">{label}</p>
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
                'min-h-11 px-4 rounded-full text-label-lg transition-colors cursor-pointer active:scale-95 inline-flex items-center gap-1',
                selected
                  ? 'bg-neutral-500 text-text-inverse shadow-sm'
                  : 'bg-neutral-200 text-text-secondary',
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
