import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { ChevronDown } from "./ChevronDown";

const meta = {
  title: "Shared/ChevronDown",
  component: ChevronDown,
  tags: ["autodocs"],
} satisfies Meta<typeof ChevronDown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <ChevronDown
        isExpanded={isExpanded}
        aria-label={isExpanded ? "Zwiń" : "Rozwiń"}
        onClick={() => setIsExpanded((value) => !value)}
      />
    );
  },
};
