import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { SurveyPhaseActions } from "./SurveyPhaseActions";

const meta = {
  title: "Survey/SurveyPhaseActions",
  component: SurveyPhaseActions,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    primaryLabel: "Zobacz wyniki",
    onPrimary: fn(),
    onSkip: fn(),
  },
} satisfies Meta<typeof SurveyPhaseActions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PrimaryDisabled: Story = {
  args: {
    isPrimaryDisabled: true,
    primaryDisabledReason: "Wybierz wszystkie cztery pola albo pomiń",
  },
};

export const LongLabel: Story = {
  args: {
    primaryLabel: "Wyślij i zobacz swoje pełne wyniki",
  },
};
