import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { AuthClient } from "@/types/auth";
import { useAuthSession } from "@/utils/auth/useAuthSession";
import { createAuthAccount } from "@/utils/vitest/auth/createAuthAccount";
import { createFakeAuthClient } from "@/utils/vitest/auth/createFakeAuthClient";

import { AuthSessionProvider } from "./AuthSessionProvider";

// The provider only composes: what the session does is tested on
// useSessionState.
const SessionProbe = () => {
  const { session } = useAuthSession();

  return (
    <p>
      {session.status === "signed-in"
        ? session.account.displayName
        : session.status}
    </p>
  );
};

const renderProvider = (client?: AuthClient) =>
  render(
    <AuthSessionProvider client={client}>
      <SessionProbe />
    </AuthSessionProvider>,
  );

vi.mock("@/services/auth/client/authClient", async () => {
  const { createFakeAuthClient: createDefault } = await import(
    "@/utils/vitest/auth/createFakeAuthClient"
  );

  return {
    authClient: createDefault({
      getSession: () => Promise.resolve(createAuthAccountName("Domyślny")),
    }),
  };
});

const createAuthAccountName = (displayName: string) => ({
  id: "default",
  displayName,
  provider: "google" as const,
});

describe("AuthSessionProvider", () => {
  describe("given a client", () => {
    it("hands the session it reads to the components inside", async () => {
      renderProvider(
        createFakeAuthClient({
          getSession: vi.fn().mockResolvedValue(createAuthAccount()),
        }),
      );

      expect(await screen.findByText("Ala Nowak")).toBeInTheDocument();
    });
  });

  describe("given no client", () => {
    it("uses the app's client", async () => {
      renderProvider();

      expect(await screen.findByText("Domyślny")).toBeInTheDocument();
    });
  });
});
