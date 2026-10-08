import { describe, expect, it } from "vitest";

import { getSessionStorageKey } from "./getSessionStorageKey";

describe("getSessionStorageKey()", () => {
  it("names the record of a quiz by its identifier", () => {
    expect(getSessionStorageKey("60beb898-a4e4-4160-88c4-07a9931ab499")).toBe(
      "mypolitics:survey-session:60beb898-a4e4-4160-88c4-07a9931ab499",
    );
  });

  it("gives two quizzes two keys", () => {
    expect(getSessionStorageKey("first")).not.toBe(
      getSessionStorageKey("second"),
    );
  });
});
