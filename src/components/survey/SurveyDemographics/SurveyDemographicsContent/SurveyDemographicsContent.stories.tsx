import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import type { DemographicsInput } from "../SurveyDemographics.types";
import SurveyDemographicsContent from "./SurveyDemographicsContent";

const meta: Meta<typeof SurveyDemographicsContent> = {
  title: "Survey/SurveyDemographicsContent",
  component: SurveyDemographicsContent,
  tags: ["autodocs"],
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
            [control]: control === "age" ? (val === "" ? null : Number(val)) : val,
          }));
        }}
      />
    );
  },
};