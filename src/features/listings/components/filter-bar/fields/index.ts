import { FilterFieldInline } from './filter-field-inline';
import { FilterFieldStacked } from './filter-field-stacked';
import { FilterFieldRange } from './filter-field-range';

export const FilterField = {
  Inline: FilterFieldInline,
  Stacked: FilterFieldStacked,
  Range: FilterFieldRange,
};

export type {
  ChipFieldProps,
  RangeFieldProps,
  FilterFieldOption,
} from './filter-field.types';
