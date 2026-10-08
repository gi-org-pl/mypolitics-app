import { toSingleLine } from "@/utils/text/toSingleLine";

import {
  ROW_CLASS_NAME,
  ROW_IMAGE_CLASS_NAME,
} from "./SurveyCheckpointOptionsRow.constants";
import type { SurveyCheckpointOptionsRowProps } from "./SurveyCheckpointOptionsRow.types";
import { getRowImageStyle } from "./utils/getRowImageStyle";

// One option of a puzzle: a button with the image of an orientation on its
// colour, then its name. The name is the whole name of the button - the image
// is decoration and is hidden from assistive technology. A long name wraps
// and is never cut.
//
// The image is the background of the coloured disc and not an element of its
// own: while it loads, and when it does not load at all, the disc shows the
// colour alone, which is what a row without an image shows.
export const SurveyCheckpointOptionsRow = ({
  orientation,
  onSelect,
}: SurveyCheckpointOptionsRowProps) => (
  <button
    type="button"
    className={ROW_CLASS_NAME}
    onClick={() => onSelect(orientation)}
  >
    <span
      aria-hidden="true"
      data-testid="survey-checkpoint-options-image"
      className={ROW_IMAGE_CLASS_NAME}
      style={getRowImageStyle(orientation)}
    />
    <span className="min-w-0 grow wrap-break-word">
      {toSingleLine(orientation.name)}
    </span>
  </button>
);
