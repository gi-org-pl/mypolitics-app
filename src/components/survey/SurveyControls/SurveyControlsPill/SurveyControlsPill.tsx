import type { SurveyControlsPillProps } from "../SurveyControls.types";
import { SurveyControlsCount } from "./SurveyControlsCount/SurveyControlsCount";
import { getPillContent } from "./utils/getPillContent";
import { getPillTextClassName } from "./utils/getPillTextClassName";

// The pill between the two buttons: the label, the category or the name of
// the quiz, and the number of questions left. A text of several words wraps
// onto a second line before anything is cut - the row of a phone is narrower
// than the one the design draws, and a category is what the taker needs to
// read. The pill keeps its height; the two lines fit in it.
export const SurveyControlsPill = (props: SurveyControlsPillProps) => {
  const { text, count } = getPillContent(props);
  const hasText = text !== undefined;
  const hasCount = count !== undefined;

  if (!hasText && !hasCount) {
    return null;
  }

  return (
    <div className="flex h-12 min-w-0 items-center gap-3 overflow-hidden rounded-full bg-gi-dark-ash px-3 font-(family-name:--font-family-poppins) text-base leading-none font-bold text-gi-primary">
      {hasText && (
        <span className={`min-w-0 ${getPillTextClassName(text)}`}>{text}</span>
      )}
      {hasText && hasCount && (
        <span
          aria-hidden="true"
          data-testid="survey-controls-pill-divider"
          className="h-6 w-px shrink-0 bg-gi-primary/25"
        />
      )}
      {hasCount && <SurveyControlsCount count={count} />}
    </div>
  );
};
