import { describe, expect, it } from "vitest";

import type { QuizOrientation } from "@/types/orientation";

import { selectOrientations } from "./selectOrientations";

const orientations: QuizOrientation[] = [
  { id: "a", type: "party", name: "Rafał Trzaskowski" },
  { id: "b", type: "identity", name: "Nowoczesny lider", isHidden: false },
  { id: "c", type: "party", name: "Krzysztof Stanowski", isHidden: true },
  { id: "d", type: "ideology", name: "Ekologia", isHidden: true },
  { id: "e", type: "party", name: "Magdalena Biejat" },
];

const getIds = (selected: QuizOrientation[]): string[] =>
  selected.map(({ id }) => id);

describe("selectOrientations()", () => {
  it("leaves hidden orientations out", () => {
    expect(getIds(selectOrientations(orientations))).toEqual(["a", "b", "e"]);
  });

  it("returns only the given type when one is passed", () => {
    expect(getIds(selectOrientations(orientations, "party"))).toEqual([
      "a",
      "e",
    ]);
    expect(getIds(selectOrientations(orientations, "identity"))).toEqual(["b"]);
  });

  it("keeps the order of the quiz", () => {
    const reversed = [...orientations].reverse();

    expect(getIds(selectOrientations(reversed))).toEqual(["e", "b", "a"]);
    expect(getIds(selectOrientations(reversed, "party"))).toEqual(["e", "a"]);
  });

  it("returns an empty list when every orientation of the type is hidden", () => {
    expect(selectOrientations(orientations, "ideology")).toEqual([]);
  });

  it("returns an empty list for a type the quiz does not have", () => {
    expect(selectOrientations(orientations, "compass")).toEqual([]);
    expect(selectOrientations([], "party")).toEqual([]);
  });

  it("returns the orientations themselves and does not change the list", () => {
    const selected = selectOrientations(orientations, "party");

    expect(selected[0]).toBe(orientations[0]);
    expect(orientations).toHaveLength(5);
  });
});
