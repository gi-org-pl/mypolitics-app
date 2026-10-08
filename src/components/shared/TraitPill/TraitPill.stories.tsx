import type { Meta, StoryObj } from "@storybook/react-vite";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import type { Orientation } from "@/types/orientation";

import { TraitPill } from "./TraitPill";

// A white glyph of 16 px in the middle of a square of 32 px: the shape of a
// trait icon as a quiz supplies it.
const CROWN_ICON_URL = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path transform="translate(8 9.7)" fill="white" d="M13.2 10.97H2.8a.4.4 0 0 0-.4.4v.78c0 .21.18.39.4.39h10.4a.4.4 0 0 0 .4-.39v-.78a.4.4 0 0 0-.4-.4Zm1.6-7.83c-.66 0-1.2.52-1.2 1.17 0 .17.04.34.11.49L11.9 5.86a.81.81 0 0 1-1.1-.29L8.76 2.08A1.16 1.16 0 0 0 8 0a1.16 1.16 0 0 0-.76 2.08L5.2 5.57a.81.81 0 0 1-1.1.29L2.29 4.8c.07-.15.11-.32.11-.49a1.2 1.2 0 1 0-1.01 1.16l1.81 4.72h9.6l1.81-4.72A1.19 1.19 0 0 0 16 4.31c0-.65-.54-1.17-1.2-1.17Z"/></svg>',
)}`;

const AVATAR_URL = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#004554"/><circle cx="16" cy="12" r="6" fill="white"/><path d="M4 32a12 12 0 0 1 24 0Z" fill="white"/></svg>',
)}`;

const LONG_NAME =
  "Radykalizm społeczno-gospodarczy z bardzo długą nazwą autorską, która nie mieści się w karcie";

const monarchism: Orientation = {
  id: "monarchism",
  type: "ideology",
  name: "Monarchizm",
  imageUrl: CROWN_ICON_URL,
  color: "#9b51e0",
};

const friend: Orientation = {
  id: "friend",
  type: "person",
  name: "Ania",
  imageUrl: AVATAR_URL,
};

const meta = {
  title: "Shared/TraitPill",
  component: TraitPill,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    orientation: monarchism,
  },
} satisfies Meta<typeof TraitPill>;

export default meta;

type Story = StoryObj<typeof meta>;

// A trait the taker holds: solid, no avatar.
export const Default: Story = {};

// A trait both hold: solid, with the avatar of the other side.
export const Shared: Story = {
  args: { holder: "both", otherOrientation: friend },
};

// A trait only the other side holds: hatched, with their avatar.
export const OnlyTheirs: Story = {
  args: { holder: "other", otherOrientation: friend },
};

export const NoIcon: Story = {
  args: { orientation: { ...monarchism, imageUrl: undefined } },
};

export const NoColor: Story = {
  args: { orientation: { ...monarchism, color: undefined } },
};

export const LightColor: Story = {
  args: { orientation: { ...monarchism, color: "#ffe066" } },
};

// The pill is as wide as its parent at most and cuts the name to one line.
export const LongName: Story = {
  args: {
    orientation: { ...monarchism, name: LONG_NAME },
    holder: "both",
    otherOrientation: friend,
  },
};

export const OtherWithoutAvatar: Story = {
  args: {
    holder: "both",
    otherOrientation: { ...friend, imageUrl: undefined },
  },
};
