import type { Meta, StoryObj } from "@storybook/react-vite";

import type { Orientation } from "@/types/orientation";

import { UniversalAxis } from "./UniversalAxis";

const createAvatarUrl = (color: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="${color}"/><rect x="8.5" y="8.5" width="15" height="15" fill="none" stroke="white"/><path d="M8.5 8.5l15 15M23.5 8.5l-15 15" stroke="white"/></svg>`,
  )}`;

const liberalism: Orientation = {
  id: "liberalism",
  type: "ideology",
  name: "Orientation A",
  imageUrl: createAvatarUrl("#59b6a6"),
  color: "#59b6a6",
};

const conservatism: Orientation = {
  id: "conservatism",
  type: "ideology",
  name: "Orientation B",
  imageUrl: createAvatarUrl("#bc831a"),
  color: "#bc831a",
};

const socialism: Orientation = {
  id: "socialism",
  type: "ideology",
  name: "Orientation Name",
  imageUrl: createAvatarUrl("#d5213d"),
  color: "#d5213d",
};

const friend: Orientation = {
  id: "friend",
  type: "person",
  name: "Ania",
  imageUrl: createAvatarUrl("#004554"),
  color: "#004554",
};

const meta = {
  title: "Shared/UniversalAxis",
  component: UniversalAxis,
  decorators: [
    (Story) => (
      <div className="w-[288px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UniversalAxis>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    marker: false,
  },
};

export const OneSidedSmallValue: Story = {
  args: {
    start: { orientation: socialism, value: 5 },
    marker: false,
  },
};

export const OneSidedNoValue: Story = {
  args: {
    start: { orientation: socialism },
    marker: false,
  },
};

export const OneSided: Story = {
  args: {
    start: { orientation: socialism, value: 25 },
  },
};

export const OneSidedWithLabel: Story = {
  args: {
    start: { orientation: socialism, value: 25 },
    showLabels: true,
  },
};

export const OneSidedFromEnd: Story = {
  args: {
    end: { orientation: conservatism, value: 25 },
    showLabels: true,
  },
};

export const ComparisonAhead: Story = {
  args: {
    start: { orientation: socialism, value: 25 },
    comparison: { orientation: friend, value: 77 },
    marker: false,
  },
};

export const ComparisonBehind: Story = {
  args: {
    start: { orientation: socialism, value: 25 },
    comparison: { orientation: friend, value: 3 },
    marker: false,
  },
};

export const ComparisonOnly: Story = {
  args: {
    comparison: { orientation: friend, value: 60 },
    marker: false,
  },
};

export const ComparisonTakerNoValue: Story = {
  args: {
    start: { orientation: socialism },
    comparison: { orientation: friend, value: 60 },
    marker: false,
  },
};

export const DoubleSidedEmpty: Story = {
  args: {
    start: { orientation: liberalism, value: 0 },
    end: { orientation: conservatism, value: 0 },
    marker: false,
  },
};

export const DoubleSidedOneNoValue: Story = {
  args: {
    start: { orientation: liberalism, value: 69 },
    end: { orientation: conservatism },
    marker: false,
  },
};

export const DoubleSidedBothNoValue: Story = {
  args: {
    start: { orientation: liberalism },
    end: { orientation: conservatism },
    marker: false,
  },
};

export const DoubleSided: Story = {
  args: {
    start: { orientation: liberalism, value: 69 },
    end: { orientation: conservatism, value: 31 },
    marker: false,
  },
};

export const DoubleSidedSmallSide: Story = {
  args: {
    start: { orientation: liberalism, value: 88 },
    end: { orientation: conservatism, value: 12 },
    marker: false,
  },
};

export const DoubleSidedWithLabels: Story = {
  args: {
    start: { orientation: liberalism, value: 69 },
    end: { orientation: conservatism, value: 31 },
    showLabels: true,
  },
};

export const DoubleSidedOneNoValueWithLabels: Story = {
  args: {
    start: { orientation: liberalism, value: 69 },
    end: { orientation: conservatism },
    showLabels: true,
  },
};

export const DoubleSidedComparison: Story = {
  args: {
    start: { orientation: liberalism, value: 69 },
    end: { orientation: conservatism, value: 31 },
    comparison: { orientation: friend, value: 90 },
    marker: false,
    showLabels: true,
  },
};

export const CustomMarker: Story = {
  args: {
    start: { orientation: socialism, value: 25 },
    marker: 75,
  },
};

export const NoMarker: Story = {
  args: {
    start: { orientation: socialism, value: 25 },
    marker: false,
  },
};

export const LongNames: Story = {
  args: {
    start: {
      orientation: {
        ...liberalism,
        name: "Liberalizm gospodarczy i światopoglądowy w wydaniu bardzo długim",
      },
      value: 55,
    },
    end: {
      orientation: {
        ...conservatism,
        name: "Konserwatyzm narodowy z bardzo długą nazwą autorską",
      },
      value: 45,
    },
    showLabels: true,
  },
};

export const NoImage: Story = {
  args: {
    start: {
      orientation: { ...liberalism, imageUrl: undefined },
      value: 69,
    },
    end: {
      orientation: { ...conservatism, imageUrl: undefined },
      value: 31,
    },
  },
};

export const NoColor: Story = {
  args: {
    start: {
      orientation: { ...socialism, imageUrl: undefined, color: undefined },
      value: 40,
    },
    comparison: {
      orientation: { ...friend, imageUrl: undefined, color: undefined },
      value: 70,
    },
  },
};

export const OutOfRangeValues: Story = {
  args: {
    start: { orientation: liberalism, value: 140 },
    end: { orientation: conservatism, value: 60 },
    comparison: { orientation: friend, value: -20 },
  },
};

// The bar of a checkpoint card: no number on or next to a fill, and none in
// the description.
export const OneSidedWithoutValues: Story = {
  args: {
    start: { orientation: socialism, value: 64 },
    showValues: false,
  },
};

export const OneSidedSmallValueWithoutValues: Story = {
  args: {
    start: { orientation: socialism, value: 5 },
    showValues: false,
  },
};

export const DoubleSidedWithoutValues: Story = {
  args: {
    start: { orientation: liberalism, value: 69 },
    end: { orientation: conservatism, value: 31 },
    showValues: false,
    showLabels: true,
  },
};

// The description is the one passed in; the numbers are still drawn.
export const WithDescription: Story = {
  args: {
    start: { orientation: liberalism, value: 69 },
    end: { orientation: conservatism, value: 31 },
    showLabels: true,
    description:
      "„Orientation A” i „Orientation B”: wyższy wynik po stronie „Orientation A”",
  },
};
