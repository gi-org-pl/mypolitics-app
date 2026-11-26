import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { PillTabs } from "./PillTabs";
import type { PillTab } from "./PillTabs.types";

const MODES: PillTab[] = [
  { value: "story-friend", label: "Ze znajomym" },
  { value: "story-orientation", label: "Z orientacją" },
];

const VIEWS: PillTab[] = [
  { value: "story-results", label: "Wyniki" },
  { value: "story-questions", label: "Pytania" },
];

const LONG: PillTab[] = [
  { value: "story-long-first", label: "Ze znajomym z tego samego quizu" },
  { value: "story-long-second", label: "Z orientacją tego quizu" },
];

const meta = {
  title: "Results/PillTabs",
  component: PillTabs,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    label: "Tryb porównania",
    tabs: MODES,
    value: MODES[0].value,
    onChange: fn(),
  },
} satisfies Meta<typeof PillTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Modes: Story = {};

export const SecondChosen: Story = {
  args: { value: MODES[1].value },
};

export const Views: Story = {
  args: { label: "Widok porównania", tabs: VIEWS, value: VIEWS[0].value },
};

export const LongLabels: Story = {
  args: { tabs: LONG, value: LONG[0].value },
};

export const Narrow: Story = {
  globals: { viewport: { value: "iphone5" } },
};
