import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { AccountSetupForm } from "./AccountSetupForm";

// The step as the sign-in page shows it, after a first sign-in with Google.
// The stories follow the frames "First run" of the Figma page "Logowanie i
// rejestracja - v2"; the states with messages, saving and a failed save are
// not drawn there.
const meta = {
  title: "Account/AccountSetupForm",
  component: AccountSetupForm,
  parameters: {
    layout: "fullscreen",
    viewport: { options: INITIAL_VIEWPORTS },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-120 px-4 py-8 md:px-0">
        <Story />
      </div>
    ),
  ],
  args: {
    provider: "google",
    suggestedName: "Ala Nowak",
    termsHref: "/terms",
    privacyHref: "/privacy",
    onSubmit: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof AccountSetupForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("checkbox", { name: /16 lat/ }));
    await userEvent.click(canvas.getByRole("checkbox", { name: /Akceptuję/ }));
  },
};

export const Missing: Story = {
  args: { suggestedName: undefined },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Gotowe" }));

    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

export const Saving: Story = {
  args: { isSaving: true },
};

export const SaveFailed: Story = {
  args: { hasSaveFailed: true },
};

export const Facebook: Story = {
  args: { provider: "facebook" },
};

export const X: Story = {
  args: { provider: "x" },
};

export const WithCloseButton: Story = {
  args: { onClose: fn() },
};
