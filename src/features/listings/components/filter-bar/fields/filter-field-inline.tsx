import type { ChipFieldProps } from './filter-field.types';

/**
 * Inline chip field — desktop usage. Label and chips sit on the same row.
 * Single-select with toggle-off semantics: clicking an active chip returns
 * to null.
 */
export function FilterFieldInline<TValue extends string>({
  label,
  options,
  value,
  onChange,
  groupAriaLabel,
}: ChipFieldProps<TValue>) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-label-lg text-text-secondary shrink-0">{label}</span>
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
                'min-h-11 px-3 rounded-full text-label-md transition-colors duration-fast cursor-pointer active:scale-95 inline-flex items-center',
                selected
                  ? 'bg-neutral-500 text-text-inverse shadow-sm'
                  : 'bg-chip-bg text-text-secondary hover:bg-chip-bg-hover',
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
