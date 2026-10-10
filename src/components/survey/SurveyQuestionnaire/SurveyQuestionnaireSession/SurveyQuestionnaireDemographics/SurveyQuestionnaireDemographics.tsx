import { useLingui } from "@lingui/react/macro";

import { SurveyDemographics } from "@/components/survey/SurveyDemographics/SurveyDemographics";
import { SurveyPhaseActions } from "@/components/survey/SurveyPhaseActions/SurveyPhaseActions";
import type { SurveyPhaseContentProps } from "@/types/survey";
import { toResultDemographics } from "@/utils/survey/demographics/toResultDemographics";

import { useDemographicsOptions } from "./utils/useDemographicsOptions";

// The fourth phase: the four fields. "Zobacz wyniki" takes all four - by the
// very rule the session leaves the phase by - and "Pomiń" always works.
export const SurveyQuestionnaireDemographics = ({
  session: { session, setDemographics, leaveDemographics },
}: SurveyPhaseContentProps) => {
  const { t } = useLingui();
  const options = useDemographicsOptions();
  const isComplete = toResultDemographics(session.demographics) !== undefined;

  return (
    <>
      <SurveyDemographics
        options={options}
        values={session.demographics}
        onChange={setDemographics}
      />
      <SurveyPhaseActions
        primaryLabel={t`Zobacz wyniki`}
        isPrimaryDisabled={!isComplete}
        primaryDisabledReason={t`Wybierz wszystkie cztery pola albo pomiń`}
        onPrimary={() => leaveDemographics(true)}
        onSkip={() => leaveDemographics(false)}
      />
    </>
  );
};
