import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { ModuleWrapper } from "./ModuleWrapper";

const componentTitle = (
  <div className="flex items-center justify-center border border-gi-dark-primary bg-white text-xs leading-none font-bold text-black">
    ANY COMP
  </div>
);

const body = (
  <p className="text-sm text-gi-primary">
    Treść modułu. Karta zajmuje całą szerokość rodzica, a jej wysokość wynika z
    nagłówka i treści.
  </p>
);

const meta = {
  title: "Shared/ModuleWrapper",
  component: ModuleWrapper,
  args: {
    children: body,
  },
} satisfies Meta<typeof ModuleWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TitleOnly: Story = {
  args: {
    title: "Title",
  },
};

export const WithActions: Story = {
  args: {
    title: "Title",
    onStatsClick: fn(),
    onInfoClick: fn(),
  },
};

export const ComponentTitle: Story = {
  args: {
    title: componentTitle,
    ariaLabel: "Module name",
    onStatsClick: fn(),
    onInfoClick: fn(),
  },
};

export const ComponentTitleStatsOnly: Story = {
  args: {
    title: componentTitle,
    ariaLabel: "Module name",
    onStatsClick: fn(),
  },
};

export const StatsOnly: Story = {
  args: {
    title: "Title",
    onStatsClick: fn(),
  },
};

export const InfoOnly: Story = {
  args: {
    title: "Title",
    onInfoClick: fn(),
  },
};

export const ComponentTitleInfoOnly: Story = {
  args: {
    title: componentTitle,
    ariaLabel: "Module name",
    onInfoClick: fn(),
  },
};

export const ComponentTitleOnly: Story = {
  args: {
    title: componentTitle,
    ariaLabel: "Module name",
  },
};

export const LongTitle: Story = {
  args: {
    title:
      "Oś gospodarcza z bardzo długą nazwą autorską, która nie mieści się w nagłówku karty",
    onStatsClick: fn(),
    onInfoClick: fn(),
  },
};

export const NoHeader: Story = {};

export const ActionsWithoutTitle: Story = {
  args: {
    onStatsClick: fn(),
    onInfoClick: fn(),
  },
};

export const EmptyBody: Story = {
  args: {
    title: "Title",
    onStatsClick: fn(),
    onInfoClick: fn(),
    children: undefined,
  },
};

export const LongWordBody: Story = {
  args: {
    title: "Title",
    onStatsClick: fn(),
    onInfoClick: fn(),
    children: (
      <p className="text-sm text-gi-primary">
        7f3a9c2e5b8d1f4a6c0e9b2d7f3a9c2e5b8d1f4a6c0e9b2d7f3a9c2e5b8d1f4a6c0e9b2d7f3a9c2e
      </p>
    ),
  },
};
