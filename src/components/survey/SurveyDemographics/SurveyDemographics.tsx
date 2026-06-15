import { Button, Modal } from "@gi/athena";
import { useState } from "react";
import type {
  DemographicsInput,
  SurveyDemographicsProps,
} from "./SurveyDemographics.types";
import SurveyDemographicsContent from "./SurveyDemographicsContent/SurveyDemographicsContent";
import { surveyDemographicsSubmit, surveyDemographicsSkip, surveyDemographicsDataUsage, surveyDemographicsDataUsageDescription, surveyDemographicsDataUsageAnonymity } from "./SurveyDemographicsContent/SurveyDemographicsContent.constants";
import { useLingui } from "@lingui/react";

const SurveyDemographics = ({
  onSubmit,
  onSkip,
  isLoading = false,
}: SurveyDemographicsProps) => {
  const { i18n } = useLingui();
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
          {i18n._(surveyDemographicsSubmit)}
        </Button>

        <Button
          variant="primary"
          disabled={isLoading}
          onClick={onSkip}
          className="w-full"
        >
          {i18n._(surveyDemographicsSkip)}
        </Button>
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
