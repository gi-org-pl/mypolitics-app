import type { Meta, StoryObj } from "@storybook/react-vite";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { FriendNotice } from "../FriendForm.types";
import { FriendFormNotice } from "./FriendFormNotice";

const meta = {
  title: "Results/ResultsComparison/FriendFormNotice",
  component: FriendFormNotice,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    id: "friend-notice",
    notice: FriendNotice.Hint,
    isError: false,
  },
} satisfies Meta<typeof FriendFormNotice>;

export default meta;

type Story = StoryObj<typeof meta>;

// The quiet hint, the longest sentence of the line.
export const Hint: Story = {};

export const HintNarrow: Story = {
  globals: { viewport: { value: "iphone5" } },
};

export const Fetching: Story = {
  args: { notice: FriendNotice.Fetching },
};

// The notices that say the text of the field cannot be used are written in
// the full colour.
export const Invalid: Story = {
  args: { notice: FriendNotice.Invalid, isError: true },
};

export const Own: Story = {
  args: { notice: FriendNotice.Own, isError: true },
};

export const OtherSurvey: Story = {
  args: { notice: FriendNotice.OtherSurvey, isError: true },
};

export const Unreadable: Story = {
  args: { notice: FriendNotice.Unreadable, isError: true },
};
