import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { createOrientation } from "@/utils/vitest/createOrientation";

import type { RankedBadge, RankedEntry } from "../RankedRow/RankedRow.types";
import { HorizontalBarChart } from "./HorizontalBarChart";
import type { RankedCategory } from "./HorizontalBarChart.types";

const toDataUrl = (svg: string): string =>
  `data:image/svg+xml,${encodeURIComponent(svg)}`;

const placeholderImageUrl = toDataUrl(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#dcdfe3"/><rect x="8.5" y="8.5" width="15" height="15" fill="none" stroke="white"/><path d="M8.5 8.5l15 15M23.5 8.5l-15 15" stroke="white"/></svg>',
);

const createPortraitUrl = (color: string): string =>
  toDataUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="${color}"/><circle cx="16" cy="12" r="6" fill="white"/><path d="M4 32a12 12 0 0 1 24 0z" fill="white"/></svg>`,
  );

const placeholderBadge: RankedBadge = {
  iconUrl: toDataUrl(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><path d="M1 1h10v10H1zM1 1l10 10M11 1L1 11" fill="none" stroke="#004554" stroke-width="1.2"/></svg>',
  ),
  label: "Badge",
};

const verifiedIconUrl = toDataUrl(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" fill="none" stroke="#004554" stroke-width="1.4"/><path d="M3.8 6.1l1.6 1.6 2.9-3.2" fill="none" stroke="#004554" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
);

const verifiedBadge: RankedBadge = {
  iconUrl: verifiedIconUrl,
  label: "Zweryfikowany",
};

const officialBadge: RankedBadge = {
  iconUrl: verifiedIconUrl,
  text: "Oficjalne",
};

const COLORS = [
  "#d5213d",
  "#730041",
  "#b5123e",
  "#f9c200",
  "#16213f",
  "#0a1128",
  "#14356e",
  "#3f6fb5",
];

const [a, b, c, d, e, f, g, h] = ["A", "B", "C", "D", "E", "F", "G", "H"].map(
  (letter, index) =>
    createOrientation(letter.toLowerCase(), `Orientation ${letter}`, {
      imageUrl: placeholderImageUrl,
      color: COLORS[index],
    }),
);

const entries: RankedEntry[] = [
  { orientation: a, value: 100, badge: placeholderBadge },
  { orientation: b, value: 90 },
  { orientation: c, value: 80, badge: placeholderBadge },
  { orientation: d, value: 60 },
  { orientation: e, value: 52 },
  { orientation: f, value: 50, badge: placeholderBadge },
  { orientation: g, value: 20 },
  { orientation: h, value: 1 },
];

const categories: RankedCategory[] = [
  {
    name: "Category A",
    entries: [
      { orientation: a, value: 40 },
      {
        orientation: b,
        value: 65,
        badge: { ...placeholderBadge, text: "Badge Text" },
      },
      { orientation: c, value: 60, badge: placeholderBadge },
      { orientation: d, value: 30 },
      { orientation: e, value: 25 },
      { orientation: f, value: 20, badge: placeholderBadge },
      { orientation: g, value: 15 },
      { orientation: h, value: 1 },
    ],
  },
  {
    name: "Category B",
    entries: [
      { orientation: d, value: 60 },
      { orientation: a, value: 35 },
    ],
  },
  {
    name: "Category C",
    entries: [{ orientation: a, value: 0 }, { orientation: b }],
  },
  {
    name: "Category D",
    entries: [
      { orientation: g, value: 75 },
      { orientation: e, value: 10 },
    ],
  },
];

const [
  trzaskowski,
  zandberg,
  biejat,
  holownia,
  mentzen,
  jakubiak,
  nawrocki,
  braun,
] = [
  ["trzaskowski", "Rafał Trzaskowski"],
  ["zandberg", "Adrian Zandberg"],
  ["biejat", "Magdalena Biejat"],
  ["holownia", "Szymon Hołownia"],
  ["mentzen", "Sławomir Mentzen"],
  ["jakubiak", "Marek Jakubiak"],
  ["nawrocki", "Karol Nawrocki"],
  ["braun", "Grzegorz Braun"],
].map(([id, name], index) =>
  createOrientation(id, name, {
    type: "party",
    color: COLORS[index],
    imageUrl: createPortraitUrl(COLORS[index]),
  }),
);

const orientations: RankedEntry[] = [
  { orientation: trzaskowski, value: 100, badge: verifiedBadge },
  { orientation: zandberg, value: 90 },
  { orientation: biejat, value: 80, badge: verifiedBadge },
  { orientation: holownia, value: 60 },
  { orientation: mentzen, value: 52, badge: officialBadge },
  { orientation: jakubiak, value: 50 },
  { orientation: nawrocki, value: 20 },
  { orientation: braun, value: 1 },
];

const orientationCategories: RankedCategory[] = [
  {
    name: "Światopogląd",
    entries: [
      { orientation: zandberg, value: 65 },
      { orientation: biejat, value: 60, badge: verifiedBadge },
      { orientation: trzaskowski, value: 40, badge: verifiedBadge },
      { orientation: holownia, value: 30 },
      { orientation: mentzen, value: 25, badge: verifiedBadge },
      { orientation: jakubiak, value: 20 },
      { orientation: nawrocki, value: 15 },
      { orientation: braun, value: 1 },
    ],
  },
  {
    name: "Polityka krajowa",
    entries: [
      { orientation: holownia, value: 60 },
      { orientation: trzaskowski, value: 45 },
    ],
  },
  {
    name: "Gospodarka",
    entries: [
      { orientation: mentzen, value: 85, badge: verifiedBadge },
      { orientation: jakubiak, value: 40 },
    ],
  },
  {
    name: "Polityka zagraniczna",
    entries: [
      { orientation: nawrocki, value: 75 },
      { orientation: braun, value: 30 },
    ],
  },
];

const friend = createOrientation("friend", "Ania", {
  type: "person",
  color: "#004554",
  imageUrl: createPortraitUrl("#004554"),
});

const LONG_NAME =
  "Socjaldemokratyczny liberalizm instytucjonalny o bardzo długiej autorskiej nazwie";

const meta = {
  title: "Results/HorizontalBarChart",
  component: HorizontalBarChart,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    title: "Title",
    onStatsClick: fn(),
    onInfoClick: fn(),
  },
} satisfies Meta<typeof HorizontalBarChart>;

export default meta;

type Story = StoryObj<typeof meta>;

const press =
  (name: string): Story["play"] =>
  async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name }));
  };

export const FlatFolded: Story = {
  args: { entries },
};

export const FlatOpen: Story = {
  args: { entries },
  play: press("Pokaż wszystkie"),
};

export const Grouped: Story = {
  args: { categories },
};

export const CategoryOpen: Story = {
  args: { categories },
  play: press("Pokaż kategorię: Category A"),
};

export const Ranking: Story = {
  args: { title: "Kandydaci", entries: orientations },
};

export const RankingComparison: Story = {
  args: {
    title: "Kandydaci",
    entries: orientations,
    comparison: {
      orientation: friend,
      values: { zandberg: 62, biejat: 86, unknown: 40 },
    },
  },
};

export const RankingOpen: Story = {
  args: { title: "Kandydaci", entries: orientations },
  play: press("Pokaż wszystkie"),
};

export const RankingGrouped: Story = {
  args: { title: "Kandydaci", categories: orientationCategories },
};

export const RankingCategoryOpen: Story = {
  args: { title: "Kandydaci", categories: orientationCategories },
  play: press("Pokaż kategorię: Światopogląd"),
};

export const NothingBehindTheFold: Story = {
  args: { entries: entries.slice(0, 3) },
};

export const CustomVisibleRows: Story = {
  args: { entries, visibleRows: 5 },
};

export const CategoryWithoutResult: Story = {
  args: {
    categories: [
      {
        name: "Category C",
        entries: [{ orientation: a, value: 0 }, { orientation: b }],
      },
    ],
  },
};

export const EmptyCategory: Story = {
  args: {
    categories: [{ name: "Category A", entries: [] }, categories[1]],
  },
};

export const EqualValues: Story = {
  args: {
    entries: [
      { orientation: a, value: 50 },
      { orientation: b, value: 50 },
      { orientation: c, value: 50 },
    ],
  },
};

export const MissingValues: Story = {
  args: {
    entries: [
      { orientation: a },
      { orientation: b, value: 40 },
      { orientation: c },
    ],
  },
};

export const LongNames: Story = {
  args: {
    entries: [
      {
        orientation: { ...a, name: LONG_NAME },
        value: 80,
        badge: { ...placeholderBadge, text: "Badge Text" },
      },
      { orientation: { ...b, name: LONG_NAME }, value: 60 },
    ],
  },
};

export const LongCategoryNames: Story = {
  globals: { viewport: { value: "iphone5" } },
  args: {
    categories: [
      {
        name: "Polityka społeczna i gospodarcza",
        entries: [
          { orientation: { ...a, name: "Skrajna lewica" }, value: 65 },
          { orientation: b, value: 40 },
        ],
      },
      {
        name: "Polityka zagraniczna w ujęciu wieloletnim oraz międzynarodowym",
        entries: [
          {
            orientation: { ...c, name: LONG_NAME },
            value: 55,
            badge: { ...placeholderBadge, text: "Badge Text" },
          },
        ],
      },
      categories[1],
    ],
  },
};

export const Empty: Story = {
  args: { entries: [] },
};
