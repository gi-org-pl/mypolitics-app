import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import {
  identityFriendComparison,
  identityTaker,
  twoViewComparison,
} from "../ResultsComparison.fixtures";
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

// A friend today: the results view alone, with no switch.
export const OneView: Story = {};

// A friend once the list of questions is drawn: the switch over the view.
export const TwoViews: Story = {
  args: { comparison: twoViewComparison },
};

export const TwoViewsNarrow: Story = {
  args: { comparison: twoViewComparison },
  globals: { viewport: { value: "iphone5" } },
};
