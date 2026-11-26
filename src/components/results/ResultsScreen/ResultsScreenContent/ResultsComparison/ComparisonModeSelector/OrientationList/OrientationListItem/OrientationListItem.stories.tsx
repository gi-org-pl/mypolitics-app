import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { exampleOrientations } from "../../../ResultsComparison.fixtures";
import { OrientationListItem } from "./OrientationListItem";

const [orientation] = exampleOrientations;

const meta = {
  title: "Results/ResultsComparison/OrientationListItem",
  component: OrientationListItem,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    orientation,
    onPick: fn(),
  },
} satisfies Meta<typeof OrientationListItem>;

export default meta;

type Story = StoryObj<typeof meta>;

// A disc in the colour of the orientation, with its image on it.
export const ColourAndImage: Story = {};

export const LongNameNarrow: Story = {
  args: {
    orientation: {
      ...orientation,
      name: "Orientacja o wyjątkowo długiej nazwie, która nie mieści się w jednym wierszu",
    },
  },
  globals: { viewport: { value: "iphone5" } },
};

// No colour and no image: the grey disc a bar has.
export const NoColour: Story = {
  args: {
    orientation: { id: "plain", type: "other", name: "Orientacja bez koloru" },
  },
};

// An image that fails to load leaves the coloured disc alone.
export const BrokenImage: Story = {
  args: {
    orientation: {
      ...orientation,
      imageUrl: "data:image/png;base64,broken",
    },
  },
};
