import { Button, Modal } from "@gi/athena";
import { Trans } from "@lingui/react/macro";
import { useState } from "react";
import type {
  DemographicsInput,
  SurveyDemographicsProps,
} from "./SurveyDemographics.types";
import SurveyDemographicsContent from "./SurveyDemographicsContent/SurveyDemographicsContent";

const SurveyDemographics = ({
  onSubmit,
  onSkip,
  isLoading = false,
}: SurveyDemographicsProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<DemographicsInput>({
    age: null,
    gender: null,
    residenceAreaSize: null,
    education: null,
    region: "",
  });

  const handleFieldChange = (control: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [control]: value === "" && control !== "region" ? null : value,
    }));
  };

  const handleSubmit = () => {
    onSubmit(formValues);
  };

  const isFormValid =
    formValues.age !== null &&
    formValues.gender !== null &&
    formValues.residenceAreaSize !== null &&
    formValues.education !== null;

  return (
    <div className="w-full max-w-[343px] mx-auto flex flex-col gap-6">
      <SurveyDemographicsContent
        value={formValues}
        handleChange={handleFieldChange}
        onLearnMoreClick={() => setIsModalOpen(true)}
      />

      <div className="flex flex-col gap-3 w-full mt-4">
        <Button
          variant="primary"
          disabled={!isFormValid || isLoading}
          onClick={handleSubmit}
          className="w-full"
        >
          <Trans id="survey.demographics.submit">Zobacz wyniki</Trans>
        </Button>

        <Button
          variant="primary"
          disabled={isLoading}
          onClick={onSkip}
          className="w-full"
        >
          <Trans id="survey.demographics.skip">Pomiń</Trans>
        </Button>
      </div>

      <Modal
        title=""
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="p-6">
          <h3 className="text-lg font-bold text-[#0F3752] mb-3">
            <Trans id="survey.demographics.modal.title">
              Zakres wykorzystania danych
            </Trans>
          </h3>
          <p className="text-sm text-[#2D4A5E] leading-relaxed">
            <Trans id="survey.demographics.modal.description">
              Twoje dane są w pełni bezpieczne i anonimowe. Wykorzystujemy je
              wyłącznie do tworzenia zbiorczych statystyk, dzięki którym dowiesz
              się, jak Twoje poglądy wypadają na tle innych grup
              demograficznych.
            </Trans>
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default SurveyDemographics;
