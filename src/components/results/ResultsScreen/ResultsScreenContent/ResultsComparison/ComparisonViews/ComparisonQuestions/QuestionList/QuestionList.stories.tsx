import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import {
  exampleFriendSide,
  exampleOrientationSide,
  friendQuestions,
  orientationQuestions,
} from "../ComparisonQuestions.fixtures";
import { QuestionList } from "./QuestionList";

const narrow = { viewport: { value: "iphone5" } };

// The three rows the design draws open: a disagreement, an orientation with
// no answer, and an orientation with two answers.
const DESIGN_OPEN_IDS = ["housing", "rents", "prices"];

const meta = {
  title: "Results/ResultsComparison/QuestionList",
  component: QuestionList,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    questions: orientationQuestions,
    other: exampleOrientationSide.orientation,
    openIds: [],
    onToggle: fn(),
  },
} satisfies Meta<typeof QuestionList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {};

export const CollapsedNarrow: Story = {
  globals: narrow,
};

// The rows of the design.
export const Opened: Story = {
  args: { openIds: DESIGN_OPEN_IDS },
};

export const OpenedNarrow: Story = {
  args: { openIds: DESIGN_OPEN_IDS },
  globals: narrow,
};

// Every row open, with a friend: one answer on each side.
export const FriendOpened: Story = {
  args: {
    questions: friendQuestions,
    other: exampleFriendSide.orientation,
    openIds: friendQuestions.map(({ question }) => question.id),
  },
};

export const FriendOpenedNarrow: Story = {
  args: FriendOpened.args,
  globals: narrow,
};

export const Empty: Story = {
  args: { questions: [] },
};
