import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import type { Orientation } from "@/types/orientation";

import { SingleAxisChart } from "./SingleAxisChart";

const createIconUrl = (path: string, offset: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path transform="translate(${offset})" fill-rule="evenodd" d="${path}" fill="white"/></svg>`,
  )}`;

const createAvatarUrl = (color: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="${color}"/><circle cx="16" cy="12" r="6" fill="white"/><path d="M4 32a12 12 0 0 1 24 0Z" fill="white"/></svg>`,
  )}`;

const placeholder: Orientation = {
  id: "placeholder",
  type: "ideology",
  name: "Orientation Name",
  imageUrl: createIconUrl(
    "M0 0v16h16V0H0Zm2.28 1.33L8 7.06l5.72-5.73H2.28Zm12.39.95L8.94 8l5.73 5.72V2.28Zm-.95 12.39L8 8.94l-5.72 5.73h11.44ZM1.33 13.72 7.06 8 1.33 2.28v11.44Z",
    "8 8",
  ),
  color: "#47924c",
};

const radicalism: Orientation = {
  id: "radicalism",
  type: "ideology",
  name: "Radykalizm",
  imageUrl: createIconUrl(
    "M5 0c.55 0 1 .45 1 1v3.5H4V1c0-.55.45-1 1-1ZM1 2c0-.55.45-1 1-1s1 .45 1 1v2.5H1V2Zm6 0c0-.55.45-1 1-1s1 .45 1 1v3c0 .55-.45 1-1 1s-1-.45-1-1V2Zm3 2c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1s-1-.45-1-1V4ZM7 6.75v-.02c.29.17.63.27 1 .27.41 0 .79-.13 1.11-.34A2 2 0 0 0 11 8c.37 0 .71-.1 1-.27V8a5 5 0 0 1-2 4v3c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1v-2.45a5 5 0 0 1-1.47-1.02l-.36-.36A4 4 0 0 1 0 8.34V7.5c0-1.1.9-2 2-2h2.75a1.25 1.25 0 0 1 0 2.5H3a.5.5 0 0 0 0 1h1.75C5.99 9 7 7.99 7 6.75Z",
    "10 8",
  ),
  color: "#924747",
};

const friend: Orientation = {
  id: "friend",
  type: "person",
  name: "Ania",
  imageUrl: createAvatarUrl("#004554"),
  color: "#004554",
};

const meta = {
  title: "Results/SingleAxisChart",
  component: SingleAxisChart,
  args: {
    orientation: radicalism,
    onStatsClick: fn(),
    onInfoClick: fn(),
  },
} satisfies Meta<typeof SingleAxisChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  args: {
    orientation: placeholder,
    value: 40,
  },
};

export const ExampleQuiet: Story = {
  args: {
    value: 40,
  },
};

export const ExampleEmphasised: Story = {
  args: {
    value: 69,
  },
};

export const Comparison: Story = {
  args: {
    value: 69,
    comparison: { orientation: friend, value: 90 },
  },
};

export const ZeroValue: Story = {
  args: {
    value: 0,
  },
};

export const NoValue: Story = {};

export const NoMarker: Story = {
  args: {
    value: 69,
    marker: false,
  },
};

export const CustomMarker: Story = {
  args: {
    value: 69,
    marker: 75,
  },
};

export const NoImage: Story = {
  args: {
    orientation: { ...radicalism, imageUrl: undefined },
    value: 69,
  },
};

export const NoColor: Story = {
  args: {
    orientation: { ...radicalism, color: undefined },
    value: 69,
  },
};

export const LongName: Story = {
  args: {
    orientation: {
      ...radicalism,
      name: "Radykalizm społeczno-gospodarczy z bardzo długą nazwą autorską, która nie mieści się w tytule",
    },
    value: 69,
  },
};
