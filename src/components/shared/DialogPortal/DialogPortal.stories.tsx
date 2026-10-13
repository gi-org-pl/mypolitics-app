import type { Meta, StoryObj } from "@storybook/react-vite";

import { DialogPortal } from "./DialogPortal";

// The portal draws nothing of its own: what it is given is rendered into the
// body of the document, wherever the portal stands in the tree.
const meta = {
  title: "Shared/DialogPortal",
  component: DialogPortal,
  args: {
    children: (
      <p className="text-base text-gi-primary">
        Ta treść jest renderowana w body dokumentu.
      </p>
    ),
  },
} satisfies Meta<typeof DialogPortal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
