import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { AuthSessionProvider } from "@/components/shared/AuthSessionProvider/AuthSessionProvider";
import {
  createMockAuthClient,
  MOCK_AUTH_STORAGE_KEY,
  type MockAuthClientOptions,
} from "@/services/auth/client/createMockAuthClient";
import type { TextStorage } from "@/types/storage";

import { SignInFlow } from "./SignInFlow";

// Every story runs the flow on the stand-in client, so each path can be
// clicked through: press a provider and follow what it answers. Each story
// starts from its own accounts, kept in memory.
const createStorage = (state?: unknown): TextStorage => {
  const items = new Map<string, string>();
  if (state) items.set(MOCK_AUTH_STORAGE_KEY, JSON.stringify(state));

  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => {
      items.set(key, value);
    },
    removeItem: (key) => {
      items.delete(key);
    },
  };
};

const withClient = (options: MockAuthClientOptions, state?: unknown) => ({
  render: (args: Parameters<typeof SignInFlow>[0]) => (
    <AuthSessionProvider
      client={createMockAuthClient({
        storage: createStorage(state),
        ...options,
      })}
    >
      <SignInFlow {...args} />
    </AuthSessionProvider>
  ),
});

const meta = {
  title: "Account/SignInFlow",
  component: SignInFlow,
  parameters: {
    viewport: { options: INITIAL_VIEWPORTS },
  },
  args: {
    heading: "Zaloguj się lub załóż konto",
    description:
      "Pierwsze logowanie zakłada konto, w którym tworzysz quizy. Quizy rozwiążesz bez logowania.",
    onSignedIn: fn(),
    onCancel: fn(),
    onBusyChange: fn(),
  },
} satisfies Meta<typeof SignInFlow>;

export default meta;

type Story = StoryObj<typeof meta>;

// Google has an account already: the sign-in finishes at once.
export const ExistingAccount: Story = withClient(
  {},
  {
    accounts: [
      {
        id: "story-account",
        displayName: "Ala Nowak",
        email: "ala.nowak@example.com",
        providers: ["google"],
      },
    ],
  },
);

// No provider has an account: the step opens.
export const NewAccount: Story = withClient({});

// Facebook's address belongs to an account made with Google.
export const AccountExists: Story = withClient({
  outcomes: { facebook: { accountExists: "google" } },
});

export const WindowClosed: Story = withClient({
  outcomes: {
    google: "window-closed",
    facebook: "window-closed",
    x: "window-closed",
  },
});

export const ProviderFailed: Story = withClient({
  outcomes: {
    google: "provider-failed",
    facebook: "provider-failed",
    x: "provider-failed",
  },
});

// The step opens, and saving the account fails.
export const SaveFails: Story = withClient({ failCompleteSignUp: true });
