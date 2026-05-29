import type { Meta, StoryObj } from "@storybook/react";
import { PatroniteBanner } from "./PatroniteBanner";
import React from "react";

const meta: Meta<typeof PatroniteBanner> = {
  title: "Shared/PatroniteBanner",
  component: PatroniteBanner,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof PatroniteBanner>;

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full max-w-[784px] mx-auto">{children}</div>
);

export const Default: Story = {
  args: {
    href: "https://patronite.pl/mypolitics",
    ctaLabel: "5 zł na kawę",
  },
  render: (args) => (
    <Wrapper>
      <PatroniteBanner {...args} />
    </Wrapper>
  ),
};

export const Mobile: Story = {
  args: {
    href: "https://patronite.pl/mypolitics",
    ctaLabel: "5 zł na kawę",
  },
  parameters: {
    viewport: {
      defaultViewport: "iphone6",
    },
  },
  render: (args) => (
    <Wrapper>
      <PatroniteBanner {...args} />
    </Wrapper>
  ),
};

export const LongCtaLabel: Story = {
  args: {
    href: "https://patronite.pl/mypolitics",
    ctaLabel: "Wesprzyj nas jednorazowo: 25 zł na rozwój projektu",
  },
  render: (args) => (
    <Wrapper>
      <PatroniteBanner {...args} />
    </Wrapper>
  ),
};
