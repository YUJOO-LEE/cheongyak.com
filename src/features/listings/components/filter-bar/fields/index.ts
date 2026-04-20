import { FilterFieldInline } from './filter-field-inline';
import { FilterFieldStacked } from './filter-field-stacked';
import { FilterFieldDropdown } from './filter-field-dropdown';

export const FilterField = {
  Inline: FilterFieldInline,
  Stacked: FilterFieldStacked,
  Dropdown: FilterFieldDropdown,
};

export type {
  ChipFieldProps,
  SingleChipFieldProps,
  MultiChipFieldProps,
  DropdownFieldProps,
  FilterFieldOption,
} from './filter-field.types';
