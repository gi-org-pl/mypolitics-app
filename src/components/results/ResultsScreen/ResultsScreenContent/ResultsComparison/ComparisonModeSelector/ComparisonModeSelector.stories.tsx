import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import {
  choosingFriend,
  choosingOrientation,
  exampleOrientations,
  fetchingFriend,
  refusedOwn,
  TAKER_ID,
} from "../ResultsComparison.fixtures";
import { ComparisonModeSelector } from "./ComparisonModeSelector";

const narrow = { viewport: { value: "iphone5" } };

const meta = {
  title: "Results/ResultsComparison/ComparisonModeSelector",
  component: ComparisonModeSelector,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    state: choosingFriend,
    resultId: TAKER_ID,
    orientations: exampleOrientations,
    onModeChange: fn(),
    onFriendIdChange: fn(),
    onOrientationPick: fn(),
  },
} satisfies Meta<typeof ComparisonModeSelector>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Friend: Story = {};

export const FriendNarrow: Story = {
  globals: narrow,
};

export const Orientation: Story = {
  args: { state: choosingOrientation },
};

export const OrientationNarrow: Story = {
  args: { state: choosingOrientation },
  globals: narrow,
};

export const Fetching: Story = {
  args: { state: fetchingFriend },
};

export const Refused: Story = {
  args: { state: refusedOwn },
};

// A quiz that offers no orientation has one mode, and no tab list.
export const NoOrientationOffered: Story = {
  args: { orientations: [] },
};
