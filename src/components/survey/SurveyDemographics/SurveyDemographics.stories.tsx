import type { Meta, StoryObj } from "@storybook/react";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import SurveyDemographics from "./SurveyDemographics";

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

export const AllFilled: Story = {
  name: "AllFilled",
  args: {
    initialValues: {
      age: "25",
      gender: "female",
      residenceAreaSize: "city_medium",
      education: "higher",
      region: "mazowieckie",
    },
  },
};

export const Loading: Story = {
  name: "Loading",
  args: {
    isLoading: true,
  },
};

export const ModalOpen: Story = {
  name: "ModalOpen",
  args: {
    initialModalOpen: true,
  },
};