import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import type { DemographicsInput } from "../SurveyDemographics.types";
import SurveyDemographicsContent from "./SurveyDemographicsContent";

i18n.load("pl", {});
i18n.activate("pl");

const meta: Meta<typeof SurveyDemographicsContent> = {
  title: "Survey/SurveyDemographicsContent",
  component: SurveyDemographicsContent,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <I18nProvider i18n={i18n}>
        <Story />
      </I18nProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SurveyDemographicsContent>;

export const Default: Story = {
  name: "Default",
  render: () => {
    const [value, setValue] = useState<DemographicsInput>({
      age: null,
      gender: null,
      residenceAreaSize: null,
      education: null,
      region: "",
    });

    return (
      <SurveyDemographicsContent
        value={value}
        handleChange={(control, val) => {
          setValue((prev) => ({
            ...prev,
            [control]: val === "" ? null : val,
          }));
        }}
        onLearnMoreClick={() => alert("Otwarto modal informacyjny!")}
      />
    );
  },
};
