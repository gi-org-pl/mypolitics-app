import { describe, expect, it } from "vitest";

import { toDescription } from "./toDescription";

describe("toDescription()", () => {
  it("trims the text", () => {
    expect(toDescription("  Opis. \n")).toBe("Opis.");
  });

  it("keeps a paragraph break as one blank line", () => {
    expect(toDescription("Raz.\n\nDwa.")).toBe("Raz.\n\nDwa.");
    expect(toDescription("Raz.\n \t\n\n\nDwa.")).toBe("Raz.\n\nDwa.");
  });

  it("keeps a single line break", () => {
    expect(toDescription("Raz.\nDwa.")).toBe("Raz.\nDwa.");
  });

  it("reads Windows and old Mac line endings as line breaks", () => {
    expect(toDescription("Raz.\r\n \r\n\r\nDwa.\rTrzy.")).toBe(
      "Raz.\n\nDwa.\nTrzy.",
    );
  });

  it("leaves markup as written", () => {
    expect(toDescription("<b>Mocne</b> [a](b)")).toBe("<b>Mocne</b> [a](b)");
  });

  it("returns an empty text for whitespace only", () => {
    expect(toDescription(" \n\t ")).toBe("");
  });

  it("returns an empty text for a missing or non-text value", () => {
    expect(toDescription()).toBe("");
    expect(toDescription(5 as unknown as string)).toBe("");
    expect(toDescription(null as unknown as string)).toBe("");
  });
});
