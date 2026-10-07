import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { FEATURED_QUIZ } from "@/constants/home";

import { FeaturedQuiz } from "./FeaturedQuiz";

const meta = {
  title: "Home/FeaturedQuiz",
  component: FeaturedQuiz,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    quiz: FEATURED_QUIZ,
    onStart: fn(),
  },
} satisfies Meta<typeof FeaturedQuiz>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongDescription: Story = {
  args: {
    quiz: {
      ...FEATURED_QUIZ,
      description: {
        id: "story.featured-quiz.long-description",
        message:
          "<0>Najbardziej zaawansowany test poglądów politycznych w Polsce i w całej Europie Środkowej.</0> Poznaj swoją tożsamość, najbliższą ideologię, partię, polityków i porównaj swoje wyniki ze znajomymi, rodziną oraz milionami innych osób, które wypełniły quiz!",
      },
    },
  },
};
