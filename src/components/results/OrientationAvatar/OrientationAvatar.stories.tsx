import type { Meta, StoryObj } from "@storybook/react-vite";

import personAvatar from "@/assets/icons/person-avatar.svg";

import { OrientationAvatar } from "./OrientationAvatar";

const glyphUrl = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M6 15l4-4 3 3 5-6v3h1V7h-4v1h2l-4 5-3-3-5 5z"/></svg>',
)}`;

const meta = {
  title: "Results/OrientationAvatar",
  component: OrientationAvatar,
  args: {
    color: "#9b59b6",
    imageUrl: glyphUrl,
  },
} satisfies Meta<typeof OrientationAvatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Small: Story = {};

export const Regular: Story = {
  args: { size: "regular" },
};

export const NoImage: Story = {
  args: { imageUrl: undefined },
};

// The grey disc of a bar.
export const NoColour: Story = {
  args: { color: undefined },
};

// A person: the default avatar covers the disc.
export const Person: Story = {
  args: { color: undefined, imageUrl: personAvatar, size: "regular" },
};
