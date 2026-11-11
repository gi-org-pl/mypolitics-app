import { describe, expect, it } from "vitest";

import { createAuthAccount } from "./createAuthAccount";
import { createSessionValue } from "./createSessionValue";

describe("createSessionValue()", () => {
  describe("given nothing", () => {
    it("is signed out, with a fake client and ways to change the session that answer", async () => {
      const value = createSessionValue();

      expect(value.session).toEqual({ status: "signed-out" });
      expect(await value.client.getSession()).toBeNull();
      expect(await value.signOut()).toBe(true);
      expect(await value.refresh()).toBeUndefined();
      value.setSignedIn(createAuthAccount());
      expect(value.setSignedIn).toHaveBeenCalledTimes(1);
    });
  });

  describe("given overrides", () => {
    it("uses them in place of the defaults", () => {
      const account = createAuthAccount();
      const value = createSessionValue({
        session: { status: "signed-in", account },
      });

      expect(value.session).toEqual({ status: "signed-in", account });
    });
  });
});
