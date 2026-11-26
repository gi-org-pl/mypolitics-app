import { useFocusOnChange } from "@/utils/dom/useFocusOnChange";

import { AgreementBar } from "./AgreementBar/AgreementBar";
import { ComparisonModeSelector } from "./ComparisonModeSelector/ComparisonModeSelector";
import { ComparisonViews } from "./ComparisonViews/ComparisonViews";
import {
  ComparisonStatus,
  type ResultsComparisonProps,
} from "./ResultsComparison.types";
import { useResultsComparison } from "./utils/useResultsComparison";

// The content of the comparison tab: the result of the taker held up against
// a friend's, or against an orientation of the quiz.
//
// While no comparison runs it is the mode selector. While one runs it is the
// agreement bar - who the other side is, how much the two agree, the way
// out - and under it the views of that comparison. Which of the two is drawn
// follows from the state alone, and the state lives in one hook. Nothing
// about the other side is stored: it lasts as long as the open page.
//
// When one takes the place of the other, the control that had the focus is
// gone, so the focus is moved to the new content.
export const ResultsComparison = ({
  survey,
  result,
  resolved,
}: ResultsComparisonProps) => {
  const {
    state,
    orientations,
    chooseMode,
    enterFriendId,
    pickOrientation,
    chooseView,
    end,
  } = useResultsComparison({ survey, result, resolved });
  const isComparing = state.status === ComparisonStatus.Comparing;
  const content = useFocusOnChange<HTMLDivElement>(isComparing);

  return (
    <div
      ref={content}
      tabIndex={-1}
      className="flex w-full min-w-0 flex-col gap-4 outline-none @[44rem]:gap-6"
    >
      {state.status === ComparisonStatus.Comparing ? (
        <>
          <AgreementBar
            other={state.other.orientation}
            score={state.score}
            onEnd={end}
          />
          <ComparisonViews
            survey={survey}
            result={result}
            resolved={resolved}
            comparison={state}
            onViewChange={chooseView}
          />
        </>
      ) : (
        <ComparisonModeSelector
          state={state}
          resultId={result.id}
          orientations={orientations}
          onModeChange={chooseMode}
          onFriendIdChange={enterFriendId}
          onOrientationPick={pickOrientation}
        />
      )}
    </div>
  );
};
