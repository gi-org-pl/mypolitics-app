import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import {
  exampleFriendSide,
  exampleOrientationSide,
  findCompared,
  friendQuestions,
  orientationQuestions,
} from "../../ComparisonQuestions.fixtures";
import { QuestionRow } from "./QuestionRow";

const narrow = { viewport: { value: "iphone5" } };

const withOrientation = (questionId: string) =>
  findCompared(orientationQuestions, questionId);

const prices = withOrientation("prices");

const meta = {
  title: "Results/ResultsComparison/QuestionRow",
  component: QuestionRow,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    compared: withOrientation("democracy"),
    other: exampleOrientationSide.orientation,
    isOpen: false,
    onToggle: fn(),
  },
} satisfies Meta<typeof QuestionRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Agree: Story = {};

export const Disagree: Story = {
  args: { compared: withOrientation("housing") },
};

// One side has nothing to compare: no tint.
export const Neither: Story = {
  args: { compared: withOrientation("rents") },
};

export const LongTextNarrow: Story = {
  args: { compared: withOrientation("vaccines") },
  globals: narrow,
};

export const OpenDisagree: Story = {
  args: { compared: withOrientation("housing"), isOpen: true },
};

export const OpenDisagreeNarrow: Story = {
  args: OpenDisagree.args,
  globals: narrow,
};

// An orientation no answer of the question lists.
export const OpenOtherSideWithoutAnswer: Story = {
  args: { compared: withOrientation("rents"), isOpen: true },
};

// An orientation with two answers: the taker's with a tick, the other with a
// cross.
export const OpenSeveralAnswers: Story = {
  args: { compared: prices, isOpen: true },
};

export const OpenSeveralAnswersNarrow: Story = {
  args: OpenSeveralAnswers.args,
  globals: narrow,
};

// The taker skipped the question: no answer of the other side is marked.
export const OpenTakerWithoutAnswer: Story = {
  args: { compared: withOrientation("army"), isOpen: true },
};

export const OpenFriend: Story = {
  args: {
    compared: findCompared(friendQuestions, "future"),
    other: exampleFriendSide.orientation,
    isOpen: true,
  },
};

// Long texts everywhere: the question, the name of the other side and the
// answers are written in full.
export const OpenLongTextsNarrow: Story = {
  args: {
    compared: {
      ...prices,
      question: {
        ...prices.question,
        text: "Co najszybciej i najtrwalej obniży ceny mieszkań w największych miastach wojewódzkich i ich najbliższych okolicach?",
      },
      otherAnswers: prices.otherAnswers.map((answer) => ({
        ...answer,
        text: `${answer.text}, niezależnie od koniunktury i od zapowiedzi kolejnych rządów`,
      })),
    },
    other: {
      ...exampleOrientationSide.orientation,
      name: "Socjaldemokratyczny interwencjonizm mieszkaniowy",
    },
    isOpen: true,
  },
  globals: narrow,
};
