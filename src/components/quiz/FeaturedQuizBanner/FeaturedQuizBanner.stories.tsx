import type { Meta, StoryObj } from "@storybook/react-vite";

import { FeaturedQuizBanner } from "./FeaturedQuizBanner";

const meta = {
  title: "Quiz/FeaturedQuizBanner",
  component: FeaturedQuizBanner,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof FeaturedQuizBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DarkBackground: Story = {
  globals: {
    backgrounds: { value: "dark" },
  },
};
