import type { Meta, StoryObj } from "@storybook/react";
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
import { MemoryRouter } from "react-router";

import { Error404 } from "./Error404";

const meta: Meta<typeof Error404> = {
  title: "Component/Error404",
  component: Error404,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Desktop: Story = {};
export const Mobile: Story = {
  globals: {
    viewport: {
      value: "iphone6",
    },
  },
};
