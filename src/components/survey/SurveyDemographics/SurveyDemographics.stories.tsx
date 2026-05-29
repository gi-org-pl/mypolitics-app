import type { Meta, StoryObj } from "@storybook/react";
import SurveyDemographics from "./SurveyDemographics";

const meta: Meta<typeof SurveyDemographics> = {
  title: "Survey/SurveyDemographics",
  component: SurveyDemographics,
  tags: ["autodocs"],
  args: {
    onSubmit: (demographics) => console.log("onSubmit", demographics),
    onSkip: () => console.log("onSkip"),
  },
};

export default meta;

type Story = StoryObj<typeof SurveyDemographics>;

export const Default: Story = {
  name: "Default",
};