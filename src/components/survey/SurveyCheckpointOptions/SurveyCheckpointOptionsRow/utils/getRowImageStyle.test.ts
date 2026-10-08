import { describe, expect, it } from "vitest";

import { createOrientation } from "@/utils/vitest/createOrientation";

import { getRowImageStyle } from "./getRowImageStyle";

describe("getRowImageStyle()", () => {
  it("paints the colour and, over it, the image", () => {
    expect(
      getRowImageStyle(
        createOrientation("a", "A", {
          color: "#e74c3c",
          imageUrl: "https://example.com/a.svg",
        }),
      ),
    ).toEqual({
      backgroundColor: "#e74c3c",
      backgroundImage: 'url("https://example.com/a.svg")',
    });
  });

  it("paints the colour alone without an image", () => {
    expect(
      getRowImageStyle(createOrientation("a", "A", { color: " #e74c3c " })),
    ).toEqual({ backgroundColor: "#e74c3c" });
    expect(
      getRowImageStyle(
        createOrientation("a", "A", { color: "#e74c3c", imageUrl: "  " }),
      ),
    ).toEqual({ backgroundColor: "#e74c3c" });
  });

  it("leaves the colour out when there is none, or when it is not a colour", () => {
    expect(
      getRowImageStyle(
        createOrientation("a", "A", { imageUrl: "https://example.com/a.svg" }),
      ),
    ).toEqual({ backgroundImage: 'url("https://example.com/a.svg")' });
    expect(
      getRowImageStyle(
        createOrientation("a", "A", { color: "red; background: url(x)" }),
      ),
    ).toEqual({});
  });

  it("paints nothing with neither image nor colour", () => {
    expect(getRowImageStyle(createOrientation("a", "A"))).toEqual({});
  });

  it("keeps an address from being read as anything but an address", () => {
    expect(
      getRowImageStyle(createOrientation("a", "A", { imageUrl: 'a"); x: ("' })),
    ).toEqual({ backgroundImage: 'url("a\\22 ); x: (\\22 ")' });
  });

  it("does not throw for an image that is not text", () => {
    expect(
      getRowImageStyle(
        createOrientation("a", "A", { imageUrl: 5 as unknown as string }),
      ),
    ).toEqual({});
  });
});
