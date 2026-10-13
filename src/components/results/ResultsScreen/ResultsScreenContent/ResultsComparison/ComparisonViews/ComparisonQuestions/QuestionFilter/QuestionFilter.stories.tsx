import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { QuestionFilter } from "./QuestionFilter";

const meta = {
  title: "Results/ResultsComparison/QuestionFilter",
  component: QuestionFilter,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    isOn: false,
    onChange: fn(),
  },
} satisfies Meta<typeof QuestionFilter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Off: Story = {};

export const On: Story = {
  args: { isOn: true },
};

export const Narrow: Story = {
  globals: { viewport: { value: "iphone5" } },
};
