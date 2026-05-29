import { Trans } from "@lingui/react/macro";
import { Select } from "@gi/athena";
import { demographicsData } from "./SurveyDemographicsContent.constants";
import type { DemographicsInput } from "../SurveyDemographics.types";

export type SurveyDemographicsContentProps = {
  value: DemographicsInput;
  handleChange: (control: string, value: string) => void;
};

const SurveyDemographicsContent = ({
  value,
  handleChange,
}: SurveyDemographicsContentProps) => {
  return (
    <div className="w-full flex flex-col gap-4 max-w-[350px] mx-auto p-4 bg-white rounded-3xl">
      
      {/* Górna karta informacyjna */}
      <div className="bg-[#D5DEE2] rounded-[24px] p-5 shadow-sm flex flex-col gap-3">
        <div className="flex justify-between items-center w-16 ">
          <h2 className="text-2xl font-bold text-[#2d565e] tracking-tight">
            <Trans id="survey.demographics.title">Twoja tożsamość</Trans>
          </h2>
          
          {/* Dwa nachodzące na siebie div-y z awatarami */}
          <div className="flex items-center flex-shrink-0 isolate pl-14">
            {/* Lewy awatar (Mężczyzna) */}
            <div className="w-16 h-16 rounded-full bg-white shadow-sm border-2 border-white overflow-hidden z-10 flex items-center justify-center">
              <img src="/src/assets/icons/social-patriot.svg" alt="Mężczyzna" />
            </div>
            {/* Prawy awatar (Kobieta) */}
            <div className="w-16 h-16 rounded-full bg-white shadow-sm border-2 border-white overflow-hidden z-20 -ml-4 flex items-center justify-center">
              <img src="/src/assets/icons/national-egalitarian.svg" alt="Kobieta"/>
            </div>
          </div>
        </div>

        {/* Linia oddzielająca */}
        <div className="border-b border-[#BCCAD1] w-full" />

        {/* Podtytuł */}
        <p className="text-base font-medium leading-snug text-[#2d565e]">
          <Trans id="survey.demographics.subtitle">
            W tym teście otrzymasz dostosowaną pod siebie kartę tożsamości
          </Trans>
        </p>
      </div>

      {/* Siatka pól wyboru */}
      <div className="flex flex-col gap-3 w-full">
        
        {/* PIERWSZY WIERSZ: Wiek i Płeć — równo 50% / 50% */}
        
        <div className="grid grid-cols-2 gap-3 w-full">
          {demographicsData
            .filter((f) => f.control === "age" || f.control === "gender")
            .map((field) => {
              const currentValue = value[field.control as keyof DemographicsInput];
              return (
                
                <div key={field.control} className="min-w-0 w-full">
                  <Select
                    id={field.control}
                    placeholder={field.labelKey} // ← dodaj ten prop
                    className="w-38.5 box-border h-13 bg-white border border-[#CBD5E0] rounded-full px-5 text-[#0f3752] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    value={currentValue !== null ? String(currentValue) : ""}
                    onChange={(e: any) => {
                      const val = e?.target?.value ?? String(e);
                      handleChange(field.control, val);
                    }}
                  >
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        <Trans id={option.labelKey}>{option.labelKey}</Trans>
                      </option>
                    ))}
                  </Select>
                </div>
              );
            })}
        </div>

        {/* POZOSTAŁE WIERSZE: Pełna szerokość */}
        {demographicsData
          .filter((f) => f.control !== "age" && f.control !== "gender")
          .map((field) => {
            const currentValue = value[field.control as keyof DemographicsInput];
            return (
              <div key={field.control} className="w-full">
                <Select
                  id={field.control}
                  placeholder={field.labelKey} // ← dodaj ten prop
                  className="w-80 h-13 bg-white border border-[#CBD5E0] rounded-full px-5 text-[#0f3752] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                  value={currentValue !== null ? String(currentValue) : ""}
                  onChange={(e: any) => {
                    const val = e?.target?.value ?? String(e);
                    handleChange(field.control, val);
                  }}
                >
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      <Trans id={option.labelKey}>{option.labelKey}</Trans>
                    </option>
                  ))}
                </Select>
              </div>
            );
          })}
      </div>

      {/* Dolna belka informacyjna */}
      <div className="bg-[#EDF2F7] rounded-[24px] p-4 text-center">
        <p className="text-base text-[#2d565e] font-medium leading-relaxed">
          <Trans id="survey.demographics.footer">
            Powyższe dane w przyszłości pozwolą Ci porównać się z innymi!{" "}
          </Trans>
          <span className="underline cursor-pointer text-[#2B6CB0] font-semibold hover:text-[#2C5282] trigger-modal">
            <Trans id="survey.demographics.learn_more">To znaczy?</Trans>
          </span>
        </p>
      </div>
    </div>
  );
};

export default SurveyDemographicsContent;
