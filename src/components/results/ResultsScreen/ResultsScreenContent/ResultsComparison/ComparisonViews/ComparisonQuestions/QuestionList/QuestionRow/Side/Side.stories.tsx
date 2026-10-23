import type { Meta, StoryObj } from "@storybook/react-vite";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import takerAvatar from "@/assets/icons/person-avatar-filled.svg";
import { Agreement } from "@/types/comparison";

import { exampleOrientationSide } from "../../../ComparisonQuestions.fixtures";
import { Side } from "./Side";

const narrow = { viewport: { value: "iphone5" } };

const INTERVENTION = "Rząd nie powinien interweniować na rynku mieszkaniowym";

const meta = {
  title: "Results/ResultsComparison/QuestionRowSide",
  component: Side,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    who: exampleOrientationSide.orientation,
    answers: [
      {
        id: "a1",
        text: "Budowa tanich mieszkań na wynajem z publicznych pieniędzy",
        agreement: Agreement.Disagree,
      },
    ],
  },
} satisfies Meta<typeof Side>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OtherSide: Story = {};

export const OtherSideNarrow: Story = {
  globals: narrow,
};

export const SeveralAnswers: Story = {
  args: {
    answers: [
      { id: "a1", text: INTERVENTION, agreement: Agreement.Agree },
      {
        id: "a2",
        text: "Uproszczenie prawa budowlanego",
        agreement: Agreement.Disagree,
      },
    ],
  },
};

// The taker did not answer: nothing to hold the answers up against.
export const UnmarkedAnswers: Story = {
  args: {
    answers: [
      { id: "a1", text: "Częściowo przeciw", agreement: Agreement.Neither },
      { id: "a2", text: "Zdecydowanie przeciw", agreement: Agreement.Neither },
    ],
  },
};

export const NoAnswer: Story = {
  args: { answers: [] },
};

export const Taker: Story = {
  args: {
    who: { name: "Ty", imageUrl: takerAvatar },
    answers: [{ id: "a1", text: INTERVENTION }],
    isTaker: true,
  },
};

export const TakerWithoutAnswer: Story = {
  args: {
    who: { name: "Ty", imageUrl: takerAvatar },
    answers: [],
    isTaker: true,
  },
};

export const LongNameNarrow: Story = {
  args: {
    who: {
      ...exampleOrientationSide.orientation,
      name: "Socjaldemokratyczny interwencjonizm mieszkaniowy",
    },
  },
  globals: narrow,
};
