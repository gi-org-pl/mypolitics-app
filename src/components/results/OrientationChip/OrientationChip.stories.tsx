import type { Meta, StoryObj } from "@storybook/react-vite";

import { OrientationChip } from "./OrientationChip";

const iconUrl = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path transform="translate(8 8)" fill-rule="evenodd" d="M0 0v16h16V0H0Zm2.28 1.33L8 7.06l5.72-5.73H2.28Zm12.39.95L8.94 8l5.73 5.72V2.28Zm-.95 12.39L8 8.94l-5.72 5.73h11.44ZM1.33 13.72 7.06 8 1.33 2.28v11.44Z" fill="white"/></svg>',
)}`;

const meta = {
  title: "Results/OrientationChip",
  component: OrientationChip,
  args: {
    name: "Orientation Name",
    imageUrl: iconUrl,
    color: "#47924c",
  },
} satisfies Meta<typeof OrientationChip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Emphasised: Story = {
  args: {
    look: "emphasised",
  },
};

export const Quiet: Story = {
  args: {
    look: "quiet",
  },
};

export const Neutral: Story = {
  args: {
    name: "Orientation A / Orientation B",
    look: "neutral",
  },
};

export const NoImage: Story = {
  args: {
    imageUrl: undefined,
  },
};

export const QuietNoImage: Story = {
  args: {
    imageUrl: undefined,
    look: "quiet",
  },
};

export const ImageOnly: Story = {
  args: {
    name: undefined,
  },
};

export const NoColor: Story = {
  args: {
    color: undefined,
  },
};

export const LongName: Story = {
  args: {
    name: "Radykalizm społeczno-gospodarczy z bardzo długą nazwą autorską, która nie mieści się w tytule",
  },
};
