import { ActionList, Select } from "@gi/athena";
import { I18nProvider, useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import type { DemographicsInput } from "../SurveyDemographics.types";
import { demographicsData } from "./SurveyDemographicsContent.constants";

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
          className="w-full h-12 bg-white border border-[#CBD5E0] rounded-full px-5 text-[#0f3752] font-semibold text-sm"
        >
          <ActionList
            items={field.options.map((option) => ({
              label: i18n._(option.labelKey),
              onClick: () => handleChange(field.control, option.value),
            }))}
          />
        </Select>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="bg-[#D5DEE2] rounded-[24px] p-5 shadow-sm flex flex-col gap-3">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-2xl font-bold text-[#2d565e] tracking-tight">
            <I18nProvider i18n={i18n}>
              <Trans id="survey.demographics.title">Twoja tożsamość</Trans>
            </I18nProvider>
          </h2>
          <div className="flex items-center shrink-0 isolate pl-2">
            <div className="w-16 h-16 rounded-full bg-white shadow-sm border-2 border-white overflow-hidden z-10 flex items-center justify-center">
              <img src="/src/assets/icons/social-patriot.svg" alt="Mężczyzna" />
            </div>
            <div className="w-16 h-16 rounded-full bg-white shadow-sm border-2 border-white overflow-hidden z-20 -ml-4 flex items-center justify-center">
              <img
                src="/src/assets/icons/national-egalitarian.svg"
                alt="Kobieta"
              />
            </div>
          </div>
        </div>
        <div className="border-b border-[#BCCAD1] w-full" />
        <p className="text-base font-medium leading-snug text-[#2d565e]">
          <I18nProvider i18n={i18n}>
            <Trans id="survey.demographics.subtitle">
              W tym teście otrzymasz dostosowaną pod siebie kartę tożsamości
            </Trans>
          </I18nProvider>
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <div className="grid grid-cols-2 gap-3 w-full">
          {demographicsData
            .filter((f) => f.control === "age" || f.control === "gender")
            .map((field) => renderField(field, "min-w-0 w-full"))}
        </div>

        {demographicsData
          .filter((f) => f.control !== "age" && f.control !== "gender")
          .map((field) => renderField(field, "w-full"))}
      </div>

      <div className="bg-[#EDF2F7] rounded-[24px] p-4 text-center">
        <p className="text-base text-[#2d565e] font-medium leading-relaxed">
          <I18nProvider i18n={i18n}>
            <Trans id="survey.demographics.footer">
              Powyższe dane w przyszłości pozwolą Ci porównać się z innymi!{" "}
            </Trans>
          </I18nProvider>
          <button
            type="button"
            className="underline cursor-pointer text-[#2B6CB0] font-semibold hover:text-[#2C5282]"
            onClick={onLearnMoreClick}
          >
            <I18nProvider i18n={i18n}>
              <Trans id="survey.demographics.learn_more">To znaczy?</Trans>
            </I18nProvider>
          </button>
        </p>
      </div>
    </div>
  );
};

export default SurveyDemographicsContent;
