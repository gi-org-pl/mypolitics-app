import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { ModuleWrapper } from "./ModuleWrapper";

const componentTitle = (
  <div className="flex items-center justify-center border border-gi-dark-primary bg-white text-xs leading-none font-bold text-black">
    ANY COMP
  </div>
);

const body = <div className="h-56" />;

const meta = {
  title: "Shared/ModuleWrapper",
  component: ModuleWrapper,
  decorators: [
    (Story) => (
      <div className="w-[340px] bg-black/5 p-2.5">
        <Story />
      </div>
    ),
  ],
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

export const NoHeader: Story = {
  args: {
    children: (
      <div className="flex h-56 items-center justify-center text-xs font-bold text-gi-primary/50">
        Body
      </div>
    ),
  },
};

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
