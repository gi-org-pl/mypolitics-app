import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import { userEvent, within } from "storybook/test";
import { PATHS } from "@/constants/paths";
import type { AuthAccount, AuthClient, AuthSession } from "@/types/auth";
import { AuthSessionContext } from "@/utils/auth/authSessionContext";
import { Header } from "./Header";
import type { HeaderStoryProps } from "./Header.types";

// The session the header reads, without a client behind it: signing out in
// a story only pretends to.
const STORY_CLIENT = {} as AuthClient;

const HeaderStory = ({
  initialPath,
  session = { status: "unknown" },
}: HeaderStoryProps) => (
  <MemoryRouter initialEntries={[initialPath]}>
    <AuthSessionContext
      value={{
        session,
        client: STORY_CLIENT,
        setSignedIn: () => undefined,
        signOut: async () => true,
        refresh: async () => undefined,
      }}
    >
      <Header />
    </AuthSessionContext>
  </MemoryRouter>
);

const ACCOUNT: AuthAccount = {
  id: "story-account",
  displayName: "Ala Nowak",
  email: "ala.nowak@example.com",
  provider: "google",
};

const signedIn = (account: Partial<AuthAccount> = {}): AuthSession => ({
  status: "signed-in",
  account: { ...ACCOUNT, ...account },
});

const meta: Meta<typeof HeaderStory> = {
  title: "Shared/Header",
  component: HeaderStory,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    initialPath: PATHS.home,
  },
};

export default meta;

type Story = StoryObj<typeof HeaderStory>;

export const Default: Story = {};

export const ActiveDebaty: Story = {
  args: {
    initialPath: PATHS.debates,
  },
};

export const ActiveQuizy: Story = {
  args: {
    initialPath: PATHS.quizzes,
  },
};

export const MenuOpen: Story = {
  args: {
    initialPath: PATHS.quizzes,
  },
  globals: {
    viewport: { value: "mobile1" },
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button"));
  },
};

// Header / Desktop / Signed out
export const BarSignedOut: Story = {
  args: { session: { status: "signed-out" } },
};

// Header / Desktop / Signed in - account menu open
export const BarSignedInMenuOpen: Story = {
  args: { session: signedIn() },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Ala Nowak" }),
    );
  },
};

// Header / Mobile / Signed out - menu open
export const MenuSignedOut: Story = {
  args: { session: { status: "signed-out" } },
  globals: { viewport: { value: "mobile1" } },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", {
        name: "Otwórz menu nawigacji",
      }),
    );
  },
};

// Header / Mobile / Signed in - menu open
export const MenuSignedIn: Story = {
  args: { session: signedIn() },
  globals: { viewport: { value: "mobile1" } },
  play: MenuSignedOut.play,
};

// Not drawn: a name too long for the pill, a photo, an X account without an
// address.
export const LongName: Story = {
  args: {
    session: signedIn({
      displayName: "Aleksandra Konstantynopolitańczykiewiczówna",
    }),
  },
  play: BarSignedInMenuOpen.play,
};

export const WithPhoto: Story = {
  args: {
    session: signedIn({
      avatarUrl:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='%2348a0b4'/%3E%3C/svg%3E",
    }),
  },
};

export const WithoutEmail: Story = {
  args: { session: signedIn({ email: undefined, provider: "x" }) },
  play: BarSignedInMenuOpen.play,
};
