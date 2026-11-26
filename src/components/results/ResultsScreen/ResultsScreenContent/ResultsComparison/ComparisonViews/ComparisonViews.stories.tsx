import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import {
  identityFriendComparison,
  identityOrientationComparison,
  identityTaker,
} from "../ResultsComparison.fixtures";
import { ComparisonView } from "../ResultsComparison.types";
import { ComparisonViews } from "./ComparisonViews";

const meta = {
  title: "Results/ResultsComparison/ComparisonViews",
  component: ComparisonViews,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    ...identityTaker,
    comparison: identityFriendComparison,
    onViewChange: fn(),
  },
} satisfies Meta<typeof ComparisonViews>;

export default meta;

type Story = StoryObj<typeof meta>;

// A friend: the switch over the view, the results first.
export const FriendResults: Story = {};

export const FriendResultsNarrow: Story = {
  globals: { viewport: { value: "iphone5" } },
};

export const FriendQuestions: Story = {
  args: {
    comparison: { ...identityFriendComparison, view: ComparisonView.Questions },
  },
};

export const FriendQuestionsNarrow: Story = {
  args: FriendQuestions.args,
  globals: { viewport: { value: "iphone5" } },
};

// An orientation: the questions alone, with no switch.
export const OrientationQuestions: Story = {
  args: { comparison: identityOrientationComparison },
};
