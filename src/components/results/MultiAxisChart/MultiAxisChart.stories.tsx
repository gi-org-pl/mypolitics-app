import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within } from "storybook/test";

import type { Orientation } from "@/types/orientation";

import { MultiAxisChart } from "./MultiAxisChart";
import type { AxisGroup, AxisPair } from "./MultiAxisChart.types";

const createIconUrl = (content: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${content}</svg>`,
  )}`;

const PLACEHOLDER_ICON = createIconUrl(
  '<path transform="translate(8 8)" fill-rule="evenodd" d="M0 0v16h16V0H0Zm2.28 1.33L8 7.06l5.72-5.73H2.28Zm12.39.95L8.94 8l5.73 5.72V2.28Zm-.95 12.39L8 8.94l-5.72 5.73h11.44ZM1.33 13.72 7.06 8 1.33 2.28v11.44Z" fill="white"/>',
);

const ICONS = [
  '<path d="M9 21l5-5 3 3 6-7" fill="none" stroke="white" stroke-width="2.5"/>',
  '<path d="M11 9h10l-5 7 5 7H11l5-7Z" fill="white"/>',
  '<circle cx="16" cy="16" r="6" fill="none" stroke="white" stroke-width="2.5"/>',
  '<rect x="10" y="10" width="12" height="12" fill="white"/>',
  '<path d="M16 9l7 13H9Z" fill="white"/>',
  '<path d="M9 13h14M9 19h14" stroke="white" stroke-width="2.5"/>',
].map(createIconUrl);

const createAxis = (
  id: string,
  [startName, startColor, startValue]: [string, string, number?],
  [endName, endColor, endValue]: [string, string, number?],
  index = 0,
  imageUrl?: string,
): AxisPair => {
  const createOrientation = (
    side: string,
    name: string,
    color: string,
    offset: number,
  ): Orientation => ({
    id: `${id}-${side}`,
    type: "ideology",
    name,
    imageUrl: imageUrl ?? ICONS[(index + offset) % ICONS.length],
    color,
  });

  return {
    id,
    start: {
      orientation: createOrientation("start", startName, startColor, 0),
      value: startValue,
    },
    end: {
      orientation: createOrientation("end", endName, endColor, 3),
      value: endValue,
    },
  };
};

const createStandardAxis = (
  id: string,
  colors: [string, string],
  values: [number, number],
): AxisPair =>
  createAxis(
    id,
    ["Orientation A", colors[0], values[0]],
    ["Orientation B", colors[1], values[1]],
    0,
    PLACEHOLDER_ICON,
  );

const createStandardGroup = (
  id: string,
  colors: [string, string],
  values: [number, number],
  otherValues: [number, number][],
): AxisGroup => ({
  name: "Group Name",
  axes: [
    createStandardAxis(id, colors, values),
    ...otherValues.map((axisValues, index) =>
      createStandardAxis(`${id}-${index}`, colors, axisValues),
    ),
  ],
});

const STANDARD_GROUPS: AxisGroup[] = [
  createStandardGroup(
    "standard-1",
    ["#9b59b6", "#1abc9c"],
    [69, 31],
    [
      [45, 55],
      [100, 0],
      [69, 31],
      [32, 65],
      [50, 50],
    ],
  ),
  createStandardGroup(
    "standard-2",
    ["#e74c3c", "#2ecc71"],
    [47, 31],
    [
      [40, 60],
      [70, 30],
    ],
  ),
  createStandardGroup(
    "standard-3",
    ["#2c6dd2", "#a56c1c"],
    [69, 31],
    [[20, 80]],
  ),
  createStandardGroup("standard-4", ["#2d9cc9", "#f39c2b"], [50, 50], []),
  createStandardGroup(
    "standard-5",
    ["#5aa845", "#666666"],
    [0, 100],
    [
      [10, 90],
      [35, 65],
      [80, 20],
    ],
  ),
];

const PURPLE = "#9b59b6";
const TEAL = "#1abc9c";

const worldview: AxisGroup = {
  name: "Światopogląd",
  axes: [
    createAxis(
      "worldview",
      ["Progresywizm", PURPLE, 69],
      ["Tradycjonalizm", TEAL, 31],
      0,
    ),
    createAxis("force", ["Pacyfizm", PURPLE, 45], ["Militaryzm", TEAL, 55], 1),
    createAxis(
      "tolerance",
      ["Tolerancja", PURPLE, 100],
      ["Ksenofobia", TEAL, 0],
      2,
    ),
    createAxis(
      "faith",
      ["Sekularyzm", PURPLE, 69],
      ["Religijność", TEAL, 31],
      3,
    ),
    createAxis(
      "equality",
      ["Równość", PURPLE, 32],
      ["Hierarchia społeczna", TEAL, 65],
      4,
    ),
    createAxis(
      "morality",
      ["Wolność moralna", PURPLE, 50],
      ["Opiekuńczość", TEAL, 50],
      5,
    ),
  ],
};

const economy: AxisGroup = {
  name: "Gospodarka",
  axes: [
    createAxis(
      "economy",
      ["Interwencjonizm", "#e74c3c", 47],
      ["Wolny rynek", "#2ecc71", 53],
      1,
    ),
    createAxis(
      "taxes",
      ["Redystrybucja", "#e74c3c", 62],
      ["Niskie podatki", "#2ecc71", 38],
      2,
    ),
    createAxis(
      "ownership",
      ["Własność wspólna", "#e74c3c", 25],
      ["Własność prywatna", "#2ecc71", 75],
      3,
    ),
  ],
};

const system: AxisGroup = {
  name: "Ustrój",
  axes: [
    createAxis(
      "system",
      ["Równowaga polityczna", "#2c6dd2", 69],
      ["Jednowładztwo", "#a56c1c", 31],
      2,
    ),
    createAxis(
      "power",
      ["Decentralizacja", "#2c6dd2", 58],
      ["Centralizacja", "#a56c1c", 42],
      4,
    ),
  ],
};

const foreignPolicy: AxisGroup = {
  name: "Polityka zagraniczna",
  axes: [
    createAxis(
      "foreign",
      ["Globalizm", "#2d9cc9", 50],
      ["Suwerenizm", "#f39c2b", 50],
      3,
    ),
  ],
};

const ecology: AxisGroup = {
  name: "Ekologia",
  axes: [
    createAxis(
      "ecology",
      ["Ekologia klimatyczna", "#5aa845", 0],
      ["Antyklimatyzm", "#666666", 100],
      4,
    ),
    createAxis(
      "energy",
      ["Odnawialne źródła", "#5aa845", 20],
      ["Paliwa kopalne", "#666666", 80],
      0,
    ),
    createAxis(
      "growth",
      ["Ograniczenie wzrostu", "#5aa845", 12],
      ["Wzrost gospodarczy", "#666666", 88],
      1,
    ),
    createAxis(
      "animals",
      ["Prawa zwierząt", "#5aa845", 40],
      ["Hodowla przemysłowa", "#666666", 60],
      5,
    ),
  ],
};

const EXAMPLE_GROUPS = [worldview, economy, system, foreignPolicy, ecology];

const friend: Orientation = {
  id: "friend",
  type: "person",
  name: "Ania",
  imageUrl: createIconUrl(
    '<rect width="32" height="32" fill="#004554"/><circle cx="16" cy="12" r="6" fill="white"/><path d="M4 32a12 12 0 0 1 24 0Z" fill="white"/>',
  ),
  color: "#004554",
};

const COMPARISON = {
  orientation: friend,
  values: {
    worldview: 35,
    force: 80,
    tolerance: 60,
    faith: 15,
    equality: 50,
    morality: 90,
    economy: 70,
    system: 40,
    foreign: 20,
    ecology: 55,
  },
};

const LONG_NAME_SUFFIX = "z bardzo długą nazwą autorską, która się nie mieści";

const withLongNames = (group: AxisGroup): AxisGroup => ({
  name: `${group.name} ${LONG_NAME_SUFFIX}`,
  axes: group.axes.map((axis) => ({
    ...axis,
    start: {
      ...axis.start,
      orientation: {
        ...axis.start.orientation,
        name: `${axis.start.orientation.name} ${LONG_NAME_SUFFIX}`,
      },
    },
    end: {
      ...axis.end,
      orientation: {
        ...axis.end.orientation,
        name: `${axis.end.orientation.name} ${LONG_NAME_SUFFIX}`,
      },
    },
  })),
});

const meta = {
  title: "Results/MultiAxisChart",
  component: MultiAxisChart,
  args: {
    title: "Ideologie",
    groups: EXAMPLE_GROUPS,
    onStatsClick: fn(),
    onInfoClick: fn(),
  },
} satisfies Meta<typeof MultiAxisChart>;

export default meta;

type Story = StoryObj<typeof meta>;

const openFirstGroup: Story["play"] = async ({ canvasElement }) => {
  const [control] = within(canvasElement).getAllByRole("button", {
    expanded: false,
  });

  await userEvent.click(control);
};

export const Standard: Story = {
  args: {
    title: "Title",
    groups: STANDARD_GROUPS,
  },
};

export const GroupOpen: Story = {
  args: Standard.args,
  play: openFirstGroup,
};

export const Example: Story = {};

export const ExampleGroupOpen: Story = {
  play: openFirstGroup,
};

export const SingleAxisGroup: Story = {
  args: {
    groups: [foreignPolicy],
  },
};

export const Tie: Story = {
  args: {
    groups: [
      {
        name: "Światopogląd",
        axes: [
          createAxis(
            "worldview",
            ["Progresywizm", PURPLE, 50],
            ["Tradycjonalizm", TEAL, 50],
            0,
          ),
          ...worldview.axes.slice(1),
        ],
      },
    ],
  },
};

export const Comparison: Story = {
  args: {
    comparison: COMPARISON,
  },
};

export const ComparisonGroupOpen: Story = {
  args: Comparison.args,
  play: openFirstGroup,
};

export const ManyPreviewIcons: Story = {
  args: {
    groups: [
      {
        name: "Światopogląd",
        axes: Array.from({ length: 30 }, (_, index) => ({
          ...worldview.axes[index % worldview.axes.length],
          id: `axis-${index}`,
        })),
      },
    ],
  },
};

export const LongNames: Story = {
  args: {
    title: `Ideologie ${LONG_NAME_SUFFIX}`,
    groups: EXAMPLE_GROUPS.map(withLongNames),
  },
};

export const MissingValues: Story = {
  args: {
    groups: [
      {
        name: "Jedna wartość",
        axes: [
          createAxis(
            "one",
            ["Progresywizm", PURPLE],
            ["Tradycjonalizm", TEAL, 31],
            0,
          ),
          createAxis(
            "one-other",
            ["Pacyfizm", PURPLE, 45],
            ["Militaryzm", TEAL],
            1,
          ),
        ],
      },
      {
        name: "Brak wartości",
        axes: [
          createAxis(
            "none",
            ["Globalizm", "#2d9cc9"],
            ["Suwerenizm", "#f39c2b"],
            3,
          ),
        ],
      },
      {
        axes: [
          createAxis(
            "unnamed",
            ["Równość", PURPLE, 32],
            ["Hierarchia społeczna", TEAL, 65],
            4,
          ),
        ],
      },
      {
        name: "Bez ikon",
        axes: [
          createAxis(
            "no-icons",
            ["Sekularyzm", PURPLE, 69],
            ["Religijność", TEAL, 31],
            0,
            "",
          ),
          createAxis(
            "no-icons-other",
            ["Tolerancja", PURPLE, 80],
            ["Ksenofobia", TEAL, 20],
            2,
          ),
        ],
      },
      { name: "Bez osi", axes: [] },
    ],
  },
};

export const NoMarker: Story = {
  args: {
    marker: false,
  },
  play: openFirstGroup,
};

export const CustomMarker: Story = {
  args: {
    marker: 75,
  },
  play: openFirstGroup,
};

export const NoGroups: Story = {
  args: {
    groups: [],
  },
};

export const NoTitleNoActions: Story = {
  args: {
    title: undefined,
    onStatsClick: undefined,
    onInfoClick: undefined,
  },
};

export const LongNamesGroupOpen: Story = {
  args: LongNames.args,
  play: openFirstGroup,
};
