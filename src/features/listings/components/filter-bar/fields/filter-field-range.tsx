import type { RangeFieldProps } from './filter-field.types';

/**
 * Range field — placeholder for Phase 6's price/size slider. Ships a minimal
 * dual `<input type="range">` as a semantic baseline; the polished design
 * (track fill, tooltips, editorial-style value display) lands when the
 * corresponding API parameter arrives.
 */
export function FilterFieldRange({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  formatValue = (v) => String(v),
}: RangeFieldProps) {
  const [low, high] = value ?? [min, max];

  function updateLow(next: number) {
    const clamped = Math.min(next, high);
    onChange([clamped, high]);
  }

  function updateHigh(next: number) {
    const clamped = Math.max(next, low);
    onChange([low, clamped]);
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-label-lg text-text-secondary">{label}</span>
        <span className="text-label-md text-text-primary">
          {formatValue(low)} – {formatValue(high)}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={(e) => updateLow(Number(e.target.value))}
          aria-label={`${label} 최소값`}
          className="w-full cursor-pointer"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={(e) => updateHigh(Number(e.target.value))}
          aria-label={`${label} 최대값`}
          className="w-full cursor-pointer"
        />
      </div>
    </div>
  );
}
