import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import type { NolanPathCheckpointCard } from "@/types/checkpoint";
import { createCompassTrail } from "@/utils/vitest/createCompassTrail";

import { SurveyCheckpointNolanPath } from "./SurveyCheckpointNolanPath";

// Cards as the engine hands them over: frozen at the boundary they fired at.
// The line is fixed by its place in the pool, so a story always shows the
// same words. A trail starts at the first position the taker held, which is
// rarely the middle of the map.

// Out of the middle, around the two upper quadrants and down into the lower
// left one: three quadrants.
const PARTIAL_TRAIL = createCompassTrail([
  [0, 0],
  [0.14, 0.22],
  [0.02, 0.53],
  [-0.22, 0.59],
  [-0.51, 0.49],
  [-0.63, 0.22],
  [-0.55, -0.06],
  [-0.49, -0.31],
  [-0.65, -0.6],
]);

// From the upper right, over the upper left and the lower left, to the lower
// right: all four quadrants.
const FULL_TRAIL = createCompassTrail([
  [0.45, 0.4],
  [0.1, 0.56],
  [-0.35, 0.5],
  [-0.6, 0.15],
  [-0.55, -0.25],
  [-0.2, -0.45],
  [0.05, -0.6],
  [0.22, -0.88],
]);

// What came after an earlier path card: a short stretch inside one corner.
const SECOND_TRAIL = createCompassTrail([
  [0.22, -0.12],
  [0.45, -0.04],
  [0.62, -0.2],
  [0.5, -0.42],
  [0.28, -0.56],
  [0.22, -0.88],
]);

const CENTRE_TRAIL = createCompassTrail([
  [0.6, 0.5],
  [0.2, 0.62],
  [-0.4, 0.45],
  [-0.5, -0.1],
  [-0.2, -0.3],
  [0.1, -0.15],
]);

const CORNER_TRAIL = createCompassTrail([
  [-0.5, 0.5],
  [-0.1, 0.3],
  [0.3, 0.45],
  [0.6, 0.1],
  [0.75, -0.55],
  [1, -1],
]);

// Three hundred positions: a route that winds around the map and closes in.
const LONG_TRAIL = createCompassTrail(
  Array.from({ length: 300 }, (_, index): [number, number] => {
    const reach = 0.95 - index * 0.002;

    return [Math.cos(index / 11) * reach, Math.sin(index / 7) * reach];
  }),
);

// A figure of eight: the route crosses itself in the middle of the map.
const CROSSING_TRAIL = createCompassTrail([
  [-0.6, 0.6],
  [-0.2, 0.25],
  [0.3, -0.3],
  [0.65, -0.6],
  [0.8, -0.2],
  [0.65, 0.45],
  [0.2, 0.3],
  [-0.25, -0.2],
  [-0.6, -0.55],
]);

const PARTIAL_CARD: NolanPathCheckpointCard = {
  type: "nolan-path",
  boundary: 12,
  line: { pool: "nolan-path-partial", index: 0 },
  variant: "partial",
  count: 3,
  trail: PARTIAL_TRAIL,
  isSecondPath: false,
};

const FULL_CARD: NolanPathCheckpointCard = {
  type: "nolan-path",
  boundary: 31,
  line: { pool: "nolan-path-full", index: 0 },
  variant: "full",
  count: 4,
  trail: FULL_TRAIL,
  isSecondPath: false,
};

const meta = {
  title: "Survey/SurveyCheckpointNolanPath",
  component: SurveyCheckpointNolanPath,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    card: PARTIAL_CARD,
    onReveal: fn(),
    onContinue: fn(),
    onOptOut: fn(),
  },
} satisfies Meta<typeof SurveyCheckpointNolanPath>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TwoOrThreeQuadrants: Story = {};

export const FourQuadrants: Story = {
  args: { card: FULL_CARD },
};

export const FourQuadrantsSecondPath: Story = {
  args: { card: { ...FULL_CARD, isSecondPath: true, trail: SECOND_TRAIL } },
};

// The last point at the centre level: a trail and no filled quadrant.
export const NearTheCentre: Story = {
  args: { card: { ...PARTIAL_CARD, count: 2, trail: CENTRE_TRAIL } },
};

export const DotInACorner: Story = {
  args: { card: { ...PARTIAL_CARD, trail: CORNER_TRAIL } },
};

export const LongTrail: Story = {
  args: { card: { ...FULL_CARD, boundary: 300, trail: LONG_TRAIL } },
};

export const TrailCrossingItself: Story = {
  args: { card: { ...FULL_CARD, trail: CROSSING_TRAIL } },
};

// The first line of the two-or-three pool, shown above, is the longest line
// of the two pools; these are the other two.
export const SecondLine: Story = {
  args: {
    card: { ...PARTIAL_CARD, line: { pool: "nolan-path-partial", index: 1 } },
  },
};

export const ThirdLine: Story = {
  args: {
    card: { ...PARTIAL_CARD, line: { pool: "nolan-path-partial", index: 2 } },
  },
};
