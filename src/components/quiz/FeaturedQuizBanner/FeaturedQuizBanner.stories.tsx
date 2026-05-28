import type { Meta, StoryObj } from "@storybook/react";
import FeaturedQuizBanner from "./FeaturedQuizBanner";

const meta: Meta<typeof FeaturedQuizBanner> = {
  title: "Components/Quiz/FeaturedQuizBanner",
  component: FeaturedQuizBanner,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FeaturedQuizBanner>;

export const Default: Story = {
  render: () => (
    <div className="w-[800px] bg-white">
      <FeaturedQuizBanner />
    </div>
  ),
};

export const InContainer: Story = {
  render: () => (
    <div className="max-w-[778px] mx-auto">
      <FeaturedQuizBanner />
    </div>
  ),
};

export const DarkContext: Story = {
  render: () => (
    <div className="w-[800px] bg-slate-900">
      <FeaturedQuizBanner />
    </div>
  ),
};
