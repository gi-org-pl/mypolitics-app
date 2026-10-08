import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import type {
  CheckpointLine,
  CheckpointOutcome,
  PositionPuzzleCheckpointCard,
} from "@/types/checkpoint";
import type { Orientation } from "@/types/orientation";

import { SurveyCheckpointPositionPuzzle } from "./SurveyCheckpointPositionPuzzle";

// The card as the engine hands it over: frozen, with the ask line fixed by
// its place in the pool and the three rows in the order of the Figma frames.
// The reveal is always the first line of its pool. Every archetype has a
// colour of its own, which the card must never show.
const createPortraitUrl = (skin: string, hair: string, shirt: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#f4f6f7"/><path d="M4 32c0-7 5-11 12-11s12 4 12 11z" fill="${shirt}"/><circle cx="16" cy="13" r="6.5" fill="${skin}"/><path d="M9 12c0-5 3-8 7-8s7 3 7 8c-2-3-4-4-7-4s-5 1-7 4z" fill="${hair}"/></svg>`,
  )}`;

const greenProgressive: Orientation = {
  id: "green-progressive",
  type: "identity",
  name: "Zielony postępowiec",
  imageUrl: createPortraitUrl("#f1c9a5", "#8a5a2b", "#4caf50"),
  color: "#e91e63",
};

const nationalConservative: Orientation = {
  id: "national-conservative",
  type: "identity",
  name: "Narodowy konserwatysta",
  imageUrl: createPortraitUrl("#f1c9a5", "#5d4037", "#eceff1"),
  color: "#3f51b5",
};

const sovereignPatriot: Orientation = {
  id: "sovereign-patriot",
  type: "identity",
  name: "Suwerenny patriota",
  imageUrl: createPortraitUrl("#e0ac69", "#212121", "#37474f"),
  color: "#ff5722",
};

const OPTIONS = [greenProgressive, nationalConservative, sovereignPatriot];

const LONG_NAMES = [
  "Zielony postępowiec o bardzo długiej nazwie autorskiej, wrażliwy społecznie i proeuropejski",
  "Chrześcijańsko-demokratyczny konserwatysta społeczno-gospodarczy w wydaniu suwerennościowym",
  "Wolnorynkowy liberał gospodarczy i światopoglądowy z bardzo długą nazwą autorską",
];

// The first option is the leader.
const createCard = (
  closeness: number,
  options: Orientation[] = OPTIONS,
): PositionPuzzleCheckpointCard => ({
  type: "position-puzzle",
  boundary: 11,
  leader: options[0],
  closeness,
  options,
  line: { pool: "position-puzzle-ask", index: 0 },
});

const reveal = (outcome: CheckpointOutcome): CheckpointLine => ({
  pool: outcome === "hit" ? "position-puzzle-hit" : "position-puzzle-miss",
  index: 0,
});

const pick =
  (name: string): Story["play"] =>
  async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name }));
  };

const meta = {
  title: "Survey/SurveyCheckpointPositionPuzzle",
  component: SurveyCheckpointPositionPuzzle,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    card: createCard(79),
    onReveal: fn((outcome: CheckpointOutcome) => reveal(outcome)),
    onContinue: fn(),
    onOptOut: fn(),
  },
} satisfies Meta<typeof SurveyCheckpointPositionPuzzle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ask: Story = {};

export const Hit: Story = {
  args: {
    card: createCard(86),
  },
  play: pick("Zielony postępowiec"),
};

export const Miss: Story = {
  play: pick("Suwerenny patriota"),
};

export const HitPartialMatch: Story = {
  args: {
    card: createCard(64),
  },
  play: pick("Zielony postępowiec"),
};

export const HitMatch: Story = {
  args: {
    card: createCard(80),
  },
  play: pick("Zielony postępowiec"),
};

export const FullBar: Story = {
  args: {
    card: createCard(100),
  },
};

const longNameOptions = OPTIONS.map((option, index) => ({
  ...option,
  name: LONG_NAMES[index],
}));

export const LongNames: Story = {
  args: {
    card: createCard(72, longNameOptions),
  },
};

export const LongNamesHit: Story = {
  args: LongNames.args,
  play: pick(LONG_NAMES[0]),
};

const noImageOptions = OPTIONS.map((option) => ({
  ...option,
  imageUrl: undefined,
}));

export const NoImages: Story = {
  args: {
    card: createCard(58, noImageOptions),
  },
};

export const NoImagesHit: Story = {
  args: NoImages.args,
  play: pick("Zielony postępowiec"),
};
