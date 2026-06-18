import type { Meta, StoryObj } from "@storybook/react";
import { ResultsAxis } from "./ResultsAxis";

const meta: Meta<typeof ResultsAxis> = {
  title: "Results/ResultsAxis",
  component: ResultsAxis,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-[600px]">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ResultsAxis>;

export const Default: Story = {
  args: {
    left: {
      name: "Left",
      iconUrl: "https://api.dicebear.com/7.x/icons/svg?seed=left",
      value: 70,
      color: "gi-blue",
    },
    right: {
      name: "Right",
      iconUrl: "https://api.dicebear.com/7.x/icons/svg?seed=right",
      value: 20,
      color: "gi-red",
    },
    isHighlighted: true,
  },
};

export const StrongLean: Story = {
  args: {
    left: {
      name: "Left",
      iconUrl: "https://api.dicebear.com/7.x/icons/svg?seed=lib",
      value: 70,
      color: "gi-blue",
    },
    right: {
      name: "Right",
      iconUrl: "https://api.dicebear.com/7.x/icons/svg?seed=auth",
      value: 10,
      color: "gi-red",
    },
    isHighlighted: true,
  },
};

export const Equal: Story = {
  args: {
    left: {
      name: "Left Side",
      iconUrl: "https://api.dicebear.com/7.x/icons/svg?seed=left",
      value: 50,
      color: "gi-blue",
    },
    right: {
      name: "Right Side",
      iconUrl: "https://api.dicebear.com/7.x/icons/svg?seed=right",
      value: 50,
      color: "gi-red",
    },
    isHighlighted: true,
  },
};

export const FullOneSide: Story = {
  args: {
    left: {
      name: "Empty",
      iconUrl: "https://api.dicebear.com/7.x/icons/svg?seed=empty",
      value: 0,
      color: "gi-gray",
    },
    right: {
      name: "Full",
      iconUrl: "https://api.dicebear.com/7.x/icons/svg?seed=full",
      value: 100,
      color: "gi-green",
    },
    isHighlighted: true,
  },
};

export const Muted: Story = {
  args: {
    left: {
      name: "Left",
      iconUrl: "https://api.dicebear.com/7.x/icons/svg?seed=empty",
      value: 70,
      color: "gi-gray",
    },
    right: {
      name: "Right",
      iconUrl: "https://api.dicebear.com/7.x/icons/svg?seed=full",
      value: 15,
      color: "gi-green",
    },
    isHighlighted: false,
  },
};

export const FractionalPercent: Story = {
  args: {
    left: {
      name: "Fractional",
      iconUrl: "https://api.dicebear.com/7.x/icons/svg?seed=frac",
      value: 66.6,
      color: "gi-orange",
    },
    right: {
      name: "Remaining",
      iconUrl: "https://api.dicebear.com/7.x/icons/svg?seed=rem",
      value: 33.3,
      color: "gi-blue",
    },
    isHighlighted: true,
  },
};

export const NotNormalized: Story = {
  args: {
    left: {
      name: "Left",
      iconUrl: "https://api.dicebear.com/7.x/icons/svg?seed=left",
      value: 30,
      color: "gi-blue",
    },
    right: {
      name: "Right",
      iconUrl: "https://api.dicebear.com/7.x/icons/svg?seed=right",
      value: 40,
      color: "gi-red",
    },
    isHighlighted: true,
    isNormalized: false,
  },
};

export const Clickable: Story = {
  args: {
    ...Default.args,
    onSideClick: (side) => console.log(`Side clicked: ${side}`),
  },
};
