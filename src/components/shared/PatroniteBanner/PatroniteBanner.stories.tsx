import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { PATHS } from "@/constants/paths.ts";
import { PatroniteBanner } from "./PatroniteBanner";

const meta: Meta<typeof PatroniteBanner> = {
  title: "Shared/PatroniteBanner",
  component: PatroniteBanner,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof PatroniteBanner>;

const Wrapper = ({ children }: { children: ReactNode }) => (
  <div className="w-full max-w-[784px] mx-auto">{children}</div>
);

export const Default: Story = {
  args: {
    href: PATHS.patronite,
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
    href: PATHS.patronite,
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
    href: PATHS.patronite,
    ctaLabel: "Wesprzyj nas jednorazowo: 25 zł na rozwój projektu",
  },
  render: (args) => (
    <Wrapper>
      <PatroniteBanner {...args} />
    </Wrapper>
  ),
};
