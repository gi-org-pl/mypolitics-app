import { DEFAULT_MAX_SELECTION } from "../SurveyCategorySelect.constants";

export const getMaxSelection = (maxSelection?: number): number =>
  typeof maxSelection === "number" &&
  Number.isInteger(maxSelection) &&
  maxSelection >= 1
    ? maxSelection
    : DEFAULT_MAX_SELECTION;
