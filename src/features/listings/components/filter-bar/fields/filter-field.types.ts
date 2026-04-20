export interface FilterFieldOption<TValue extends string = string> {
  value: TValue;
  label: string;
}

export interface ChipFieldProps<TValue extends string = string> {
  label: string;
  options: ReadonlyArray<FilterFieldOption<TValue>>;
  value: TValue | null;
  onChange: (next: TValue | null) => void;
  /**
   * Override the group's aria-label when the field's visible label is too
   * terse for assistive tech (e.g. "상태" → "청약 상태 필터"). Falls back to
   * `label` when omitted.
   */
  groupAriaLabel?: string;
}

export interface RangeFieldProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: [number, number] | null;
  onChange: (next: [number, number] | null) => void;
  formatValue?: (value: number) => string;
}
