import { useLingui } from "@lingui/react/macro";

import { SurveyCategorySelect } from "@/components/survey/SurveyCategorySelect/SurveyCategorySelect";
import { SurveyPhaseActions } from "@/components/survey/SurveyPhaseActions/SurveyPhaseActions";
import type { SurveyPhaseContentProps } from "@/types/survey";
import { getTopicLimit } from "@/utils/survey/getTopicLimit";
import { getVisibleCategories } from "@/utils/survey/getVisibleCategories";

// The first phase: the topics that matter most to the taker. Picking them
// prioritises and cuts nothing, and no line on screen says otherwise.
export const SurveyQuestionnaireCategorySelect = ({
  survey,
  session: { session, setTopics, confirmTopics, skipTopics },
}: SurveyPhaseContentProps) => {
  const { t } = useLingui();

  return (
    <>
      <SurveyCategorySelect
        categories={getVisibleCategories(survey)}
        selectedIds={session.topicIds}
        maxSelection={getTopicLimit(survey)}
        onChange={setTopics}
      />
      <SurveyPhaseActions
        primaryLabel={t`Idziemy dalej`}
        isPrimaryDisabled={session.topicIds.length === 0}
        onPrimary={confirmTopics}
        onSkip={skipTopics}
      />
    </>
  );
};
