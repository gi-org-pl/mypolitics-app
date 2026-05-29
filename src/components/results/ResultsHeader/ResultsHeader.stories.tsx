import type { Meta, StoryObj } from "@storybook/react";
import { ResultsHeader } from "./ResultsHeader";

const meta: Meta<typeof ResultsHeader> = {
  title: "results/ResultsHeader",
  component: ResultsHeader,
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj<typeof ResultsHeader>;

const baseArgs = {
  name: "Community Builder",
  slogan: "Practical change starts close to people",
  imageUrl: "https://placehold.co/128x128",
};

export const HighMatch: Story = {
  args: {
    ...baseArgs,
    agreementPercent: 76,
  },
};

export const MidMatch: Story = {
  args: {
    ...baseArgs,
    agreementPercent: 51,
  },
};

export const LowMatch: Story = {
  args: {
    ...baseArgs,
    agreementPercent: 12,
  },
};

export const WithButton: Story = {
  args: {
    ...baseArgs,
    agreementPercent: 75,
    actionLabel: "Program wyborczy",
    actionShortLabel: "Program",
    onActionClick: () => undefined,
  },
};

export const WithoutButton: Story = {
  args: {
    ...baseArgs,
    agreementPercent: 76,
  },
};

export const FractionalPercent: Story = {
  args: {
    ...baseArgs,
    agreementPercent: 66.6,
  },
};

export const LongName: Story = {
  args: {
    name: "Long universal result name that should wrap without breaking the layout",
    slogan:
      "A longer slogan that checks how the bottom bar behaves when the text needs more space",
    imageUrl: "https://placehold.co/128x128",
    agreementPercent: 76,
    actionLabel: "Program wyborczy",
    actionShortLabel: "Program",
    onActionClick: () => undefined,
  },
};
