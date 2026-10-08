import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import type { AxisEntry } from "@/types/axis";
import type { AxisClosenessCheckpointCard } from "@/types/checkpoint";
import type { Orientation } from "@/types/orientation";

import { SurveyCheckpointAxisCloseness } from "./SurveyCheckpointAxisCloseness";

// The card as the engine hands it over: frozen, with the line fixed by its
// place in the pool. The values of `Single` and `Double` are the ones the
// Figma frames draw.
const createIconUrl = (content: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${content}</svg>`,
  )}`;

const FIST_ICON =
  '<path transform="translate(10 8)" fill-rule="evenodd" d="M5 0c.55 0 1 .45 1 1v3.5H4V1c0-.55.45-1 1-1ZM1 2c0-.55.45-1 1-1s1 .45 1 1v2.5H1V2Zm6 0c0-.55.45-1 1-1s1 .45 1 1v3c0 .55-.45 1-1 1s-1-.45-1-1V2Zm3 2c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1s-1-.45-1-1V4ZM7 6.75v-.02c.29.17.63.27 1 .27.41 0 .79-.13 1.11-.34A2 2 0 0 0 11 8c.37 0 .71-.1 1-.27V8a5 5 0 0 1-2 4v3c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1v-2.45a5 5 0 0 1-1.47-1.02l-.36-.36A4 4 0 0 1 0 8.34V7.5c0-1.1.9-2 2-2h2.75a1.25 1.25 0 0 1 0 2.5H3a.5.5 0 0 0 0 1h1.75C5.99 9 7 7.99 7 6.75Z" fill="white"/>';

const STARS_ICON = Array.from({ length: 12 }, (_, index) => {
  const angle = (index * Math.PI) / 6;
  const x = (16 + 6 * Math.cos(angle)).toFixed(2);
  const y = (16 + 6 * Math.sin(angle)).toFixed(2);

  return `<circle cx="${x}" cy="${y}" r="1" fill="white"/>`;
}).join("");

const CROSSED_STARS_ICON = `${STARS_ICON}<circle cx="16" cy="16" r="8.5" fill="none" stroke="white" stroke-width="1.5"/><path d="M10 10l12 12" stroke="white" stroke-width="1.5"/>`;

const radicalism: Orientation = {
  id: "radicalism",
  type: "ideology",
  name: "Radykalizm",
  imageUrl: createIconUrl(FIST_ICON),
  color: "#924747",
};

const euroscepticism: Orientation = {
  id: "euroscepticism",
  type: "ideology",
  name: "Eurosceptycyzm",
  imageUrl: createIconUrl(CROSSED_STARS_ICON),
  color: "#b67559",
};

const federalism: Orientation = {
  id: "federalism",
  type: "ideology",
  name: "Federacjonizm",
  imageUrl: createIconUrl(STARS_ICON),
  color: "#1a79bc",
};

const createSingleCard = (
  entry: AxisEntry,
  index = 0,
): AxisClosenessCheckpointCard => ({
  type: "axis-closeness",
  variant: "single",
  boundary: 11,
  axisId: "radicalism",
  entry,
  line: { pool: "axis-closeness-single", index },
});

const createDoubleCard = (
  start: AxisEntry,
  end: AxisEntry,
  index = 0,
): AxisClosenessCheckpointCard => ({
  type: "axis-closeness",
  variant: "double",
  boundary: 11,
  axisId: "european-union",
  start,
  end,
  leadingSide: (end.value ?? 0) > (start.value ?? 0) ? "end" : "start",
  line: { pool: "axis-closeness-double", index },
});

const meta = {
  title: "Survey/SurveyCheckpointAxisCloseness",
  component: SurveyCheckpointAxisCloseness,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    card: createSingleCard({ orientation: radicalism, value: 64 }),
    onReveal: fn(),
    onContinue: fn(),
    onOptOut: fn(),
  },
} satisfies Meta<typeof SurveyCheckpointAxisCloseness>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Single: Story = {};

export const Double: Story = {
  args: {
    card: createDoubleCard(
      { orientation: euroscepticism, value: 69 },
      { orientation: federalism, value: 31 },
    ),
  },
};

// The end side is ahead: the bar keeps its sides, and only the title and the
// statement name the leader.
export const DoubleEndLeading: Story = {
  args: {
    card: createDoubleCard(
      { orientation: euroscepticism, value: 31 },
      { orientation: federalism, value: 69 },
    ),
  },
};

export const DoubleWithGap: Story = {
  args: {
    card: createDoubleCard(
      { orientation: euroscepticism, value: 45 },
      { orientation: federalism, value: 20 },
    ),
  },
};

export const DoubleOverTrack: Story = {
  args: {
    card: createDoubleCard(
      { orientation: euroscepticism, value: 90 },
      { orientation: federalism, value: 60 },
    ),
  },
};

export const SingleFull: Story = {
  args: {
    card: createSingleCard({ orientation: radicalism, value: 100 }),
  },
};

export const DoubleOneSided: Story = {
  args: {
    card: createDoubleCard(
      { orientation: euroscepticism, value: 100 },
      { orientation: federalism, value: 0 },
    ),
  },
};

export const NoImage: Story = {
  args: {
    card: createDoubleCard(
      { orientation: { ...euroscepticism, imageUrl: undefined }, value: 69 },
      { orientation: { ...federalism, imageUrl: undefined }, value: 31 },
    ),
  },
};

export const NoColor: Story = {
  args: {
    card: createSingleCard({
      orientation: { ...radicalism, imageUrl: undefined, color: undefined },
      value: 80,
    }),
  },
};

export const LongNames: Story = {
  args: {
    card: createDoubleCard(
      {
        orientation: {
          ...euroscepticism,
          name: "Chrześcijańsko-demokratyczny konserwatyzm społeczno-gospodarczy w wydaniu suwerennościowym",
        },
        value: 72,
      },
      {
        orientation: {
          ...federalism,
          name: "Liberalizm gospodarczy i światopoglądowy z bardzo długą nazwą autorską",
        },
        value: 28,
      },
    ),
  },
};

export const NameWithQuotationMarks: Story = {
  args: {
    card: createSingleCard({
      orientation: { ...radicalism, name: "Państwo „minimum”" },
      value: 85,
    }),
  },
};

export const SecondLine: Story = {
  args: {
    card: createSingleCard({ orientation: radicalism, value: 64 }, 1),
  },
};

export const ThirdLine: Story = {
  args: {
    card: createSingleCard({ orientation: radicalism, value: 64 }, 2),
  },
};

export const DoubleSecondLine: Story = {
  args: {
    card: createDoubleCard(
      { orientation: euroscepticism, value: 69 },
      { orientation: federalism, value: 31 },
      1,
    ),
  },
};

export const DoubleThirdLine: Story = {
  args: {
    card: createDoubleCard(
      { orientation: euroscepticism, value: 69 },
      { orientation: federalism, value: 31 },
      2,
    ),
  },
};
