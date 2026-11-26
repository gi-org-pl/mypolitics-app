import { describe, expect, it } from "vitest";

import { toAccount } from "./toAccount";

describe("toAccount()", () => {
  it("gives the account with the provider it is signed in with", () => {
    expect(
      toAccount(
        {
          id: "mock-account-1",
          displayName: "Ala",
          email: "ala@example.com",
          providers: ["google", "x"],
        },
        "x",
      ),
    ).toEqual({
      id: "mock-account-1",
      displayName: "Ala",
      email: "ala@example.com",
      provider: "x",
    });
  });

  it("gives no address when the account has none", () => {
    expect(
      toAccount(
        { id: "mock-account-2", displayName: "Ola", providers: ["x"] },
        "x",
      ),
    ).toEqual({
      id: "mock-account-2",
      displayName: "Ola",
      email: undefined,
      provider: "x",
    });
  });
});
