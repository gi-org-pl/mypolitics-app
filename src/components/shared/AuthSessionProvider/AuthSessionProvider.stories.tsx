import type { Meta, StoryObj } from "@storybook/react-vite";

import type { AuthAccount, AuthClient } from "@/types/auth";
import { useAuthSession } from "@/utils/auth/useAuthSession";

import { AuthSessionProvider } from "./AuthSessionProvider";

// The provider draws nothing of its own. The stories show what it holds for
// the components inside it, with a client that answers at once.

const ACCOUNT: AuthAccount = {
  id: "story-account",
  displayName: "Ala Nowak",
  email: "ala.nowak@example.com",
  provider: "google",
};

const createStoryClient = (
  getSession: AuthClient["getSession"],
): AuthClient => ({
  getSession,
  signIn: async () => ({ kind: "failed" }),
  resumeSignIn: async () => null,
  completeSignUp: async () => ({ kind: "failed" }),
  cancelPending: async () => undefined,
  signOut: async () => undefined,
});

const SessionState = () => {
  const { session, signOut } = useAuthSession();

  return (
    <div className="flex flex-col items-start gap-2 text-gi-primary">
      <p>
        <strong>status:</strong> {session.status}
      </p>
      {session.status === "signed-in" && (
        <>
          <p>
            <strong>account:</strong> {session.account.displayName} (
            {session.account.provider})
          </p>
          <button
            type="button"
            className="underline"
            onClick={() => void signOut()}
          >
            signOut()
          </button>
        </>
      )}
    </div>
  );
};

const meta = {
  title: "Shared/AuthSessionProvider",
  component: AuthSessionProvider,
  args: {
    children: <SessionState />,
  },
} satisfies Meta<typeof AuthSessionProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SignedOut: Story = {
  args: {
    client: createStoryClient(async () => null),
  },
};

export const SignedIn: Story = {
  args: {
    client: createStoryClient(async () => ACCOUNT),
  },
};

export const Unknown: Story = {
  args: {
    client: createStoryClient(() => new Promise(() => undefined)),
  },
};

export const ClientUnreachable: Story = {
  args: {
    client: createStoryClient(async () => {
      throw new Error("The API cannot be reached");
    }),
  },
};
