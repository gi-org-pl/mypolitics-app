import type { Meta, StoryObj } from "@storybook/react-vite";
import { UPDATE_STORY_ARGS } from "storybook/internal/core-events";
import { addons } from "storybook/preview-api";
import { fn, userEvent, within } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { SurveyControls } from "./SurveyControls";

const meta = {
  title: "Survey/SurveyControls",
  component: SurveyControls,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  globals: {
    viewport: { value: "iphone6" },
  },
  args: {
    quizName: "Quiz Name",
    onPrevious: fn(),
    onReset: fn(),
  },
} satisfies Meta<typeof SurveyControls>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CategoryAndCount: Story = {
  args: {
    categoryName: "Światopogląd",
    questionsLeft: 11,
  },
};

export const LongCategoryName: Story = {
  args: {
    categoryName: "Polityka zagraniczna",
    questionsLeft: 11,
  },
};

export const QuizName: Story = {};

export const LongQuizName: Story = {
  args: {
    quizName: "Really Looong Quiz Name That Does Not Fit",
  },
};

export const Label: Story = {
  args: {
    label: "Prawie koniec!",
  },
};

export const NumberChange: Story = {
  args: {
    categoryName: "Światopogląd",
    questionsLeft: 30,
  },
  play: async ({ id, args }) => {
    addons.getChannel().emit(UPDATE_STORY_ARGS, {
      storyId: id,
      updatedArgs: { questionsLeft: (args.questionsLeft ?? 30) - 1 },
    });
  },
};

export const ResetDialogOpen: Story = {
  args: {
    categoryName: "Światopogląd",
    questionsLeft: 11,
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Zacznij od nowa" }),
    );
  },
};

export const CountOnly: Story = {
  args: {
    questionsLeft: 11,
  },
};

export const CategoryOnly: Story = {
  args: {
    categoryName: "Światopogląd",
  },
};

export const PreviousDisabled: Story = {
  args: {
    categoryName: "Światopogląd",
    questionsLeft: 11,
    isPreviousDisabled: true,
  },
};

export const ResetDisabled: Story = {
  args: {
    categoryName: "Światopogląd",
    questionsLeft: 11,
    isResetDisabled: true,
  },
};

export const BothDisabled: Story = {
  args: {
    quizName: "Nazwa quizu",
    isPreviousDisabled: true,
    isResetDisabled: true,
  },
};

export const ZeroLeft: Story = {
  args: {
    categoryName: "Światopogląd",
    questionsLeft: 0,
  },
};

export const EmptyQuizName: Story = {
  args: {
    quizName: "",
  },
};
