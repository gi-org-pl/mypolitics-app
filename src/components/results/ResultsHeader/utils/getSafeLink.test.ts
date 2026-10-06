import { describe, expect, it } from "vitest";

import { getSafeLink } from "./getSafeLink";

describe("getSafeLink()", () => {
  describe("given an http or https address with a label", () => {
    it("returns the address and the label", () => {
      expect(
        getSafeLink({ url: "https://example.org/a", label: "Program" }),
      ).toEqual({ href: "https://example.org/a", label: "Program" });
      expect(
        getSafeLink({ url: "http://example.org/b", label: "Program" }),
      ).toEqual({ href: "http://example.org/b", label: "Program" });
    });

    it("collapses the label into one line", () => {
      expect(
        getSafeLink({ url: "https://example.org/a", label: " Nasz\nprogram " })
          ?.label,
      ).toBe("Nasz program");
    });

    it("trims the address", () => {
      expect(getSafeLink({ url: "  https://example.org/a \n" })).toEqual({
        href: "https://example.org/a",
        label: "https://example.org/a",
      });
    });
  });

  describe("given an empty label", () => {
    it("uses the address as the label", () => {
      expect(
        getSafeLink({ url: "https://example.org/a", label: "  " })?.label,
      ).toBe("https://example.org/a");
      expect(getSafeLink({ url: "https://example.org/a" })?.label).toBe(
        "https://example.org/a",
      );
    });
  });

  describe("given an address that is not http or https", () => {
    it("returns null", () => {
      expect(getSafeLink({ url: "javascript:alert(1)" })).toBeNull();
      expect(getSafeLink({ url: "mailto:autor@example.org" })).toBeNull();
      expect(getSafeLink({ url: "data:text/html,x" })).toBeNull();
    });
  });

  describe("given an address that cannot be parsed", () => {
    it("returns null", () => {
      expect(getSafeLink({ url: "/program" })).toBeNull();
      expect(getSafeLink({ url: "example.org" })).toBeNull();
      expect(getSafeLink({ url: "" })).toBeNull();
    });
  });

  describe("given no link or an address that is not a string", () => {
    it("returns null", () => {
      expect(getSafeLink()).toBeNull();
      expect(getSafeLink({ url: undefined as unknown as string })).toBeNull();
      expect(getSafeLink({ url: 42 as unknown as string })).toBeNull();
    });
  });
});
