import type { SurveyQuestionnaireProps } from "./SurveyQuestionnaire.types";
import { SurveyQuestionnaireLoadError } from "./SurveyQuestionnaireLoadError/SurveyQuestionnaireLoadError";
import { SurveyQuestionnaireLoading } from "./SurveyQuestionnaireLoading/SurveyQuestionnaireLoading";
import { SurveyQuestionnaireSession } from "./SurveyQuestionnaireSession/SurveyQuestionnaireSession";

// The questionnaire screen: one ash card at every width, with the quiz on its
// way, the quiz that could not be read, or the session of the quiz in it.
// Another quiz is another session: nothing of the screen is carried over.
//
// The padding of the card is the design's 24 px from the width it is drawn
// at, and gives way to the content on a narrower card: it follows the width
// of the card itself, whatever the page around it does.
export const SurveyQuestionnaire = ({
  load,
  onRetry,
}: SurveyQuestionnaireProps) => (
  <div className="@container w-full">
    <div className="w-full rounded-4xl bg-gi-ash p-3 @xs:p-4 @sm:p-6">
      {load.status === "loading" && <SurveyQuestionnaireLoading />}
      {load.status === "failed" && (
        <SurveyQuestionnaireLoadError onRetry={onRetry} />
      )}
      {load.status === "ready" && (
        <SurveyQuestionnaireSession key={load.survey.id} survey={load.survey} />
      )}
    </div>
  </div>
);
