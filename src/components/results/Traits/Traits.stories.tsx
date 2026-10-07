import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import type { AxisOrientation } from "@/types/axis";

import { Traits } from "./Traits";

const createIconUrl = (path: string, offset: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path transform="translate(${offset})" fill-rule="evenodd" d="${path}" fill="white"/></svg>`,
  )}`;

const createAvatarUrl = (color: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="${color}"/><circle cx="16" cy="12" r="6" fill="white"/><path d="M4 32a12 12 0 0 1 24 0Z" fill="white"/></svg>`,
  )}`;

const placeholderIconUrl = createIconUrl(
  "M0 0v16h16V0H0Zm2.28 1.33L8 7.06l5.72-5.73H2.28Zm12.39.95L8.94 8l5.73 5.72V2.28Zm-.95 12.39L8 8.94l-5.72 5.73h11.44ZM1.33 13.72 7.06 8 1.33 2.28v11.44Z",
  "8 8",
);

const placeholderTraits: AxisOrientation[] = [
  {
    id: "a",
    name: "Orientation A",
    imageUrl: placeholderIconUrl,
    color: "#192430",
  },
  { id: "b", name: "Or. B", imageUrl: placeholderIconUrl, color: "#b69d59" },
  {
    id: "c",
    name: "Orientation C",
    imageUrl: placeholderIconUrl,
    color: "#9b51e0",
  },
];

const proChoice: AxisOrientation = {
  id: "pro-choice",
  name: "Pro-choice",
  imageUrl: createIconUrl(
    "M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM1.6 8c0-1.48.5-2.83 1.35-3.92l8.97 8.97A6.4 6.4 0 0 1 1.6 8Zm11.45 3.92L4.08 2.95a6.4 6.4 0 0 1 8.97 8.97Z",
    "8 8",
  ),
  color: "#851c22",
};

const proEuro: AxisOrientation = {
  id: "pro-euro",
  name: "Pro-Euro",
  imageUrl: createIconUrl(
    "M1.5 7.5v1H1a1 1 0 0 0 0 2h.88A6.75 6.75 0 0 0 8.25 15H9a1 1 0 1 0 0-2h-.75a4.75 4.75 0 0 1-4.18-2.5H8a1 1 0 1 0 0-2H3.5v-1H8a1 1 0 0 0 0-2H4.07A4.75 4.75 0 0 1 8.25 3H9a1 1 0 0 0 0-2h-.75a6.75 6.75 0 0 0-6.37 4.5H1a1 1 0 0 0 0 2h.5Z",
    "11 8",
  ),
  color: "#b69d59",
};

const anarchism: AxisOrientation = {
  id: "anarchism",
  name: "Anarchizm",
  imageUrl: createIconUrl(
    "M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm0 1.7c.37 0 .73.03 1.08.1L8 4.1 6.92 1.8c.35-.07.71-.1 1.08-.1ZM5.4 2.27 2.5 8.4h-.78a6.3 6.3 0 0 1 3.68-6.13Zm5.2 0a6.3 6.3 0 0 1 3.68 6.13h-.78l-2.9-6.13ZM8 6.5l.9 1.9H7.1L8 6.5ZM6.4 9.9h3.2l1.5 3.17a6.27 6.27 0 0 1-6.2 0L6.4 9.9Zm-4.4 0h.8l-.2.42c-.24-.13-.44-.27-.6-.42Zm11.2 0h.8c-.16.15-.36.29-.6.42l-.2-.42Z",
    "8 8",
  ),
  color: "#192430",
};

const proGun: AxisOrientation = {
  id: "pro-gun",
  name: "Pro-gun",
  imageUrl: createIconUrl(
    "M0 3h15.5v1H16v2.5h-5.2c-.3 0-.55.2-.63.5L9.7 8.7a1 1 0 0 1-.96.8H6.9l-1.4 3.5H1.6l1.6-4.6A1.6 1.6 0 0 1 0 6.9V3Zm7.2 4.9h1.3l.3-1.1H7.2v1.1Z",
    "8 8",
  ),
  color: "#324c51",
};

const monarchism: AxisOrientation = {
  id: "monarchism",
  name: "Monarchizm",
  imageUrl: createIconUrl(
    "M13.2 10.97H2.8a.4.4 0 0 0-.4.4v.78c0 .21.18.39.4.39h10.4a.4.4 0 0 0 .4-.39v-.78a.4.4 0 0 0-.4-.4Zm1.6-7.83c-.66 0-1.2.52-1.2 1.17 0 .17.04.34.11.49L11.9 5.86a.81.81 0 0 1-1.1-.29L8.76 2.08A1.16 1.16 0 0 0 8 0a1.16 1.16 0 0 0-.76 2.08L5.2 5.57a.81.81 0 0 1-1.1.29L2.29 4.8c.07-.15.11-.32.11-.49a1.2 1.2 0 1 0-1.01 1.16l1.81 4.72h9.6l1.81-4.72A1.19 1.19 0 0 0 16 4.31c0-.65-.54-1.17-1.2-1.17Z",
    "8 9.7",
  ),
  color: "#9b51e0",
};

const exampleTraits = [proChoice, proEuro, anarchism, proGun, monarchism];
const takerIds = ["anarchism", "pro-choice", "monarchism"];
const friendIds = ["pro-choice", "pro-euro", "pro-gun"];

const friend: AxisOrientation = {
  id: "friend",
  name: "Ania",
  imageUrl: createAvatarUrl("#004554"),
};

const LONG_NAME =
  "Radykalizm społeczno-gospodarczy z bardzo długą nazwą autorską, która nie mieści się w karcie";

const manyTraits: AxisOrientation[] = Array.from({ length: 4 }, (_, round) =>
  exampleTraits.map((trait) => ({
    ...trait,
    id: `${trait.id}-${round}`,
    name: round === 0 ? trait.name : `${trait.name} ${round + 1}`,
  })),
).flat();

const meta = {
  title: "Results/Traits",
  component: Traits,
  args: {
    title: "Cechy",
    traits: exampleTraits,
    earnedIds: takerIds,
    onStatsClick: fn(),
    onInfoClick: fn(),
  },
} satisfies Meta<typeof Traits>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  args: {
    title: "Title",
    traits: placeholderTraits,
    earnedIds: ["a", "b", "c"],
  },
};

export const Example: Story = {
  args: {
    traits: [anarchism, proChoice, monarchism],
  },
};

export const Comparison: Story = {
  args: {
    comparison: { party: friend, earnedIds: friendIds },
  },
};

export const Empty: Story = {
  args: {
    earnedIds: [],
  },
};

export const EmptyForBoth: Story = {
  args: {
    earnedIds: [],
    comparison: { party: friend, earnedIds: [] },
  },
};

export const OnlyTheirs: Story = {
  args: {
    earnedIds: [],
    comparison: { party: friend, earnedIds: friendIds },
  },
};

export const ManyTraits: Story = {
  args: {
    traits: manyTraits,
    earnedIds: manyTraits.map((trait) => trait.id),
  },
};

export const LongName: Story = {
  args: {
    traits: [{ ...proChoice, name: LONG_NAME }, anarchism],
    earnedIds: ["pro-choice", "anarchism"],
    comparison: { party: friend, earnedIds: ["pro-choice"] },
  },
};

export const NoIcon: Story = {
  args: {
    traits: exampleTraits.map((trait) => ({ ...trait, imageUrl: undefined })),
  },
};

export const NoColor: Story = {
  args: {
    traits: exampleTraits.map((trait) => ({ ...trait, color: undefined })),
    comparison: { party: friend, earnedIds: friendIds },
  },
};

export const LightColor: Story = {
  args: {
    traits: [
      { ...proChoice, color: "#ffe066" },
      { ...proEuro, color: "#ecf0f2" },
      { ...anarchism, color: "oklch(0.9 0.08 150)" },
      proGun,
      monarchism,
    ],
    comparison: { party: friend, earnedIds: friendIds },
  },
};

export const ComparisonWithoutAvatar: Story = {
  args: {
    comparison: {
      party: { ...friend, imageUrl: undefined },
      earnedIds: friendIds,
    },
  },
};
