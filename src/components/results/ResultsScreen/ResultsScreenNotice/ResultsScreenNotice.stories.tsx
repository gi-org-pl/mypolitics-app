import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { ResultsScreenStatus } from "../ResultsScreen.types";
import { ResultsScreenNotice } from "./ResultsScreenNotice";

const meta = {
  title: "Results/ResultsScreenNotice",
  component: ResultsScreenNotice,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    status: ResultsScreenStatus.Loading,
    onRetry: fn(),
  },
} satisfies Meta<typeof ResultsScreenNotice>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {};

export const NotFound: Story = {
  args: { status: ResultsScreenStatus.NotFound },
};

export const NotReady: Story = {
  args: { status: ResultsScreenStatus.NotReady },
};

export const Failed: Story = {
  args: { status: ResultsScreenStatus.Failed },
};

export const NotConfigured: Story = {
  args: { status: ResultsScreenStatus.NotConfigured },
};
