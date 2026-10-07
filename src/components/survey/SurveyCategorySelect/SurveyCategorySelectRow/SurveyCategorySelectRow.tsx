import { SurveyAnswer } from "@/components/survey/SurveyAnswer/SurveyAnswer";
import type { SurveyCategorySelectRowProps } from "./SurveyCategorySelectRow.types";
import { getRowFadeStyle } from "./utils/getRowFadeStyle";

export const SurveyCategorySelectRow = ({
  name,
  index,
  isSelected,
  isDisabled,
  onToggle,
}: SurveyCategorySelectRowProps) => (
  <li
    className="w-full transition-opacity ease-out motion-reduce:transition-none starting:opacity-0"
    style={getRowFadeStyle(index)}
  >
    <SurveyAnswer
      type="custom-selectable"
      title={name}
      isSelected={isSelected}
      isDisabled={isDisabled}
      onClick={onToggle}
    />
  </li>
);
