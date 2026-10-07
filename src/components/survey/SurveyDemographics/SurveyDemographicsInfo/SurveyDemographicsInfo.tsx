import { Trans } from "@lingui/react/macro";

import type { SurveyDemographicsInfoProps } from "./SurveyDemographicsInfo.types";

export const SurveyDemographicsInfo = ({
  onExplain,
}: SurveyDemographicsInfoProps) => (
  <p className="rounded-2xl bg-gi-dark-ash p-4 font-(family-name:--font-family-poppins) text-base leading-[19px] wrap-break-word text-gi-primary">
    <Trans>Powyższe dane w przyszłości pozwolą Ci porównać się z innymi!</Trans>{" "}
    <button
      type="button"
      aria-haspopup="dialog"
      className="cursor-pointer underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gi-primary"
      onClick={onExplain}
    >
      <Trans>To znaczy?</Trans>
    </button>
  </p>
);
