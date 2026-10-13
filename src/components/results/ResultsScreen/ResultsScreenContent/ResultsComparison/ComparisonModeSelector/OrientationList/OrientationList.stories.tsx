import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import {
  exampleOrientations,
  identityOrientations,
} from "../../ResultsComparison.fixtures";
import { OrientationList } from "./OrientationList";

const [first, ...rest] = exampleOrientations;

const meta = {
  title: "Results/ResultsComparison/OrientationList",
  component: OrientationList,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    orientations: exampleOrientations,
    onPick: fn(),
  },
} satisfies Meta<typeof OrientationList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FourOrientations: Story = {};

export const Narrow: Story = {
  globals: { viewport: { value: "iphone5" } },
};

// Every orientation the identity quiz offers.
export const WholeQuiz: Story = {
  args: { orientations: identityOrientations },
};

export const LongName: Story = {
  args: {
    orientations: [
      {
        ...first,
        name: "Orientacja o wyjątkowo długiej nazwie, która nie mieści się w jednym wierszu",
      },
      ...rest,
    ],
  },
  globals: { viewport: { value: "iphone5" } },
};

// An orientation with no colour and no image gets the grey mark of a bar.
export const NoColourNoImage: Story = {
  args: {
    orientations: [
      { id: "plain", type: "other", name: "Orientacja bez koloru i obrazu" },
      ...rest,
    ],
  },
};
