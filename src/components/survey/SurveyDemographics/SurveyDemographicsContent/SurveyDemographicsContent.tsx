import { ActionList, Select } from "@gi/athena";
import { useLingui } from "@lingui/react";
import type { DemographicsInput } from "../SurveyDemographics.types";
import { demographicsData, surveyDemographicsSubtitle, surveyDemographicsTitle, surveyDemographicsFooter, surveyDemographicsLearnMore } from "./SurveyDemographicsContent.constants";

export type SurveyDemographicsContentProps = {
  value: DemographicsInput;
  handleChange: (control: string, value: string) => void;
  onLearnMoreClick: () => void;
};

const SurveyDemographicsContent = ({
  value,
  handleChange,
  onLearnMoreClick,
}: SurveyDemographicsContentProps) => {
  const { i18n } = useLingui();

  const renderField = (
    field: (typeof demographicsData)[number],
    wrapperClassName: string,
  ) => {
    const currentValue = value[field.control as keyof DemographicsInput];
    const selectedOption = field.options.find(
      (opt) => opt.value === currentValue,
    );
    const labelText = i18n._(field.labelKey);

    return (
      <div key={field.control} className={`${wrapperClassName} grid`}>
        <Select
          id={field.control}
          aria-label={labelText}
          placeholder={
            selectedOption ? i18n._(selectedOption.labelKey) : labelText
          }
          className="w-full h-13 bg-white border border-gi-dark-ash rounded-full px-5 text-gi-primary font-semibold "
        >
          <div className="**:text-base">
            <ActionList
              items={field.options.map((option) => ({
                label: i18n._(option.labelKey),
                onClick: () => handleChange(field.control, option.value),
              }))}
            />
          </div>
        </Select>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="bg-gi-ash rounded-2xl p-4 shadow-sm flex flex-col gap-2.5">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-2xl font-bold text-gi-primary tracking-tight">
            {i18n._(surveyDemographicsTitle)}
          </h2>
          <div className="flex items-center shrink-0 isolate pl-2">
            <div className="w-16 h-16 rounded-full bg-background shadow-sm overflow-hidden z-10 flex items-center justify-center">
              <img src="/src/assets/icons/social-patriot.svg" alt="Mężczyzna" />
            </div>
            <div className="w-16 h-16 rounded-full bg-background shadow-sm overflow-hidden z-20 -ml-6 flex items-center justify-center">
              <img src="/src/assets/icons/national-egalitarian.svg" alt="Kobieta"/>
            </div>
          </div>
        </div>
        <div className="border-b border-gi-dark-ash w-full" />
        <p className="text-base font-medium leading-snug text-gi-primary">
          {i18n._(surveyDemographicsSubtitle)}
        </p>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <div className="grid grid-cols-2 gap-2 w-full">
          {demographicsData
            .filter((f) => f.control === "age" || f.control === "gender")
            .map((field) => renderField(field, "min-w-0 w-full"))}
        </div>

        {demographicsData
          .filter((f) => f.control !== "age" && f.control !== "gender")
          .map((field) => renderField(field, "w-full"))}
      </div>

      <div className="bg-gi-ash rounded-2xl p-4 text-left">
        <p className="text-base text-gi-primary font-medium leading-none">
          {i18n._(surveyDemographicsFooter)}
          <button
            type="button"
            className="underline cursor-pointer text-gi-secondary text-base hover:text-gi-secondary-hover"
            onClick={onLearnMoreClick}
          >
            {i18n._(surveyDemographicsLearnMore)}
          </button>
        </p>
      </div>
    </div>
  );
};

export default SurveyDemographicsContent;
