import type { Meta, StoryObj } from "@storybook/react-vite";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { Agreement } from "@/types/comparison";

import { Answer } from "./Answer";

const narrow = { viewport: { value: "iphone5" } };

const meta = {
  title: "Results/ResultsComparison/QuestionRowAnswer",
  component: Answer,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    text: "Rząd nie powinien interweniować na rynku mieszkaniowym",
  },
} satisfies Meta<typeof Answer>;

export default meta;

type Story = StoryObj<typeof meta>;

// An answer with nothing to hold it up against.
export const Unmarked: Story = {};

// The answer of the taker too: a tick.
export const Agree: Story = {
  args: { agreement: Agreement.Agree },
};

// Another answer than the taker's: a cross.
export const Disagree: Story = {
  args: { agreement: Agreement.Disagree },
};

export const DisagreeNarrow: Story = {
  args: { agreement: Agreement.Disagree },
  globals: narrow,
};

export const NoAnswer: Story = {
  args: { text: undefined },
};

export const OfTheTaker: Story = {
  args: { isTaker: true },
};

export const NoAnswerOfTheTaker: Story = {
  args: { text: undefined, isTaker: true },
};

export const LongTextNarrow: Story = {
  args: {
    text: "Budowa tanich mieszkań na wynajem z publicznych pieniędzy, niezależnie od koniunktury i od zapowiedzi kolejnych rządów",
    agreement: Agreement.Agree,
  },
  globals: narrow,
};
