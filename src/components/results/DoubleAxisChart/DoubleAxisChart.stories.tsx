import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import type { AxisOrientation } from "@/types/axis";

import { DoubleAxisChart } from "./DoubleAxisChart";

const createIconUrl = (content: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${content}</svg>`,
  )}`;

const createAvatarUrl = (color: string): string =>
  createIconUrl(
    `<rect width="32" height="32" fill="${color}"/><circle cx="16" cy="12" r="6" fill="white"/><path d="M4 32a12 12 0 0 1 24 0Z" fill="white"/>`,
  );

const PLACEHOLDER_ICON =
  '<path transform="translate(8 8)" fill-rule="evenodd" d="M0 0v16h16V0H0Zm2.28 1.33L8 7.06l5.72-5.73H2.28Zm12.39.95L8.94 8l5.73 5.72V2.28Zm-.95 12.39L8 8.94l-5.72 5.73h11.44ZM1.33 13.72 7.06 8 1.33 2.28v11.44Z" fill="white"/>';

const STARS_ICON = Array.from({ length: 12 }, (_, index) => {
  const angle = (index * Math.PI) / 6;
  const x = (16 + 6 * Math.cos(angle)).toFixed(2);
  const y = (16 + 6 * Math.sin(angle)).toFixed(2);

  return `<circle cx="${x}" cy="${y}" r="1" fill="white"/>`;
}).join("");

const CROSSED_STARS_ICON = `${STARS_ICON}<circle cx="16" cy="16" r="8.5" fill="none" stroke="white" stroke-width="1.5"/><path d="M10 10l12 12" stroke="white" stroke-width="1.5"/>`;

const orientationA: AxisOrientation = {
  id: "orientation-a",
  name: "Orientation A",
  imageUrl: createIconUrl(PLACEHOLDER_ICON),
  color: "#59b6a6",
};

const orientationB: AxisOrientation = {
  id: "orientation-b",
  name: "Orientation B",
  imageUrl: createIconUrl(PLACEHOLDER_ICON),
  color: "#bc831a",
};

const euroscepticism: AxisOrientation = {
  id: "euroscepticism",
  name: "Eurosceptycyzm",
  imageUrl: createIconUrl(CROSSED_STARS_ICON),
  color: "#b57459",
};

const federalism: AxisOrientation = {
  id: "federalism",
  name: "Federacjonizm",
  imageUrl: createIconUrl(STARS_ICON),
  color: "#1976be",
};

const friend: AxisOrientation = {
  id: "friend",
  name: "Ania",
  imageUrl: createAvatarUrl("#004554"),
  color: "#004554",
};

const meta = {
  title: "Results/DoubleAxisChart",
  component: DoubleAxisChart,
  args: {
    start: { orientation: euroscepticism, value: 69 },
    end: { orientation: federalism, value: 31 },
    onStatsClick: fn(),
    onInfoClick: fn(),
  },
} satisfies Meta<typeof DoubleAxisChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  args: {
    start: { orientation: orientationA, value: 69 },
    end: { orientation: orientationB, value: 31 },
  },
};

export const Example: Story = {};

export const Comparison: Story = {
  args: {
    comparison: { orientation: friend, value: 90 },
  },
};

export const Tie: Story = {
  args: {
    start: { orientation: euroscepticism, value: 50 },
    end: { orientation: federalism, value: 50 },
  },
};

export const NarrowLead: Story = {
  args: {
    start: { orientation: euroscepticism, value: 51 },
    end: { orientation: federalism, value: 49 },
  },
};

export const GapInTheMiddle: Story = {
  args: {
    start: { orientation: euroscepticism, value: 47 },
    end: { orientation: federalism, value: 31 },
  },
};

export const OneValueMissing: Story = {
  args: {
    start: { orientation: euroscepticism },
    end: { orientation: federalism, value: 31 },
  },
};

export const BothValuesMissing: Story = {
  args: {
    start: { orientation: euroscepticism },
    end: { orientation: federalism },
  },
};

export const SmallSide: Story = {
  args: {
    start: { orientation: euroscepticism, value: 92 },
    end: { orientation: federalism, value: 8 },
  },
};

export const CustomMarker: Story = {
  args: {
    marker: 75,
  },
};

export const NoMarker: Story = {
  args: {
    marker: false,
  },
};

export const LongNames: Story = {
  args: {
    start: {
      orientation: {
        ...euroscepticism,
        name: "Eurosceptycyzm z bardzo długą nazwą autorską, która nie mieści się w tytule",
      },
      value: 50,
    },
    end: {
      orientation: {
        ...federalism,
        name: "Federacjonizm z równie długą nazwą autorską, która nie mieści się pod osią",
      },
      value: 50,
    },
  },
};

export const NoColor: Story = {
  args: {
    start: { orientation: { ...euroscepticism, color: undefined }, value: 69 },
    end: { orientation: { ...federalism, color: undefined }, value: 31 },
  },
};

export const NoImage: Story = {
  args: {
    start: {
      orientation: { ...euroscepticism, imageUrl: undefined },
      value: 69,
    },
    end: { orientation: { ...federalism, imageUrl: undefined }, value: 31 },
  },
};
