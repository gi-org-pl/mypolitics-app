import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { FRIEND_ID, TAKER_ID } from "../../ResultsComparison.fixtures";
import { FriendForm } from "./FriendForm";
import { FriendNotice } from "./FriendForm.types";

const meta = {
  title: "Results/ResultsComparison/FriendForm",
  component: FriendForm,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    resultId: TAKER_ID,
    friendId: "",
    notice: FriendNotice.Hint,
    onFriendIdChange: fn(),
  },
} satisfies Meta<typeof FriendForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Narrow: Story = {
  globals: { viewport: { value: "iphone5" } },
};

export const NotAnIdentifier: Story = {
  args: { friendId: "5218cde2-beac", notice: FriendNotice.Invalid },
};

export const Fetching: Story = {
  args: { friendId: FRIEND_ID, notice: FriendNotice.Fetching },
};

export const RefusedOwn: Story = {
  args: { friendId: TAKER_ID, notice: FriendNotice.Own },
};

export const RefusedOtherSurvey: Story = {
  args: { friendId: FRIEND_ID, notice: FriendNotice.OtherSurvey },
};

export const RefusedUnreadable: Story = {
  args: { friendId: FRIEND_ID, notice: FriendNotice.Unreadable },
};
