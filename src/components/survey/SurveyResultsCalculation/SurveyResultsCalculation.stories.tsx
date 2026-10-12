import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { SurveyResultsCalculation } from "./SurveyResultsCalculation";

// The card alone: it draws the lines and the state it is given. Nothing here
// keeps time or makes a request, so a story shows one moment of a run.
const meta = {
  title: "Survey/SurveyResultsCalculation",
  component: SurveyResultsCalculation,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    state: "running",
    lines: [
      "Prostujemy osie",
      "Liczymy, nie oceniamy",
      "Szukamy Twojej ćwiartki",
    ],
    onRetry: fn(),
    onSeeResults: fn(),
  },
} satisfies Meta<typeof SurveyResultsCalculation>;

export default meta;

type Story = StoryObj<typeof meta>;

// The frame "standard": two finished lines and the third one current.
export const Running: Story = {};

// The eighth line is the last: it stays current until the run ends.
export const Holding: Story = {
  args: {
    lines: [
      "Prostujemy osie",
      "Liczymy, nie oceniamy",
      "Szukamy Twojej ćwiartki",
      "Panowie, liczymy głosy",
      "Rozpoczynamy trzecie czytanie",
      "Przeliczamy jeszcze raz",
      "Liczymy, ale się cieszymy",
      "Dzielimy przez zero",
    ],
  },
};

export const FailedAnswersNotSaved: Story = {
  args: { state: "failed-not-saved" },
};

export const FailedResultNotReady: Story = {
  args: { state: "failed-not-ready" },
};

export const LinkNotSent: Story = {
  args: { state: "link-not-sent" },
};

export const FirstLine: Story = {
  args: { lines: ["Prostujemy osie"] },
};

// The longest line of the pool: it wraps inside its pill where the field is
// narrower than the line.
export const LongLine: Story = {
  args: {
    lines: ["Prostujemy osie", "Sprawdzamy czy przekraczasz próg"],
  },
};

export const NoLines: Story = {
  args: { lines: [] },
};
