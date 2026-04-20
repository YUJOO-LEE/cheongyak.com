export interface FilterFieldOption<TValue extends string = string> {
  value: TValue;
  label: string;
}

interface ChipFieldBaseProps<TValue extends string = string> {
  label: string;
  options: ReadonlyArray<FilterFieldOption<TValue>>;
  /**
   * Override the group's aria-label when the field's visible label is too
   * terse for assistive tech (e.g. "상태" → "청약 상태 필터"). Falls back to
   * `label` when omitted.
   */
  groupAriaLabel?: string;
}

export interface SingleChipFieldProps<TValue extends string = string>
  extends ChipFieldBaseProps<TValue> {
  mode?: 'single';
  value: TValue | null;
  onChange: (next: TValue | null) => void;
}

export interface MultiChipFieldProps<TValue extends string = string>
  extends ChipFieldBaseProps<TValue> {
  mode: 'multi';
  value: ReadonlyArray<TValue>;
  onChange: (next: TValue[]) => void;
}

export type ChipFieldProps<TValue extends string = string> =
  | SingleChipFieldProps<TValue>
  | MultiChipFieldProps<TValue>;

export interface DropdownFieldProps<TValue extends string = string> {
  label: string;
  groups: ReadonlyArray<{
    label: string;
    options: ReadonlyArray<FilterFieldOption<TValue>>;
  }>;
  value: ReadonlyArray<TValue>;
  onChange: (next: TValue[]) => void;
  /**
   * Visible trigger label when no option is selected (e.g. "지역 전체").
   */
  placeholder: string;
  /**
   * Build the summary shown on the trigger when ≥1 value is selected.
   * Defaults to the spec §3.2 pattern: "서울", "서울, 경기", "서울 외 +2".
   */
  formatSummary?: (labels: string[]) => string;
  /**
   * `aria-label` for the trigger button. Falls back to `label`.
   */
  triggerAriaLabel?: string;
}

