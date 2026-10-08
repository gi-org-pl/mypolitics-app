import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import type { HalfwayCheckpointCard } from "@/types/checkpoint";

import { SurveyCheckpointHalfway } from "./SurveyCheckpointHalfway";

// A card as the engine hands it over: frozen at the boundary it fired at. The
// line is fixed by its place in the pool, so a story always shows the same
// words.
const CARD: HalfwayCheckpointCard = {
  type: "halfway",
  boundary: 51,
  line: { pool: "halfway", index: 0 },
  percent: 50,
  minutes: 7,
};

const meta = {
  title: "Survey/SurveyCheckpointHalfway",
  component: SurveyCheckpointHalfway,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    card: CARD,
    onReveal: fn(),
    onContinue: fn(),
    onOptOut: fn(),
  },
} satisfies Meta<typeof SurveyCheckpointHalfway>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Five of nine questions: the number is the progress at the boundary.
export const OddQuiz: Story = {
  args: { card: { ...CARD, boundary: 5, percent: 55 } },
};

export const OneMinute: Story = {
  args: { card: { ...CARD, minutes: 1 } },
};

export const NinetyNineMinutes: Story = {
  args: { card: { ...CARD, minutes: 99 } },
};

export const SecondLine: Story = {
  args: { card: { ...CARD, line: { pool: "halfway", index: 1 } } },
};

export const ThirdLine: Story = {
  args: { card: { ...CARD, line: { pool: "halfway", index: 2 } } },
};
