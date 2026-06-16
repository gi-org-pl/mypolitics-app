import type { StoryObj } from "@storybook/react";
import SurveyControls from "./SurveyControls";

const meta = {
  title: "Survey/SurveyControls",
  component: SurveyControls,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    title: "Światopogląd",
    phase: "QUESTION_ANSWER",
    categoryName: "Polityka zagraniczna",
    questionsLeftnCategory: 11,
    answersCount: 5,
    onPrevious: () => {},
    onReset: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const CategorySelect: Story = {
  name: "CategorySelect",
  args: {
    phase: "CATEGORY_SELECT",
    answersCount: 0,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    ),
  ],
};

export const QuestionAnswerLargeScreen: Story = {
  name: "QuestionAnswerLargeScreen",
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    ),
  ],
};

export const QuestionAnswerSmallScreen: Story = {
  name: "QuestionAnswerSmallScreen",
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
};

export const QuestionAnswerLongName: Story = {
  name: "QuestionAnswerLongName",
  args: {
    categoryName: "Really Looong Quiz Name...",
    answersCount: 3,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    ),
  ],
};

export const Finish: Story = {
  name: "Finish",
  args: {
    phase: "FINISH",
    answersCount: 11,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    ),
  ],
};

export const ResetModalOpen: Story = {
  name: "ResetModalOpen",
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const resetButton = canvasElement.querySelector(
      '[data-testid="reset-button"]',
    ) as HTMLElement;
    resetButton?.click();
  },
};

export const BackButtonDisabledNoAnswers: Story = {
  name: "BackButtonDisabledNoAnswers",
  args: {
    answersCount: 0,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    ),
  ],
};
