import type { Meta, StoryObj } from "@storybook/react-vite";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import type { AxisOrientation } from "@/components/shared/UniversalAxis/UniversalAxis.types";

import { RankedRow } from "./RankedRow";

const toDataUrl = (svg: string): string =>
  `data:image/svg+xml,${encodeURIComponent(svg)}`;

const createImageUrl = (color: string): string =>
  toDataUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="${color}"/><rect x="8.5" y="8.5" width="15" height="15" fill="none" stroke="white"/><path d="M8.5 8.5l15 15M23.5 8.5l-15 15" stroke="white"/></svg>`,
  );

const iconUrl = toDataUrl(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><path d="M1 1h10v10H1zM1 1l10 10M11 1L1 11" fill="none" stroke="#004554" stroke-width="1.2"/></svg>',
);

const orientation: AxisOrientation = {
  id: "a",
  name: "Orientation A",
  imageUrl: createImageUrl("#dcdfe3"),
  color: "#d5213d",
};

const friend: AxisOrientation = {
  id: "friend",
  name: "Ania",
  imageUrl: createImageUrl("#004554"),
  color: "#004554",
};

const LONG_NAME =
  "Socjaldemokratyczny liberalizm instytucjonalny o bardzo długiej autorskiej nazwie";

const LONG_PREFIX = "Polityka społeczna i gospodarcza";

const narrow = { viewport: { value: "iphone5" } };

const meta = {
  title: "Results/RankedRow",
  component: RankedRow,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    entry: { orientation, value: 80 },
  },
} satisfies Meta<typeof RankedRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Standard: Story = {};

export const IconBadge: Story = {
  args: {
    entry: { orientation, value: 80, badge: { iconUrl, label: "Badge" } },
  },
};

export const TextBadge: Story = {
  args: {
    entry: { orientation, value: 80, badge: { iconUrl, text: "Badge Text" } },
  },
};

export const TextOnlyBadge: Story = {
  args: {
    entry: { orientation, value: 80, badge: { text: "Badge Text" } },
  },
};

export const Comparison: Story = {
  args: {
    comparison: { orientation: friend, value: 55 },
  },
};

export const OverriddenColor: Story = {
  args: {
    entry: { orientation: { ...orientation, color: "#f9c200" }, value: 60 },
  },
};

export const WithoutColor: Story = {
  args: {
    entry: { orientation: { ...orientation, color: undefined }, value: 60 },
  },
};

export const WithoutImage: Story = {
  args: {
    entry: { orientation: { ...orientation, imageUrl: undefined }, value: 60 },
  },
};

export const MissingValue: Story = {
  args: {
    entry: { orientation },
  },
};

export const CategoryHeading: Story = {
  args: {
    prefix: "Category A",
    isHeading: true,
    entry: { orientation, value: 65, badge: { iconUrl, text: "Badge Text" } },
  },
};

export const WrappedCategoryHeading: Story = {
  globals: narrow,
  args: {
    prefix: LONG_PREFIX,
    isHeading: true,
    entry: {
      orientation: { ...orientation, name: "Skrajna lewica" },
      value: 65,
    },
  },
};

export const WrappedCategoryHeadingWithBadge: Story = {
  globals: narrow,
  args: {
    prefix: LONG_PREFIX,
    isHeading: true,
    entry: {
      orientation: { ...orientation, name: "Skrajna lewica" },
      value: 65,
      badge: { iconUrl, text: "Badge Text" },
    },
  },
};

export const LongPrefixAndLongName: Story = {
  globals: narrow,
  args: {
    prefix: `${LONG_PREFIX} w ujęciu wieloletnim oraz międzynarodowym`,
    isHeading: true,
    entry: { orientation: { ...orientation, name: LONG_NAME }, value: 65 },
  },
};

export const LongName: Story = {
  args: {
    entry: {
      orientation: { ...orientation, name: LONG_NAME },
      value: 80,
      badge: { iconUrl, text: "Badge Text" },
    },
  },
};

export const EmptyName: Story = {
  args: {
    entry: { orientation: { ...orientation, name: "" }, value: 80 },
  },
};
