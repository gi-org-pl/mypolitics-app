import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within } from "storybook/test";

import { HOME_QUIZZES } from "@/constants/home";

import { QuizSection } from "./QuizSection";

const meta = {
  title: "Home/QuizSection",
  component: QuizSection,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    quizzes: HOME_QUIZZES,
    onQuizStart: fn(),
    onShowMore: fn(),
    onCreate: fn(),
  },
} satisfies Meta<typeof QuizSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllQuizzes: Story = {};

export const ElectoralQuizzes: Story = {
  play: async ({ canvasElement }) => {
    const tab = within(canvasElement).getByRole("tab", { name: "Wyborcze" });

    await userEvent.click(tab);
    tab.blur();
  },
};

export const SocialQuizzes: Story = {
  play: async ({ canvasElement }) => {
    const tab = within(canvasElement).getByRole("tab", {
      name: "Społecznościowe",
    });

    await userEvent.click(tab);
    tab.blur();
  },
};

export const EmptyTab: Story = {
  args: {
    quizzes: HOME_QUIZZES.filter((quiz) =>
      quiz.categories.includes("electoral"),
    ),
  },
  play: SocialQuizzes.play,
};

export const NoQuizzes: Story = {
  args: {
    quizzes: [],
  },
};
