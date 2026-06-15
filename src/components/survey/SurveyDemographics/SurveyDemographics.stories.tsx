import type { Meta, StoryObj } from "@storybook/react";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import SurveyDemographics from "./SurveyDemographics";

i18n.load("pl", {});
i18n.activate("pl");

const meta: Meta<typeof SurveyDemographics> = {
  title: "Survey/SurveyDemographics",
  component: SurveyDemographics,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <I18nProvider i18n={i18n}>
        <Story />
      </I18nProvider>
    ),
  ],
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

export const Loading: Story = {
  name: "Loading",
  args: {
    isLoading: true,
  },
};