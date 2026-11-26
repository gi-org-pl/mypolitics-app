import { describe, expect, it, vi } from "vitest";

import { createFakeAuthClient } from "./createFakeAuthClient";

describe("createFakeAuthClient()", () => {
  describe("given nothing", () => {
    it("is signed out and answers every call with nothing in particular", async () => {
      const client = createFakeAuthClient();

      expect(await client.getSession()).toBeNull();
      expect(await client.signIn("google")).toEqual({ kind: "failed" });
      expect(await client.resumeSignIn()).toBeNull();
      expect(
        await client.completeSignUp("pending-1", {
          displayName: "Ala",
          isAgeDeclared: true,
          hasAcceptedTerms: true,
        }),
      ).toEqual({ kind: "failed" });
      expect(await client.cancelPending("pending-1")).toBeUndefined();
      expect(await client.signOut()).toBeUndefined();
    });
  });

  describe("given an override", () => {
    it("uses it in place of the default", async () => {
      const getSession = vi.fn().mockResolvedValue({
        id: "a",
        displayName: "Ola",
        provider: "x",
      });

      const client = createFakeAuthClient({ getSession });

      expect(await client.getSession()).toMatchObject({ displayName: "Ola" });
      expect(getSession).toHaveBeenCalledOnce();
    });
  });
});
