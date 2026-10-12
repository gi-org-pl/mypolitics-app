import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import type { NewTraitCheckpointCard } from "@/types/checkpoint";
import type { Orientation } from "@/types/orientation";

import { SurveyCheckpointNewTrait } from "./SurveyCheckpointNewTrait";

// A white glyph of 16 px in the middle of a square of 32 px: the shape of a
// trait icon as a quiz supplies it.
const CROWN_ICON_URL = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path transform="translate(8 9.7)" fill="white" d="M13.2 10.97H2.8a.4.4 0 0 0-.4.4v.78c0 .21.18.39.4.39h10.4a.4.4 0 0 0 .4-.39v-.78a.4.4 0 0 0-.4-.4Zm1.6-7.83c-.66 0-1.2.52-1.2 1.17 0 .17.04.34.11.49L11.9 5.86a.81.81 0 0 1-1.1-.29L8.76 2.08A1.16 1.16 0 0 0 8 0a1.16 1.16 0 0 0-.76 2.08L5.2 5.57a.81.81 0 0 1-1.1.29L2.29 4.8c.07-.15.11-.32.11-.49a1.2 1.2 0 1 0-1.01 1.16l1.81 4.72h9.6l1.81-4.72A1.19 1.19 0 0 0 16 4.31c0-.65-.54-1.17-1.2-1.17Z"/></svg>',
)}`;

const LONG_NAME =
  "Radykalizm społeczno-gospodarczy z bardzo długą nazwą autorską, która nie mieści się w karcie";

const MONARCHISM: Orientation = {
  id: "monarchism",
  type: "ideology",
  name: "Monarchizm",
  imageUrl: CROWN_ICON_URL,
  color: "#9b51e0",
};

// A card as the engine hands it over: frozen at the boundary it fired at. The
// line is fixed by its place in the pool, so a story always shows the same
// words.
const CARD: NewTraitCheckpointCard = {
  type: "new-trait",
  boundary: 12,
  line: { pool: "new-trait", index: 0 },
  trait: MONARCHISM,
};

const meta = {
  title: "Survey/SurveyCheckpointNewTrait",
  component: SurveyCheckpointNewTrait,
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
} satisfies Meta<typeof SurveyCheckpointNewTrait>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoIcon: Story = {
  args: { card: { ...CARD, trait: { ...MONARCHISM, imageUrl: undefined } } },
};

export const NoColor: Story = {
  args: { card: { ...CARD, trait: { ...MONARCHISM, color: undefined } } },
};

export const LightColor: Story = {
  args: { card: { ...CARD, trait: { ...MONARCHISM, color: "#ffe066" } } },
};

// The pill cuts the name to one line; the statement wraps and shows it whole.
export const LongName: Story = {
  args: { card: { ...CARD, trait: { ...MONARCHISM, name: LONG_NAME } } },
};

export const NameWithQuotationMarks: Story = {
  args: {
    card: { ...CARD, trait: { ...MONARCHISM, name: 'Ruch „Wolność” i "Ład"' } },
  },
};

export const SecondLine: Story = {
  args: { card: { ...CARD, line: { pool: "new-trait", index: 1 } } },
};

export const ThirdLine: Story = {
  args: { card: { ...CARD, line: { pool: "new-trait", index: 2 } } },
};
