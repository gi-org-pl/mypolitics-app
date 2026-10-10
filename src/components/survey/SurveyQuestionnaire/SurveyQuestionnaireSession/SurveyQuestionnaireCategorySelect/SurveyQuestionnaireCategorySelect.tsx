import { useLingui } from "@lingui/react/macro";

import { SurveyCategorySelect } from "@/components/survey/SurveyCategorySelect/SurveyCategorySelect";
import { SurveyPhaseActions } from "@/components/survey/SurveyPhaseActions/SurveyPhaseActions";
import type { SurveyPhaseContentProps } from "@/types/survey";
import { getCategoryLimit } from "@/utils/survey/categories/getCategoryLimit";
import { getVisibleCategories } from "@/utils/survey/categories/getVisibleCategories";

// The first phase: the categories that matter most to the taker. Picking them
// prioritises and cuts nothing, and no line on screen says otherwise.
export const SurveyQuestionnaireCategorySelect = ({
  survey,
  session: { session, setCategories, confirmCategories, skipCategories },
}: SurveyPhaseContentProps) => {
  const { t } = useLingui();

  return (
    <>
      <SurveyCategorySelect
        categories={getVisibleCategories(survey)}
        selectedIds={session.prioritizedCategoryIds}
        maxSelection={getCategoryLimit(survey)}
        onChange={setCategories}
      />
      <SurveyPhaseActions
        primaryLabel={t`Idziemy dalej`}
        isPrimaryDisabled={session.prioritizedCategoryIds.length === 0}
        onPrimary={confirmCategories}
        onSkip={skipCategories}
      />
    </>
  );
};
