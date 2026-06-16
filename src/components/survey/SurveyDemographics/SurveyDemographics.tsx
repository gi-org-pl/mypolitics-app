import { Button, Modal } from "@gi/athena";
import { useLingui } from "@lingui/react";
import { useState } from "react";
import type { DemographicsInput, SurveyDemographicsProps} from "./SurveyDemographics.types";
import SurveyDemographicsContent from "./SurveyDemographicsContent/SurveyDemographicsContent";
import { surveyDemographicsDataUsage, surveyDemographicsDataUsageAnonymity, surveyDemographicsDataUsageDescription, surveyDemographicsSkip, surveyDemographicsSubmit } from "./SurveyDemographicsContent/SurveyDemographicsContent.constants";

const SurveyDemographics = ({
  onSubmit,
  onSkip,
  isLoading = false,
  initialModalOpen = false,
  initialValues,
}: SurveyDemographicsProps) => {
  const { i18n } = useLingui();
  const [isModalOpen, setIsModalOpen] = useState(initialModalOpen);
  const [formValues, setFormValues] = useState<DemographicsInput>({
    age: null,
    gender: null,
    residenceAreaSize: null,
    education: null,
    region: "",
    ...initialValues,
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

  return (
    <div className="w-full max-w-85 mx-auto flex flex-col gap-6">
      <SurveyDemographicsContent
        value={formValues}
        handleChange={handleFieldChange}
        onLearnMoreClick={() => setIsModalOpen(true)}
      />

      <div className="flex flex-row justify-center gap-4 w-full">
        <Button
          variant="primary"
          disabled={isLoading}
          onClick={handleSubmit}
        >
          {i18n._(surveyDemographicsSubmit)}
        </Button>

        <button
          type="button"
          disabled={isLoading}
          onClick={onSkip}
          className="text-gi-primary font-medium cursor-pointer"
        >
          {i18n._(surveyDemographicsSkip)}
        </button>
      </div>

      <Modal
        title=""
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="flex flex-col gap-2">
          <p className="text-lg font-bold text-gi-primary text-left">
            {i18n._(surveyDemographicsDataUsage)}
          </p>
          <p className="text-sm text-gi-dark-gray">
            {i18n._(surveyDemographicsDataUsageDescription)}
          </p>
          <p className="text-sm text-gi-dark-gray font-bold">
            {i18n._(surveyDemographicsDataUsageAnonymity)}
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default SurveyDemographics;