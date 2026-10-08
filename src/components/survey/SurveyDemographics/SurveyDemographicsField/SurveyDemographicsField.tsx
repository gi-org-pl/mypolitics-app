import { ActionList, Select } from "@gi-org-pl/athena";
import { useId } from "react";

import {
  FIELD_CLASS_NAME,
  FIELD_WIDTH_CLASS_NAME,
} from "./SurveyDemographicsField.constants";
import type { SurveyDemographicsFieldProps } from "./SurveyDemographicsField.types";
import { getOptionItems } from "./utils/getOptionItems";
import { getSelectedOption } from "./utils/getSelectedOption";

export const SurveyDemographicsField = ({
  name,
  width,
  options,
  value,
  isDisabled = false,
  onChange,
}: SurveyDemographicsFieldProps) => {
  const valueId = useId();

  const selectedOption = getSelectedOption(options, value);
  const isBlocked = isDisabled || options.length === 0;

  return (
    <div className={`flex min-w-0 flex-col ${FIELD_WIDTH_CLASS_NAME[width]}`}>
      <Select
        aria-label={name}
        aria-describedby={selectedOption ? valueId : undefined}
        aria-disabled={isBlocked}
        placeholder={name}
        value={
          selectedOption && <span id={valueId}>{selectedOption.label}</span>
        }
        isDisabled={isBlocked}
        className={FIELD_CLASS_NAME}
      >
        <ActionList items={getOptionItems(options, onChange)} />
      </Select>
    </div>
  );
};
