import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import Header from "./Header";

const meta: Meta<typeof Header> = {
  title: "Components/shared/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  args: {
    initialActiveButton: "debaty",
    initialIsMenuOpen: false,
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {};

export const ActiveDebaty: Story = {
  args: {
    initialActiveButton: "debaty",
  },
};

export const ActiveSondaze: Story = {
  args: {
    initialActiveButton: "sondaze",
  },
};

export const ActiveQuizy: Story = {
  args: {
    initialActiveButton: "quizy",
  },
};

export const MobileClosed: Story = {
  parameters: {
    viewport: "mobile",
  },
  args: {
    viewport: "mobile",
    initialActiveButton: "debaty",
    initialIsMenuOpen: false,
  },
};

export const MobileOpen: Story = {
  parameters: {
    viewport: "mobile",
  },
  args: {
    viewport: "mobile",
    initialIsMenuOpen: true,
  },
};
