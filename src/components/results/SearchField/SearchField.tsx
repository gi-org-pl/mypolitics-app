import { Input } from "@gi-org-pl/athena";

import searchIcon from "@/assets/icons/search.svg";

import { SEARCH_FIELD_CLASS_NAME } from "./SearchField.constants";
import type { SearchFieldProps } from "./SearchField.types";

// A field that narrows a list as its text changes: a pill with a magnifier
// and the text. It holds no text of its own and searches nothing: whoever
// draws the list keeps the text and decides what it narrows.
//
// The design draws no label beside the field, so its label is its accessible
// name, and stands in the field while it is empty.
export const SearchField = ({ label, value, onChange }: SearchFieldProps) => (
  <Input
    role="searchbox"
    autoComplete="off"
    aria-label={label}
    placeholder={label}
    value={value}
    LeftIcon={<img src={searchIcon} alt="" />}
    className={SEARCH_FIELD_CLASS_NAME}
    onChange={onChange}
  />
);
