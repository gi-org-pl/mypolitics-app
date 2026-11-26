import { describe, expect, it } from "vitest";

import { authClient } from "./authClient";

describe("authClient", () => {
  describe("given the API has no accounts yet", () => {
    it("is the stand-in, which answers without a session", async () => {
      sessionStorage.clear();

      expect(await authClient.getSession()).toBeNull();
      expect(await authClient.resumeSignIn()).toBeNull();
    });
  });
});
