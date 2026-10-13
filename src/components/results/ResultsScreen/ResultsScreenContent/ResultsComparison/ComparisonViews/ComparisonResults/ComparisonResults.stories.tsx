import type { Meta, StoryObj } from "@storybook/react-vite";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import {
  friendComparison,
  identityFriendComparison,
  identityTaker,
  moduleTaker,
  orientationComparison,
} from "../../ResultsComparison.fixtures";
import { ComparisonResults } from "./ComparisonResults";

const meta = {
  title: "Results/ResultsComparison/ComparisonResults",
  component: ComparisonResults,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    ...identityTaker,
    comparison: identityFriendComparison,
  },
} satisfies Meta<typeof ComparisonResults>;

export default meta;

type Story = StoryObj<typeof meta>;

// The identity quiz with a friend laid over it.
export const IdentityQuiz: Story = {};

export const IdentityQuizNarrow: Story = {
  globals: { viewport: { value: "iphone5" } },
};

// A quiz with one module of every type, each with the friend laid over it.
export const EveryModuleType: Story = {
  args: { ...moduleTaker, comparison: friendComparison },
};

// An other side with no result lays nothing over the modules.
export const NothingLaidOver: Story = {
  args: { ...moduleTaker, comparison: orientationComparison },
};
