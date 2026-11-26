import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { ErrorBoundary } from "./ErrorBoundary";

// A part of a screen that fails while it draws.
const BrokenPart = () => {
  throw new Error("This part cannot be drawn");
};

const meta = {
  title: "Shared/ErrorBoundary",
  component: ErrorBoundary,
  args: {
    onError: fn(),
    children: <p className="text-base text-gi-primary">Ta część się rysuje.</p>,
  },
} satisfies Meta<typeof ErrorBoundary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Drawn: Story = {};

// Nothing of the failed part is shown, and the failure is reported once.
export const Failed: Story = {
  args: { children: <BrokenPart /> },
};
