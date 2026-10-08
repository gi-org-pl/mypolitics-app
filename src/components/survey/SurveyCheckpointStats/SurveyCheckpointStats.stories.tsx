import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import type { StatsCheckpointCard } from "@/types/checkpoint";

import { SurveyCheckpointStats } from "./SurveyCheckpointStats";

// A card as the engine hands it over: frozen when it fired, with its own three
// totals and its percent. The line is fixed by its place in the pool, so a
// story always shows the same words. No story asks any source for counts.
const CARD: StatsCheckpointCard = {
  type: "stats",
  boundary: 5,
  line: { pool: "stats-for", index: 0 },
  questionId: "q5",
  thesis: "Wielka Polska Katolicka w silnej chrześcijańskiej Europie.",
  side: "for",
  counts: { for: 100, against: 600, noAnswer: 300 },
  percent: 10,
};

const AGAINST_CARD: StatsCheckpointCard = {
  ...CARD,
  line: { pool: "stats-against", index: 0 },
  side: "against",
  counts: { for: 620, against: 80, noAnswer: 300 },
  percent: 8,
};

const meta = {
  title: "Survey/SurveyCheckpointStats",
  component: SurveyCheckpointStats,
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
} satisfies Meta<typeof SurveyCheckpointStats>;

export default meta;

type Story = StoryObj<typeof meta>;

// The one state of the frame: 100 for, 600 against, 300 without an answer.
export const For: Story = {};

// The taker disagreed and disagreement is rare.
export const Against: Story = {
  args: { card: AGAINST_CARD },
};

// A count of zero for the taker's side: no slice, the legend row stays, and
// the statement reads 1%.
export const NobodyOnTheTakersSide: Story = {
  args: {
    card: {
      ...CARD,
      counts: { for: 0, against: 700, noAnswer: 300 },
      percent: 1,
    },
  },
};

// One result in a few thousand: the slice is still seen.
export const TinySlice: Story = {
  args: {
    card: {
      ...CARD,
      counts: { for: 1, against: 2600, noAnswer: 399 },
      percent: 1,
    },
  },
};

// Nobody skipped the question: two slices.
export const NoSkips: Story = {
  args: {
    card: {
      ...CARD,
      counts: { for: 80, against: 920, noAnswer: 0 },
      percent: 8,
    },
  },
};

// One count holds everything: a full circle in the colour of that slice.
export const EveryoneOnTheOtherSide: Story = {
  args: {
    card: {
      ...CARD,
      counts: { for: 0, against: 1000, noAnswer: 0 },
      percent: 1,
    },
  },
};

export const LongThesis: Story = {
  args: {
    card: {
      ...CARD,
      thesis:
        "Państwo powinno w pełni finansować z budżetu ochronę zdrowia, edukację na każdym poziomie, transport publiczny w miastach i poza nimi oraz budowę mieszkań na wynajem, nawet jeśli oznacza to wyraźnie wyższe podatki dla wszystkich pracujących i dla przedsiębiorstw.",
    },
  },
};

export const ThesisWithQuotationMarks: Story = {
  args: {
    card: {
      ...CARD,
      thesis: "Hasło „Polska dla Polaków” powinno być zakazane.",
    },
  },
};

// The closing mark of a thesis is kept; only a closing full stop is left out.
export const ThesisWithQuestionMark: Story = {
  args: {
    card: {
      ...CARD,
      thesis: "Czy Polska powinna przyjąć euro?",
    },
  },
};

export const SecondLine: Story = {
  args: { card: { ...CARD, line: { pool: "stats-for", index: 1 } } },
};

export const ThirdLine: Story = {
  args: { card: { ...CARD, line: { pool: "stats-for", index: 2 } } },
};

export const AgainstSecondLine: Story = {
  args: {
    card: { ...AGAINST_CARD, line: { pool: "stats-against", index: 1 } },
  },
};

export const AgainstThirdLine: Story = {
  args: {
    card: { ...AGAINST_CARD, line: { pool: "stats-against", index: 2 } },
  },
};
