import { describe, expect, it } from "vitest";

import { getSafeLink } from "./getSafeLink";

describe("getSafeLink()", () => {
  describe("given an http or https address with a label", () => {
    it("returns the address and the label", () => {
      expect(getSafeLink("https://example.org/a", "Program")).toEqual({
        href: "https://example.org/a",
        label: "Program",
      });
      expect(getSafeLink("http://example.org/b", "Program")).toEqual({
        href: "http://example.org/b",
        label: "Program",
      });
    });

    it("collapses the label into one line", () => {
      expect(
        getSafeLink("https://example.org/a", " Nasz\nprogram ")?.label,
      ).toBe("Nasz program");
    });

    it("trims the address", () => {
      expect(getSafeLink("  https://example.org/a \n")).toEqual({
        href: "https://example.org/a",
        label: "https://example.org/a",
      });
    });
  });

  describe("given an empty label", () => {
    it("uses the address as the label", () => {
      expect(getSafeLink("https://example.org/a", "  ")?.label).toBe(
        "https://example.org/a",
      );
      expect(getSafeLink("https://example.org/a")?.label).toBe(
        "https://example.org/a",
      );
    });
  });

  describe("given an address that is not http or https", () => {
    it("returns null", () => {
      expect(getSafeLink("javascript:alert(1)")).toBeNull();
      expect(getSafeLink("mailto:autor@example.org")).toBeNull();
      expect(getSafeLink("data:text/html,x")).toBeNull();
    });
  });

  describe("given an address that cannot be parsed", () => {
    it("returns null", () => {
      expect(getSafeLink("/program")).toBeNull();
      expect(getSafeLink("example.org")).toBeNull();
      expect(getSafeLink("")).toBeNull();
    });
  });

  describe("given no address or one that is not a string", () => {
    it("returns null", () => {
      expect(getSafeLink()).toBeNull();
      expect(getSafeLink(undefined, "Program")).toBeNull();
      expect(getSafeLink(42 as unknown as string)).toBeNull();
    });
  });
});
