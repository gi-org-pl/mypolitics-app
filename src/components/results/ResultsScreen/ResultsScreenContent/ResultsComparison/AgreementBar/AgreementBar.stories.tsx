import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import {
  exampleOrientations,
  friendComparison,
} from "../ResultsComparison.fixtures";
import { AgreementBar } from "./AgreementBar";

const friend = friendComparison.other.orientation;
const [orientation] = exampleOrientations;

const narrow = { viewport: { value: "iphone5" } };

const meta = {
  title: "Results/ResultsComparison/AgreementBar",
  component: AgreementBar,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    other: friend,
    score: 95,
    onEnd: fn(),
  },
} satisfies Meta<typeof AgreementBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Friend: Story = {};

export const FriendNarrow: Story = {
  globals: narrow,
};

export const Orientation: Story = {
  args: { other: orientation, score: 60 },
};

export const OrientationNarrow: Story = {
  args: { other: orientation, score: 60 },
  globals: narrow,
};

export const NoScore: Story = {
  args: { score: undefined },
};

export const FullAgreement: Story = {
  args: { score: 100 },
};

export const NoAgreement: Story = {
  args: { score: 0 },
};

export const LongName: Story = {
  args: {
    other: {
      ...orientation,
      name: "Orientacja o wyjątkowo długiej nazwie, która nie mieści się w jednym wierszu",
    },
    score: 60,
  },
  globals: narrow,
};
