import type { Meta, StoryObj } from "@storybook/react-vite";

import type { AxisOrientation } from "@/components/shared/UniversalAxis/UniversalAxis.types";

import { AxisRow } from "./AxisRow";

const createIconUrl = (content: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${content}</svg>`,
  )}`;

const PLACEHOLDER_ICON =
  '<path transform="translate(8 8)" fill-rule="evenodd" d="M0 0v16h16V0H0Zm2.28 1.33L8 7.06l5.72-5.73H2.28Zm12.39.95L8.94 8l5.73 5.72V2.28Zm-.95 12.39L8 8.94l-5.72 5.73h11.44ZM1.33 13.72 7.06 8 1.33 2.28v11.44Z" fill="white"/>';

const progressivism: AxisOrientation = {
  id: "progressivism",
  name: "Progresywizm",
  imageUrl: createIconUrl(PLACEHOLDER_ICON),
  color: "#9b59b6",
};

const traditionalism: AxisOrientation = {
  id: "traditionalism",
  name: "Tradycjonalizm",
  imageUrl: createIconUrl(PLACEHOLDER_ICON),
  color: "#1abc9c",
};

const friend: AxisOrientation = {
  id: "friend",
  name: "Ania",
  imageUrl: createIconUrl(
    '<rect width="32" height="32" fill="#004554"/><circle cx="16" cy="12" r="6" fill="white"/><path d="M4 32a12 12 0 0 1 24 0Z" fill="white"/>',
  ),
  color: "#004554",
};

const meta = {
  title: "Results/Modules/AxisRow",
  component: AxisRow,
  args: {
    name: "Światopogląd",
    leadName: "Progresywizm",
    start: { orientation: progressivism, value: 69 },
    end: { orientation: traditionalism, value: 31 },
    showLabels: true,
  },
} satisfies Meta<typeof AxisRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Standard: Story = {};

export const Tie: Story = {
  args: {
    leadName: undefined,
    start: { orientation: progressivism, value: 50 },
    end: { orientation: traditionalism, value: 50 },
  },
};

export const LeadOnly: Story = {
  args: {
    name: undefined,
  },
};

export const NoHeading: Story = {
  args: {
    name: undefined,
    leadName: undefined,
  },
};

export const NoLabels: Story = {
  args: {
    showLabels: false,
  },
};

export const Comparison: Story = {
  args: {
    comparison: { orientation: friend, value: 90 },
  },
};

export const CustomMarker: Story = {
  args: {
    marker: 75,
  },
};

export const NoMarker: Story = {
  args: {
    marker: false,
  },
};

export const MissingValue: Story = {
  args: {
    leadName: "Tradycjonalizm",
    start: { orientation: progressivism },
  },
};

export const LongNames: Story = {
  args: {
    name: "Światopogląd z bardzo długą nazwą autorską, która nie mieści się w nagłówku",
    leadName:
      "Progresywizm z równie długą nazwą autorską, która też się nie mieści",
  },
};
