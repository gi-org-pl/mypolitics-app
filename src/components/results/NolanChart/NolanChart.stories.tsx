import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within } from "storybook/test";

import type { AxisOrientation } from "@/types/axis";

import { NolanChart } from "./NolanChart";
import type {
  NolanAxis,
  NolanChartProps,
  NolanLevelNames,
} from "./NolanChart.types";

const createIconUrl = (content: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${content}</svg>`,
  )}`;

const createArrowIcon = (rotation: number): string =>
  createIconUrl(
    `<path transform="rotate(${rotation} 16 16)" d="M8 16h16m-5-5 5 5-5 5" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  );

const PLACEHOLDER_ICON = createIconUrl(
  '<path transform="translate(8 8)" fill-rule="evenodd" d="M0 0v16h16V0H0Zm2.28 1.33L8 7.06l5.72-5.73H2.28Zm12.39.95L8.94 8l5.73 5.72V2.28Zm-.95 12.39L8 8.94l-5.72 5.73h11.44ZM1.33 13.72 7.06 8 1.33 2.28v11.44Z" fill="white"/>',
);

const FRIEND_IMAGE = createIconUrl(
  '<rect width="32" height="32" fill="#f4d7b5"/><circle cx="16" cy="13" r="6" fill="#8a5a3c"/><path d="M4 32c0-8 5-12 12-12s12 4 12 12Z" fill="#2c3e50"/>',
);

const RED = "#eb5760";
const BLUE = "#57bfeb";
const GREEN = "#36db8b";
const PURPLE = "#8443e9";

const createAxis = (
  name: string,
  [startName, startIcon, startNames, startValue]: [
    string,
    string,
    NolanLevelNames | undefined,
    number?,
  ],
  [endName, endIcon, endNames, endValue]: [
    string,
    string,
    NolanLevelNames | undefined,
    number?,
  ],
): NolanAxis => ({
  name,
  start: {
    entry: {
      orientation: {
        id: `${name}-start`,
        name: startName,
        imageUrl: startIcon,
      },
      value: startValue,
    },
    names: startNames,
  },
  end: {
    entry: {
      orientation: { id: `${name}-end`, name: endName, imageUrl: endIcon },
      value: endValue,
    },
    names: endNames,
  },
});

const LEFT_NAMES: NolanLevelNames = {
  moderate: "Umiarkowana lewica",
  extreme: "Skrajna lewica",
};
const RIGHT_NAMES: NolanLevelNames = {
  moderate: "Umiarkowana prawica",
  extreme: "Skrajna prawica",
};

const createEconomy = (start?: number, end?: number): NolanAxis =>
  createAxis(
    "Gospodarka",
    ["Lewica gospodarcza", createArrowIcon(180), LEFT_NAMES, start],
    ["Prawica gospodarcza", createArrowIcon(0), RIGHT_NAMES, end],
  );

const createWorldview = (start?: number, end?: number): NolanAxis =>
  createAxis(
    "Światopogląd",
    ["Lewica światopoglądowa", createArrowIcon(90), LEFT_NAMES, start],
    ["Prawica światopoglądowa", createArrowIcon(270), RIGHT_NAMES, end],
  );

const QUADRANTS: NolanChartProps["quadrants"] = {
  topLeft: {
    color: RED,
    names: {
      moderate: "Umiarkowana czerwona",
      moderateShort: "Um. czerwona",
      extreme: "Skrajna czerwona",
      extremeShort: "Skr. czerwona",
    },
  },
  topRight: {
    color: BLUE,
    names: {
      moderate: "Umiarkowana niebieska",
      moderateShort: "Um. niebieska",
      extreme: "Skrajna niebieska",
      extremeShort: "Skr. niebieska",
    },
  },
  bottomLeft: {
    color: GREEN,
    names: {
      moderate: "Umiarkowana zielona",
      moderateShort: "Um. zielona",
      extreme: "Skrajna zielona",
      extremeShort: "Skr. zielona",
    },
  },
  bottomRight: {
    color: PURPLE,
    names: {
      moderate: "Umiarkowana fioletowa",
      moderateShort: "Um. fioletowa",
      extreme: "Skrajna fioletowa",
      extremeShort: "Skr. fioletowa",
    },
  },
};

const friend: AxisOrientation = {
  id: "friend",
  name: "Rafał",
  imageUrl: FRIEND_IMAGE,
};

const meta = {
  title: "Results/NolanChart",
  component: NolanChart,
  args: {
    horizontal: createEconomy(77, 23),
    vertical: createWorldview(67, 33),
    quadrants: QUADRANTS,
    centreName: "Centrum",
    onStatsClick: fn(),
    onInfoClick: fn(),
  },
} satisfies Meta<typeof NolanChart>;

export default meta;

type Story = StoryObj<typeof meta>;

const openCard: Story["play"] = async ({ canvasElement }) => {
  const control = within(canvasElement).getByRole("button", {
    name: "Pokaż osie",
  });

  await userEvent.click(control);
};

export const Standard: Story = {
  args: {
    horizontal: createAxis(
      "X Axis Name",
      ["Orientation A", PLACEHOLDER_ICON, undefined, 50],
      ["Orientation B", PLACEHOLDER_ICON, undefined, 50],
    ),
    vertical: createAxis(
      "Y Axis Name",
      ["Orientation C", PLACEHOLDER_ICON, undefined, 50],
      ["Orientation D", PLACEHOLDER_ICON, undefined, 50],
    ),
    centreName: "Quadrant name and level",
  },
};

export const Centre: Story = {
  args: {
    horizontal: createEconomy(50, 50),
    vertical: createWorldview(50, 50),
  },
};

export const Moderate: Story = {};

export const ModerateOpen: Story = {
  play: openCard,
};

export const ExtremeOpen: Story = {
  args: {
    horizontal: createEconomy(0, 100),
    vertical: createWorldview(100, 0),
  },
  play: openCard,
};

export const Comparison: Story = {
  args: {
    ...ExtremeOpen.args,
    comparison: {
      party: friend,
      horizontal: { start: 58, end: 42 },
      vertical: { start: 68, end: 32 },
    },
  },
  play: openCard,
};

export const NoPosition: Story = {
  args: {
    horizontal: createEconomy(),
    vertical: createWorldview(67, 33),
  },
};

export const OnAnAxis: Story = {
  args: {
    horizontal: createEconomy(50, 50),
    vertical: createWorldview(20, 80),
  },
  play: openCard,
};

export const OnAnEdge: Story = {
  args: {
    horizontal: createEconomy(0, 100),
    vertical: createWorldview(40, 60),
  },
};

export const CornerTopLeft: Story = {
  args: {
    horizontal: createEconomy(100, 0),
    vertical: createWorldview(0, 100),
  },
};

export const CornerTopRight: Story = {
  args: {
    horizontal: createEconomy(0, 100),
    vertical: createWorldview(0, 100),
  },
};

export const CornerBottomLeft: Story = {
  args: {
    horizontal: createEconomy(100, 0),
    vertical: createWorldview(100, 0),
  },
};

export const CornerBottomRight: Story = {
  args: {
    horizontal: createEconomy(0, 100),
    vertical: createWorldview(100, 0),
  },
};

export const ComparisonAtCorner: Story = {
  args: {
    comparison: {
      party: friend,
      horizontal: { start: 0, end: 100 },
      vertical: { start: 0, end: 100 },
    },
  },
};

export const ComparisonSamePosition: Story = {
  args: {
    comparison: {
      party: friend,
      horizontal: { start: 77, end: 23 },
      vertical: { start: 67, end: 33 },
    },
  },
};

export const ComparisonWithoutPosition: Story = {
  args: {
    comparison: {
      party: friend,
      horizontal: { start: 58, end: 42 },
      vertical: {},
    },
  },
  play: openCard,
};

export const ComparisonWithoutImage: Story = {
  args: {
    comparison: {
      party: { id: "friend", name: "Rafał" },
      horizontal: { start: 30, end: 70 },
      vertical: { start: 40, end: 60 },
    },
  },
};

export const NoShortNames: Story = {
  args: {
    quadrants: {
      ...QUADRANTS,
      bottomLeft: {
        color: GREEN,
        names: { moderate: "Umiarkowana zielona", extreme: "Skrajna zielona" },
      },
    },
  },
};

export const MissingNames: Story = {
  args: {
    horizontal: createAxis(
      "Gospodarka",
      ["Lewica gospodarcza", createArrowIcon(180), undefined, 77],
      ["Prawica gospodarcza", createArrowIcon(0), undefined, 23],
    ),
    quadrants: { ...QUADRANTS, bottomLeft: { color: GREEN } },
  },
  play: openCard,
};

export const NoQuadrantColor: Story = {
  args: {
    quadrants: {
      topLeft: { names: QUADRANTS.topLeft.names },
      topRight: { names: QUADRANTS.topRight.names },
      bottomLeft: { names: QUADRANTS.bottomLeft.names },
      bottomRight: { names: QUADRANTS.bottomRight.names },
    },
  },
  play: openCard,
};

export const LongNames: Story = {
  args: {
    horizontal: createAxis(
      "Stosunek do roli państwa w gospodarce i redystrybucji dochodów",
      [
        "Lewica gospodarcza",
        createArrowIcon(180),
        { moderate: "Umiarkowany zwolennik aktywnej roli państwa" },
        77,
      ],
      ["Prawica gospodarcza", createArrowIcon(0), RIGHT_NAMES, 23],
    ),
    vertical: createAxis(
      "Stosunek do tradycji, obyczajów i zmian społecznych",
      [
        "Lewica światopoglądowa",
        createArrowIcon(90),
        { moderate: "Umiarkowany zwolennik zmian obyczajowych" },
        67,
      ],
      ["Prawica światopoglądowa", createArrowIcon(270), RIGHT_NAMES, 33],
    ),
    quadrants: {
      ...QUADRANTS,
      bottomLeft: {
        color: GREEN,
        names: {
          moderate:
            "Umiarkowana lewica socjalna o poglądach postępowych i proeuropejskich",
        },
      },
    },
  },
  play: openCard,
};
