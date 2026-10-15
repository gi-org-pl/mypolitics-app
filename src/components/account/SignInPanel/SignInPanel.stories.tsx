import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { SignInPanel } from "./SignInPanel";

// The card as the sign-in page shows it: 480 px wide on a computer, the
// width of the screen less 16 px on each side on a phone. The stories follow
// the frames of the Figma page "Logowanie i rejestracja - v2".
const meta = {
  title: "Account/SignInPanel",
  component: SignInPanel,
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
    heading: "Zaloguj się lub załóż konto",
    description:
      "Pierwsze logowanie zakłada konto, w którym tworzysz quizy. Quizy rozwiążesz bez logowania.",
    view: { kind: "choose" },
    termsHref: "/terms",
    privacyHref: "/privacy",
    onProviderSelect: fn(),
    onChooseAnother: fn(),
  },
} satisfies Meta<typeof SignInPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WaitingForGoogle: Story = {
  args: { view: { kind: "choose", waitingFor: "google" } },
};

export const WindowClosed: Story = {
  args: {
    view: {
      kind: "choose",
      error: { kind: "window-closed", provider: "facebook" },
    },
  },
};

export const ProviderFailed: Story = {
  args: {
    view: { kind: "choose", error: { kind: "provider-failed", provider: "x" } },
  },
};

export const Failed: Story = {
  args: { view: { kind: "choose", error: { kind: "failed" } } },
};

export const AccountExists: Story = {
  args: {
    view: {
      kind: "account-exists",
      provider: "facebook",
      ownerProvider: "google",
      email: "ala.nowak@example.com",
    },
  },
};

export const AccountExistsWaiting: Story = {
  args: {
    view: {
      kind: "account-exists",
      provider: "facebook",
      ownerProvider: "google",
      email: "ala.nowak@example.com",
      isWaiting: true,
    },
  },
};

export const WithCloseButton: Story = {
  args: {
    heading: "Najpierw zaloguj się",
    description:
      "Quiz zapiszemy na Twoim koncie. Pierwsze logowanie je zakłada.",
    onClose: fn(),
  },
};
