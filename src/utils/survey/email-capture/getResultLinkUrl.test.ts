import { describe, expect, it } from "vitest";

import { getResultLinkUrl } from "./getResultLinkUrl";

describe("getResultLinkUrl()", () => {
  describe("given no value", () => {
    it.each([
      [undefined],
      [null],
      [""],
      ["   "],
      ["\n\t"],
    ])("returns undefined for a missing, empty or blank value: %j", (value) => {
      expect(getResultLinkUrl(value)).toBeUndefined();
    });
  });

  describe("given text that is not a web address", () => {
    it.each([
      ["link.mypolitics.test/send"],
      ["/v1/result-link"],
      ["not an address"],
      ["mailto:biuro@mypolitics.pl"],
      ["javascript:alert(1)"],
      ["ftp://link.mypolitics.test/send"],
      ["https://"],
    ])("returns undefined for text that is not a web address: %s", (value) => {
      expect(getResultLinkUrl(value)).toBeUndefined();
    });
  });

  describe("given a web address that is not encrypted", () => {
    it.each([
      ["http://link.mypolitics.test/send"],
      ["  http://link.mypolitics.test/send  "],
      ["HTTP://link.mypolitics.test/send"],
      ["http://localhost:8080/send"],
    ])("returns undefined for an http address: %s", (value) => {
      expect(getResultLinkUrl(value)).toBeUndefined();
    });
  });

  describe("given an https address", () => {
    it("returns an https address as written", () => {
      expect(getResultLinkUrl("https://link.mypolitics.test/send")).toBe(
        "https://link.mypolitics.test/send",
      );
    });

    it("returns an https address, trimmed", () => {
      expect(getResultLinkUrl("  https://link.mypolitics.test/send\n")).toBe(
        "https://link.mypolitics.test/send",
      );
    });

    it("accepts an upper-case scheme", () => {
      expect(getResultLinkUrl("HTTPS://link.mypolitics.test/send")).toBe(
        "HTTPS://link.mypolitics.test/send",
      );
    });
  });
});
