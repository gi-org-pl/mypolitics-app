import type { Meta, StoryObj } from "@storybook/react-vite";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { DEFAULT_COMPASS_QUADRANTS } from "@/constants/results";
import type { Orientation } from "@/types/orientation";
import { createCompassTrail } from "@/utils/vitest/survey/createCompassTrail";

import { CompassMap } from "./CompassMap";
import type { CompassMapPosition } from "./CompassMap.types";

// The literal value of --gi-light-primary, the colour of the line and of the
// dot: a quadrant filled with it is the hardest ground for both.
const LINE_COLOR = "oklch(0.4189 0.076 219.48)";

const FRIEND_IMAGE = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#f4d7b5"/><circle cx="16" cy="13" r="6" fill="#8a5a3c"/><path d="M4 32c0-8 5-12 12-12s12 4 12 12Z" fill="#2c3e50"/></svg>',
)}`;

const friend: Orientation = {
  id: "friend",
  type: "person",
  name: "Rafał",
  imageUrl: FRIEND_IMAGE,
};

const MODERATE: CompassMapPosition = {
  x: -0.54,
  y: -0.34,
  level: "moderate",
  quadrant: "bottomLeft",
};

const EXTREME: CompassMapPosition = {
  x: 0.8,
  y: 0.7,
  level: "extreme",
  quadrant: "topRight",
};

const CENTRE: CompassMapPosition = {
  x: 0.1,
  y: -0.2,
  level: "centre",
  quadrant: "bottomRight",
};

// A route that leaves the middle of the map, loops through the two upper
// quadrants and ends in the lower left one.
const TRAIL = createCompassTrail([
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

// A route that ends in the top right corner of the map.
const CORNER_TRAIL = createCompassTrail([
  [-0.4, -0.5],
  [0.1, -0.3],
  [0.3, 0.2],
  [0.75, 0.55],
  [1, 1],
]);

// A route along the edges of the map, through all four corners.
const EDGE_TRAIL = createCompassTrail([
  [-1, 1],
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-0.5, 0.2],
]);

const meta = {
  title: "Shared/CompassMap",
  component: CompassMap,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    quadrants: DEFAULT_COMPASS_QUADRANTS,
    position: MODERATE,
    description: "Kompas",
  },
} satisfies Meta<typeof CompassMap>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Moderate: Story = {};

export const Extreme: Story = {
  args: { position: EXTREME },
};

export const Centre: Story = {
  args: { position: CENTRE },
};

export const NoPosition: Story = {
  args: { position: null },
};

export const WithTrail: Story = {
  args: { trail: TRAIL, position: TRAIL.at(-1) },
};

export const TrailToACorner: Story = {
  args: { trail: CORNER_TRAIL, position: CORNER_TRAIL.at(-1) },
};

// Every extreme of both axes: the line runs to each edge and each corner.
export const TrailAlongTheEdges: Story = {
  args: { trail: EDGE_TRAIL, position: EDGE_TRAIL.at(-1) },
};

// The filled quadrant in the colour of the line: the light edge keeps the
// line visible.
export const TrailOnAMatchingColour: Story = {
  args: {
    quadrants: {
      ...DEFAULT_COMPASS_QUADRANTS,
      bottomLeft: { color: LINE_COLOR },
    },
    trail: TRAIL,
    position: TRAIL.at(-1),
  },
};

export const DotTopLeftCorner: Story = {
  args: {
    position: { x: -1, y: 1, level: "extreme", quadrant: "topLeft" },
  },
};

export const DotBottomRightCorner: Story = {
  args: {
    position: { x: 1, y: -1, level: "extreme", quadrant: "bottomRight" },
  },
};

export const WithComparison: Story = {
  args: {
    otherOrientation: friend,
    otherPosition: { x: 0.45, y: 0.6 },
  },
};

export const NoQuadrantColours: Story = {
  args: { quadrants: undefined, trail: TRAIL, position: TRAIL.at(-1) },
};
