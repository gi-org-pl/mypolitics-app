import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
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

const createRender = (initialValue: DemographicsInput) => () => {
  const [value, setValue] = useState<DemographicsInput>(initialValue);

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
};

export const Default: Story = {
  name: "Default",
  render: createRender({
    age: null,
    gender: null,
    residenceAreaSize: null,
    education: null,
    region: "",
  }),
};

export const PartiallyFilled: Story = {
  name: "Partially Filled",
  render: createRender({
    age: "25",
    gender: "female",
    residenceAreaSize: null,
    education: null,
    region: "",
  }),
};

export const AllFieldsFilled: Story = {
  name: "All Fields Filled",
  render: createRender({
    age: "25",
    gender: "female",
    residenceAreaSize: "city_medium",
    education: "higher",
    region: "mazowieckie",
  }),
};