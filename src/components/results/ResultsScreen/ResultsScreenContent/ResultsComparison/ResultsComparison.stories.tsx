import type { Meta, StoryObj } from "@storybook/react-vite";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { ResultsComparison } from "./ResultsComparison";
import { identityTaker, moduleTaker } from "./ResultsComparison.fixtures";

// The tab as it is opened: the mode selector. Picking an orientation starts
// a comparison in the story, and asks for nothing. The comparison with a
// friend reads their result from the API, so its stories are of what it
// draws once the result is read: `AgreementBar` and `ComparisonViews`. No
// story makes a request.
const meta = {
  title: "Results/ResultsComparison",
  component: ResultsComparison,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: identityTaker,
} satisfies Meta<typeof ResultsComparison>;

export default meta;

type Story = StoryObj<typeof meta>;

export const IdentityQuiz: Story = {};

export const Narrow: Story = {
  globals: { viewport: { value: "iphone5" } },
};

// A quiz none of whose answers lists a shown orientation offers one mode.
export const NoOrientationOffered: Story = {
  args: {
    ...moduleTaker,
    survey: { ...moduleTaker.survey, orientations: [] },
  },
};
