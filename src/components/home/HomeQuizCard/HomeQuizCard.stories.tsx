import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { FEATURED_QUIZ, HOME_QUIZZES } from "@/constants/home";

import { HomeQuizCard } from "./HomeQuizCard";

const [logoQuiz, , , imageQuiz] = HOME_QUIZZES;

const meta = {
  title: "Home/HomeQuizCard",
  component: HomeQuizCard,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    quiz: logoQuiz,
    onStart: fn(),
  },
} satisfies Meta<typeof HomeQuizCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LogoQuiz: Story = {};

export const ImageQuiz: Story = {
  args: {
    quiz: imageQuiz,
  },
};

export const Featured: Story = {
  args: {
    quiz: FEATURED_QUIZ,
    isFeatured: true,
  },
};

export const WithoutDescription: Story = {
  args: {
    quiz: { ...imageQuiz, description: undefined, tags: [] },
  },
};
