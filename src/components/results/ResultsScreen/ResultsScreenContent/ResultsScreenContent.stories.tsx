import type { Meta, StoryObj } from "@storybook/react-vite";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { ResultsScreenContent } from "./ResultsScreenContent";
import {
  candidateResults,
  identityResults,
  longCornerNameResults,
  longNamesResults,
  lowMatchResults,
  noMatchResults,
  oneColumnResults,
} from "./ResultsScreenContent.fixtures";

// `ResultsScreen` reads the result and its quiz from the API, so its stories
// are of what it draws once both are read: a result of a fixture quiz. No
// story makes a request.
const meta = {
  title: "Results/ResultsScreen",
  component: ResultsScreenContent,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: identityResults,
} satisfies Meta<typeof ResultsScreenContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const IdentityQuiz: Story = {};

export const CandidateQuiz: Story = {
  args: candidateResults,
};

export const LongCornerName: Story = {
  args: longCornerNameResults,
};

export const NoMatch: Story = {
  args: noMatchResults,
};

// The closest identity at 44 %: the quiz names it all the same, with its
// notice, and its parties card says that there is no closest party.
export const LowMatch: Story = {
  args: lowMatchResults,
};

export const LongNames: Story = {
  args: longNamesResults,
};

export const OneColumn: Story = {
  args: oneColumnResults,
};

export const Narrow: Story = {
  globals: { viewport: { value: "iphone6" } },
};
