import { useState } from "react";
import { Button } from "@gi/athena";
import { Trans } from "@lingui/react/macro";
import SurveyDemographicsContent from "./SurveyDemographicsContent/SurveyDemographicsContent";
import type { DemographicsInput } from "./SurveyDemographics.types";

export type SurveyDemographicsProps = {
  onSubmit: (data: DemographicsInput) => void;
  onSkip: () => void;
};

export const SurveyDemographics = ({ onSubmit, onSkip }: SurveyDemographicsProps) => {
  const [value, setValue] = useState<DemographicsInput>({
    age: null,
    gender: null,
    residenceAreaSize: null,
    education: null,
    region: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (control: string, val: string) => {
    setValue((prev) => ({
      ...prev,
      [control]: control === "age" ? (val === "" ? null : Number(val)) : val,
    }));
  };

  const isFormValid =
    value.age !== null &&
    value.gender !== null &&
    value.residenceAreaSize !== null &&
    value.education !== null &&
    value.region !== "";

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setIsSubmitting(true);
    try {
      await onSubmit(value);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start pt-6 px-4">

      <div className="w-full max-w-md flex flex-col gap-4">
        {/* Przechwytywanie kliknięcia w link "To znaczy?" w celu otwarcia modala */}
        <div onClick={(e) => {
          if ((e.target as HTMLElement).closest('.trigger-modal')) {
            setIsModalOpen(true);
          }
        }}>
          <SurveyDemographicsContent value={value} handleChange={handleChange} />
        </div>

        {/* Sekcja przycisków akcji */}
        <div className="flex flex-col gap-2 mt-2 px-4">
          <Button
            className="w-full h-12 rounded-full font-bold text-base bg-[#3182CE] text-white hover:bg-[#2B6CB0] disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
            disabled={!isFormValid}
            isLoading={isSubmitting}
            onClick={handleSubmit}
          >
            <Trans id="survey.demographics.submit">Zobacz wyniki</Trans>
          </Button>
          
          <button
            type="button"
            className="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors text-center bg-transparent border-none cursor-pointer"
            onClick={onSkip}
          >
            <Trans id="survey.demographics.skip">Pomiń</Trans>
          </button>
        </div>
      </div>

      {/* MODAL: Idealnie odwzorowany podgląd okna "Zakres wykorzystania danych" */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 max-w-sm w-full relative shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Przycisk zamknięcia (X) */}
            <button
              type="button"
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setIsModalOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Treść modala */}
            <h3 className="text-lg font-bold text-[#1A365D] mb-3 pr-6">
              <Trans id="survey.demographics.modal.title">Zakres wykorzystania danych</Trans>
            </h3>

            <p className="text-sm text-[#4A5568] leading-relaxed mb-1">
              <Trans id="survey.demographics.modal.body">
                Dzięki Twoim odpowiedziom w tej sekcji będziemy mogli przeanalizować Twoje wyniki w przyszłości w celu poprawienia działania quizu, a także przygotowania analiz na{" "}
                <span className="text-blue-600 underline font-medium">data.mypolitics.pl</span>.
              </Trans>
            </p>
            <p className="text-sm text-[#4A5568] font-semibold mt-3">
              <Trans id="survey.demographics.modal.footer">Twoje dane pozostaną całkowicie anonimowe.</Trans>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Podwójny eksport zapobiega błędowi "has no exported member" w plikach historii (.stories.tsx)
export default SurveyDemographics;
