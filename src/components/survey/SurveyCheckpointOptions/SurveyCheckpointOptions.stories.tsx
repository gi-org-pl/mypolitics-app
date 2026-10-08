import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import type { Orientation } from "@/types/orientation";

import { SurveyCheckpointOptions } from "./SurveyCheckpointOptions";

// The rows alone, as wide as what they are put in. `TwoOptions` is the pair
// of the single axis puzzle frame.
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

const SCALES_ICON =
  '<path d="M16 8v15M10 23h12M9 11h14M9 11l-3 7h6l-3-7ZM23 11l-3 7h6l-3-7Z" fill="none" stroke="white" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';

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

const socialDemocracy: Orientation = {
  id: "social-democracy",
  type: "ideology",
  name: "Socjaldemokracja",
  imageUrl: createIconUrl(SCALES_ICON),
  color: "#9b59b6",
};

const meta = {
  title: "Survey/SurveyCheckpointOptions",
  component: SurveyCheckpointOptions,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    label: "Do czego jest Tobie bliżej? Zgadnij teraz!",
    options: [interventionism, freeMarket],
    onSelect: fn(),
  },
} satisfies Meta<typeof SurveyCheckpointOptions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TwoOptions: Story = {};

export const ThreeOptions: Story = {
  args: {
    options: [socialDemocracy, interventionism, freeMarket],
  },
};

export const LongNames: Story = {
  args: {
    options: [
      {
        ...interventionism,
        name: "Chrześcijańsko-demokratyczny konserwatyzm społeczno-gospodarczy w wydaniu suwerennościowym",
      },
      {
        ...freeMarket,
        name: "Liberalizm gospodarczy i światopoglądowy z bardzo długą nazwą autorską",
      },
    ],
  },
};

export const NoImages: Story = {
  args: {
    options: [
      { ...interventionism, imageUrl: undefined },
      { ...freeMarket, imageUrl: undefined },
    ],
  },
};

export const NoColours: Story = {
  args: {
    options: [
      { ...interventionism, imageUrl: undefined, color: undefined },
      { ...freeMarket, imageUrl: undefined, color: "not-a-colour" },
    ],
  },
};

// An image that does not load: the row shows its colour alone.
export const BrokenImage: Story = {
  args: {
    options: [
      { ...interventionism, imageUrl: "data:image/png;base64,broken" },
      freeMarket,
    ],
  },
};
