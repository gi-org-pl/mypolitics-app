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
    <div className="w-full max-w-85 mx-auto flex flex-col gap-6">
      <SurveyDemographicsContent
        value={formValues}
        handleChange={handleFieldChange}
        onLearnMoreClick={() => setIsModalOpen(true)}
      />

      <div className="flex flex-col gap-3 w-full">
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
        <div className="flex flex-col gap-2">
          <p className="text-lg font-bold text-gi-primary text-left">
            <Trans>Zakres wykorzystania danych</Trans>
          </p>
          <p className="text-sm text-gi-dark-gray">
            <Trans>
              Dzięki Twoim odpowiedziom w tej sekcji będziemy mogli
              przeanalizować Twoje wyniki w przyszłości w celu poprawienia
              działania quizu, a także przygotowania analiz na
              data.mypolitics.pl.
            </Trans>
          </p>
          <p className="text-sm text-gi-dark-gray font-bold">
            <Trans>Twoje dane pozostaną całkowicie anonimowe.</Trans>
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default SurveyDemographics;
