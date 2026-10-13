import { useDocumentTitle } from "@/utils/dom/useDocumentTitle";

import {
  type ResultsScreenProps,
  ResultsScreenStatus,
} from "./ResultsScreen.types";
import { ResultsScreenContent } from "./ResultsScreenContent/ResultsScreenContent";
import { ResultsScreenNotice } from "./ResultsScreenNotice/ResultsScreenNotice";
import { getQuizName } from "./utils/getQuizName";
import { useResultsScreenState } from "./utils/useResultsScreenState";

// The screen a result is read on. It reads the result and its quiz itself,
// and only chooses what stands for the state that reading is in: the result,
// or the notice of a state that has none to show. The document is titled
// with the name of the quiz once the quiz is read. Another result is another
// screen: nothing of the one before is carried over.
export const ResultsScreen = ({ resultId }: ResultsScreenProps) => {
  const { state, retry } = useResultsScreenState(resultId);

  useDocumentTitle(getQuizName(state));

  return state.status === ResultsScreenStatus.Ready ? (
    <ResultsScreenContent
      key={state.result.id}
      survey={state.survey}
      result={state.result}
      resolved={state.resolved}
    />
  ) : (
    <ResultsScreenNotice status={state.status} onRetry={retry} />
  );
};
