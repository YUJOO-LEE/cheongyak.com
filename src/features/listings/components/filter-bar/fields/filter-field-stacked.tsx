import type { ChipFieldProps } from './filter-field.types';

/**
 * Stacked chip field — mobile sheet usage. Label sits above a wrapping row
 * of larger chips. Same toggle-off semantics as inline.
 */
export function FilterFieldStacked<TValue extends string>({
  label,
  options,
  value,
  onChange,
  groupAriaLabel,
}: ChipFieldProps<TValue>) {
  return (
    <div>
      <p className="text-label-lg text-text-secondary mb-2">{label}</p>
      <div
        role="group"
        aria-label={groupAriaLabel ?? label}
        className="flex flex-wrap gap-2"
      >
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(selected ? null : opt.value)}
              aria-pressed={selected}
              aria-label={`${opt.label}, ${selected ? '선택됨' : '선택 안 됨'}`}
              className={[
                'min-h-11 px-4 rounded-full text-label-lg transition-colors cursor-pointer active:scale-95 inline-flex items-center',
                selected
                  ? 'bg-neutral-500 text-text-inverse shadow-sm'
                  : 'bg-neutral-200 text-text-secondary',
              ].join(' ')}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
