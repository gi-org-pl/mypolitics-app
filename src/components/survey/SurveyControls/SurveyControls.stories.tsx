import type { StoryObj } from "@storybook/react";
import SurveyControls from "./SurveyControls";

const meta = {
  title: "Survey/SurveyControls",
  component: SurveyControls,
  tags: ["autodocs"],
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
};

export const QuestionAnswerLargeScreen: Story = {
  name: "QuestionAnswerLargeScreen",
};

export const QuestionAnswerSmallScreen: Story = {
  name: "QuestionAnswerSmallScreen",
  parameters: {
    viewport: {
      defaultViewport: "mobile",
      viewports: {
        mobile: {
          name: "Mobile ≤400px",
          styles: { width: "375px", height: "812px" },
        },
      },
    },
  },
};

export const QuestionAnswerLongName: Story = {
  name: "QuestionAnswerLongName",
  args: {
    categoryName: "Really Looong Quiz Name...",
    answersCount: 3,
  },
};

export const Finish: Story = {
  name: "Finish",
  args: {
    phase: "FINISH",
    answersCount: 11,
  },
};

export const ResetModalOpen: Story = {
  name: "ResetModalOpen",
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
};
