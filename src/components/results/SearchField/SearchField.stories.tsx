import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { SearchField } from "./SearchField";

const meta = {
  title: "Results/SearchField",
  component: SearchField,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    label: "Szukaj",
    value: "",
    onChange: fn(),
  },
} satisfies Meta<typeof SearchField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithText: Story = {
  args: { value: "demokracja" },
};

export const LongLabel: Story = {
  args: { label: "Szukaj po nazwie" },
};

export const Narrow: Story = {
  globals: { viewport: { value: "iphone5" } },
};
