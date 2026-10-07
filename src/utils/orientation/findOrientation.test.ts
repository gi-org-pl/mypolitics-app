import { describe, expect, it } from "vitest";

import type { QuizOrientation } from "@/types/orientation";

import { findOrientation } from "./findOrientation";

const orientations: QuizOrientation[] = [
  { id: "a", type: "party", name: "Zieloni" },
  { id: "b", type: "party", name: "Krzysztof Stanowski", isHidden: true },
  { id: "c", type: "identity", name: "Rodzic" },
];

describe("findOrientation()", () => {
  it("returns the orientation with the id", () => {
    expect(findOrientation(orientations, "a")).toBe(orientations[0]);
    expect(findOrientation(orientations, "c")).toBe(orientations[2]);
  });

  it("returns a hidden orientation, marked hidden", () => {
    expect(findOrientation(orientations, "b")).toBe(orientations[1]);
    expect(findOrientation(orientations, "b")?.isHidden).toBe(true);
  });

  it("returns undefined for an unknown id", () => {
    expect(findOrientation(orientations, "x")).toBeUndefined();
    expect(findOrientation(orientations, "")).toBeUndefined();
    expect(findOrientation(orientations, "A")).toBeUndefined();
    expect(findOrientation([], "a")).toBeUndefined();
  });

  it("returns the first of two orientations with the same id", () => {
    const first = { id: "a", name: "First" };

    expect(findOrientation([first, { id: "a", name: "Second" }], "a")).toBe(
      first,
    );
  });
});
