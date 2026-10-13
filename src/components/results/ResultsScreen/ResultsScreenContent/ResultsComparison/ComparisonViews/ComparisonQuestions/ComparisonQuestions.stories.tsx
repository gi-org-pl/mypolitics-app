import type { Meta, StoryObj } from "@storybook/react-vite";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { ComparisonQuestions } from "./ComparisonQuestions";
import {
  exampleFriendView,
  exampleOrientationView,
  exampleQuiz,
  longFriendView,
  longOrientationView,
} from "./ComparisonQuestions.fixtures";

const narrow = { viewport: { value: "iphone5" } };

// The questions view of a comparison. The search, the switch and the rows
// work in every story: what is listed and what is open is the view's own.
// The opened rows of the design are a story of `QuestionList`.
const meta = {
  title: "Results/ResultsComparison/ComparisonQuestions",
  component: ComparisonQuestions,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: exampleOrientationView,
} satisfies Meta<typeof ComparisonQuestions>;

export default meta;

type Story = StoryObj<typeof meta>;

// The quiz of the design, compared with an orientation.
export const Orientation: Story = {};

export const OrientationNarrow: Story = {
  globals: narrow,
};

// The same taker compared with a friend.
export const Friend: Story = {
  args: exampleFriendView,
};

export const FriendNarrow: Story = {
  args: exampleFriendView,
  globals: narrow,
};

// All 102 questions of the identity quiz.
export const LongQuiz: Story = {
  args: longFriendView,
};

export const LongQuizNarrow: Story = {
  args: longFriendView,
  globals: narrow,
};

export const LongQuizWithOrientation: Story = {
  args: longOrientationView,
};

// A quiz with no questions has nothing to list.
export const NoQuestions: Story = {
  args: {
    ...exampleOrientationView,
    survey: { ...exampleQuiz, questions: [] },
  },
};
