import { FilterFieldInline } from './filter-field-inline';
import { FilterFieldStacked } from './filter-field-stacked';
import { FilterFieldRange } from './filter-field-range';
import { FilterFieldDropdown } from './filter-field-dropdown';
import { FilterFieldText } from './filter-field-text';

export const FilterField = {
  Inline: FilterFieldInline,
  Stacked: FilterFieldStacked,
  Range: FilterFieldRange,
  Dropdown: FilterFieldDropdown,
  Text: FilterFieldText,
};

export type {
  ChipFieldProps,
  SingleChipFieldProps,
  MultiChipFieldProps,
  RangeFieldProps,
  DropdownFieldProps,
  TextFieldProps,
  FilterFieldOption,
} from './filter-field.types';
