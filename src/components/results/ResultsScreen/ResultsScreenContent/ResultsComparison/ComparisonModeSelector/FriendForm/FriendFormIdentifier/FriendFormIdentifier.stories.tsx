import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { TAKER_ID } from "../../../ResultsComparison.fixtures";
import { FriendFormIdentifier } from "./FriendFormIdentifier";

// Gives the page the clipboard a story needs, and puts the browser's own back
// when the story is left.
const stubClipboard = (clipboard: unknown) => {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: clipboard,
  });

  return () => {
    Reflect.deleteProperty(navigator, "clipboard");
  };
};

const meta = {
  title: "Results/ResultsComparison/FriendFormIdentifier",
  component: FriendFormIdentifier,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    identifier: TAKER_ID,
  },
} satisfies Meta<typeof FriendFormIdentifier>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const Narrow: Story = {
  globals: { viewport: { value: "iphone5" } },
};

// The copy control was pressed and the identifier is on the clipboard: the
// control shows a tick, and the sentence is for a screen reader only.
export const Copied: Story = {
  beforeEach: () => stubClipboard({ writeText: () => Promise.resolve() }),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button"));
  },
};

// The copy control was pressed in a browser with no Clipboard API: the
// failure and what to do are written out under the identifier.
export const CopyFailed: Story = {
  beforeEach: () => stubClipboard(undefined),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button"));
  },
};

export const CopyFailedNarrow: Story = {
  ...CopyFailed,
  globals: { viewport: { value: "iphone5" } },
};
