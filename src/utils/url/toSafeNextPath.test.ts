import { describe, expect, it } from "vitest";

import { toSafeNextPath } from "./toSafeNextPath";

describe("toSafeNextPath()", () => {
  describe("given a path inside the app", () => {
    it("keeps it with its query and fragment", () => {
      expect(toSafeNextPath("/quizzes/mypolitics?tab=all#top")).toBe(
        "/quizzes/mypolitics?tab=all#top",
      );
    });
  });

  describe("given nothing", () => {
    it("is the home page", () => {
      expect(toSafeNextPath(null)).toBe("/");
      expect(toSafeNextPath("")).toBe("/");
    });
  });

  describe.each([
    "https://example.com",
    "//example.com/path",
    String.raw`/\example.com`,
    "/\t/example.com",
    "javascript:alert(1)",
    "quizzes",
  ])("given %s", (next) => {
    it("is the home page", () => {
      expect(toSafeNextPath(next)).toBe("/");
    });
  });

  describe("given the sign-in page itself", () => {
    it("is the home page", () => {
      expect(toSafeNextPath("/login?next=%2Flogin")).toBe("/");
    });
  });
});
