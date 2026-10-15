import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { AuthAccount, AuthClient, AuthSessionValue } from "@/types/auth";
import { useAuthSession } from "@/utils/auth/useAuthSession";
import { createAuthAccount } from "@/utils/vitest/auth/createAuthAccount";
import { createFakeAuthClient } from "@/utils/vitest/auth/createFakeAuthClient";

import { AuthSessionProvider } from "./AuthSessionProvider";

const SessionProbe = ({
  onValue,
}: {
  onValue: (value: AuthSessionValue) => void;
}) => {
  const value = useAuthSession();
  onValue(value);

  return (
    <p>
      {value.session.status === "signed-in"
        ? value.session.account.displayName
        : value.session.status}
    </p>
  );
};

const renderProvider = (client: AuthClient) => {
  let latest: AuthSessionValue | undefined;

  render(
    <AuthSessionProvider client={client}>
      <SessionProbe
        onValue={(value) => {
          latest = value;
        }}
      />
    </AuthSessionProvider>,
  );

  return () => {
    if (!latest) throw new Error("The probe has not rendered");
    return latest;
  };
};

const deferred = <Value,>() => {
  let resolve: (value: Value) => void = () => undefined;
  const promise = new Promise<Value>((done) => {
    resolve = done;
  });

  return { promise, resolve };
};

describe("AuthSessionProvider", () => {
  describe("given the client has not answered yet", () => {
    it("holds an unknown session", () => {
      const client = createFakeAuthClient({
        getSession: () => new Promise<AuthAccount | null>(() => undefined),
      });

      renderProvider(client);

      expect(screen.getByText("unknown")).toBeInTheDocument();
    });
  });

  describe("given the client returns an account", () => {
    it("is signed in with it", async () => {
      const client = createFakeAuthClient({
        getSession: vi.fn().mockResolvedValue(createAuthAccount()),
      });

      renderProvider(client);

      expect(await screen.findByText("Ala Nowak")).toBeInTheDocument();
    });
  });

  describe("given the client returns no account", () => {
    it("is signed out", async () => {
      renderProvider(createFakeAuthClient());

      expect(await screen.findByText("signed-out")).toBeInTheDocument();
    });
  });

  describe("given the client cannot answer", () => {
    it("is signed out", async () => {
      const client = createFakeAuthClient({
        getSession: vi.fn().mockRejectedValue(new Error("offline")),
      });

      renderProvider(client);

      expect(await screen.findByText("signed-out")).toBeInTheDocument();
    });
  });

  describe("given a signed-in session", () => {
    it("signs out through the client", async () => {
      const client = createFakeAuthClient({
        getSession: vi.fn().mockResolvedValue(createAuthAccount()),
      });
      const value = renderProvider(client);
      await screen.findByText("Ala Nowak");

      await act(() => value().signOut());

      expect(client.signOut).toHaveBeenCalledOnce();
      expect(screen.getByText("signed-out")).toBeInTheDocument();
    });

    it("is signed out even when the client cannot end the session", async () => {
      const client = createFakeAuthClient({
        getSession: vi.fn().mockResolvedValue(createAuthAccount()),
        signOut: vi.fn().mockRejectedValue(new Error("offline")),
      });
      const value = renderProvider(client);
      await screen.findByText("Ala Nowak");

      await act(() => value().signOut());

      expect(screen.getByText("signed-out")).toBeInTheDocument();
    });
  });

  describe("given any session", () => {
    it("is signed in with the account a sign-in screen hands over", async () => {
      const value = renderProvider(createFakeAuthClient());
      await screen.findByText("signed-out");

      act(() => value().setSignedIn(createAuthAccount({ displayName: "Ola" })));

      expect(screen.getByText("Ola")).toBeInTheDocument();
    });

    it("asks the client again on refresh", async () => {
      const getSession = vi
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(createAuthAccount());
      const value = renderProvider(createFakeAuthClient({ getSession }));
      await screen.findByText("signed-out");

      await act(() => value().refresh());

      expect(screen.getByText("Ala Nowak")).toBeInTheDocument();
    });
  });

  describe("given a sign-in finishes before the first answer of the client", () => {
    it("keeps the sign-in when the late answer says signed out", async () => {
      const first = deferred<AuthAccount | null>();
      const value = renderProvider(
        createFakeAuthClient({ getSession: () => first.promise }),
      );

      act(() => value().setSignedIn(createAuthAccount({ displayName: "Ola" })));
      await act(async () => first.resolve(null));

      await waitFor(() => expect(screen.getByText("Ola")).toBeInTheDocument());
    });
  });
});
