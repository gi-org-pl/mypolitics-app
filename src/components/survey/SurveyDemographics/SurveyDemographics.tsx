import { useLingui } from "@lingui/react/macro";
import { useState } from "react";

import { DEMOGRAPHICS_FIELDS } from "./SurveyDemographics.constants";
import type { SurveyDemographicsProps } from "./SurveyDemographics.types";
import { SurveyDemographicsField } from "./SurveyDemographicsField/SurveyDemographicsField";
import { SurveyDemographicsHeader } from "./SurveyDemographicsHeader/SurveyDemographicsHeader";
import { SurveyDemographicsInfo } from "./SurveyDemographicsInfo/SurveyDemographicsInfo";
import { SurveyDemographicsModal } from "./SurveyDemographicsModal/SurveyDemographicsModal";
import { getNextValues } from "./utils/getNextValues";

export const SurveyDemographics = ({
  options,
  values,
  onChange,
  isDisabled = false,
}: SurveyDemographicsProps) => {
  const { t } = useLingui();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <SurveyDemographicsHeader />
      <div className="grid grid-cols-2 gap-2">
        {DEMOGRAPHICS_FIELDS.map((field) => (
          <SurveyDemographicsField
            key={field.id}
            name={t(field.name)}
            width={field.width}
            options={options[field.id]}
            value={values[field.id]}
            isDisabled={isDisabled}
            onChange={(value) =>
              onChange(getNextValues(values, field.id, value))
            }
          />
        ))}
      </div>
      <SurveyDemographicsInfo onExplain={() => setIsDialogOpen(true)} />
      <SurveyDemographicsModal
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
};
