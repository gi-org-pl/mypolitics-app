import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import type { AxisEntry } from "@/types/axis";
import type {
  AxisPuzzleCheckpointCard,
  CheckpointLine,
  CheckpointOutcome,
} from "@/types/checkpoint";
import type { Orientation } from "@/types/orientation";

import { SurveyCheckpointAxisPuzzle } from "./SurveyCheckpointAxisPuzzle";

// The card as the engine hands it over: frozen, with the ask line fixed by
// its place in the pool. The values of `Ask`, `Hit` and `Miss` are the ones
// the Figma frames draw, and the reveal is always the first line of its pool.
const createIconUrl = (content: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${content}</svg>`,
  )}`;

const GEAR_ICON = `${Array.from(
  { length: 8 },
  (_, index) =>
    `<rect x="14" y="7" width="4" height="5" rx="1" fill="white" transform="rotate(${index * 45} 16 16)"/>`,
).join(
  "",
)}<circle cx="16" cy="16" r="4.5" fill="none" stroke="white" stroke-width="4"/>`;

const BANKNOTE_ICON =
  '<rect x="6.5" y="10.5" width="19" height="11" rx="1.5" fill="none" stroke="white" stroke-width="2"/><circle cx="16" cy="16" r="2.5" fill="white"/>';

const interventionism: Orientation = {
  id: "interventionism",
  type: "ideology",
  name: "Interwencjonizm",
  imageUrl: createIconUrl(GEAR_ICON),
  color: "#e74c3c",
};

const freeMarket: Orientation = {
  id: "free-market",
  type: "ideology",
  name: "Wolny rynek",
  imageUrl: createIconUrl(BANKNOTE_ICON),
  color: "#2ecc71",
};

const LONG_START_NAME =
  "Chrześcijańsko-demokratyczny konserwatyzm społeczno-gospodarczy w wydaniu suwerennościowym";
const LONG_END_NAME =
  "Liberalizm gospodarczy i światopoglądowy z bardzo długą nazwą autorską";

const createCard = (
  start: AxisEntry,
  end: AxisEntry,
  index = 0,
): AxisPuzzleCheckpointCard => ({
  type: "axis-puzzle",
  boundary: 11,
  axisId: "economy",
  start,
  end,
  leadingSide: (end.value ?? 0) > (start.value ?? 0) ? "end" : "start",
  line: { pool: "axis-puzzle-ask", index },
});

const reveal = (outcome: CheckpointOutcome, index = 0): CheckpointLine => ({
  pool: outcome === "hit" ? "axis-puzzle-hit" : "axis-puzzle-miss",
  index,
});

const pick =
  (name: string): Story["play"] =>
  async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name }));
  };

const meta = {
  title: "Survey/SurveyCheckpointAxisPuzzle",
  component: SurveyCheckpointAxisPuzzle,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    card: createCard(
      { orientation: interventionism, value: 44.35 },
      { orientation: freeMarket, value: 55.65 },
    ),
    onReveal: fn((outcome: CheckpointOutcome) => reveal(outcome)),
    onContinue: fn(),
    onOptOut: fn(),
  },
} satisfies Meta<typeof SurveyCheckpointAxisPuzzle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ask: Story = {};

export const Hit: Story = {
  play: pick("Wolny rynek"),
};

export const Miss: Story = {
  play: pick("Interwencjonizm"),
};

// Long names: whole in the rows, cut under the bar by the bar, and whole in
// the statement of a miss that names the leading pole.
export const LongNames: Story = {
  args: {
    card: createCard(
      { orientation: { ...interventionism, name: LONG_START_NAME }, value: 72 },
      { orientation: { ...freeMarket, name: LONG_END_NAME }, value: 28 },
    ),
  },
};

export const LongNamesRevealed: Story = {
  args: {
    ...LongNames.args,
    onReveal: fn((outcome: CheckpointOutcome) => reveal(outcome, 1)),
  },
  play: pick(LONG_END_NAME),
};

export const NoImages: Story = {
  args: {
    card: createCard(
      { orientation: { ...interventionism, imageUrl: undefined }, value: 69 },
      { orientation: { ...freeMarket, imageUrl: undefined }, value: 31 },
    ),
  },
};

export const NoColours: Story = {
  args: {
    card: createCard(
      {
        orientation: {
          ...interventionism,
          imageUrl: undefined,
          color: undefined,
        },
        value: 69,
      },
      {
        orientation: { ...freeMarket, imageUrl: undefined, color: undefined },
        value: 31,
      },
    ),
  },
};

// Revealed, with the gap the two values leave in the middle.
export const ValuesShortOfHundred: Story = {
  args: {
    card: createCard(
      { orientation: interventionism, value: 45 },
      { orientation: freeMarket, value: 20 },
    ),
  },
  play: pick("Interwencjonizm"),
};

// Revealed, with the fills scaled by the bar to share the track.
export const ValuesOverHundred: Story = {
  args: {
    card: createCard(
      { orientation: interventionism, value: 90 },
      { orientation: freeMarket, value: 60 },
    ),
  },
  play: pick("Interwencjonizm"),
};
