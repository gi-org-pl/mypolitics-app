import { describe, expect, it } from "vitest";

import type { PositionPuzzleCheckpointCard } from "@/types/checkpoint";
import { createOrientation } from "@/utils/vitest/createOrientation";

import { getPositionPuzzleRows } from "./getPositionPuzzleRows";

const LEADER = createOrientation("green", "Zielony postępowiec", {
  type: "identity",
  color: "#e91e63",
  imageUrl: "https://example.com/green.png",
});
const SECOND = createOrientation("national", "Narodowy konserwatysta", {
  type: "identity",
  color: "#3f51b5",
  imageUrl: "https://example.com/national.png",
});
const THIRD = createOrientation("sovereign", "Suwerenny patriota", {
  type: "identity",
});

const createCard = (): PositionPuzzleCheckpointCard => ({
  type: "position-puzzle",
  boundary: 5,
  leader: LEADER,
  closeness: 79,
  options: [SECOND, LEADER, THIRD],
  line: { pool: "position-puzzle-ask", index: 0 },
});

describe("getPositionPuzzleRows()", () => {
  it("returns the options of the card in their order", () => {
    expect(getPositionPuzzleRows(createCard()).map(({ id }) => id)).toEqual([
      "national",
      "green",
      "sovereign",
    ]);
  });

  it("removes the colour of each and keeps its name and image", () => {
    const rows = getPositionPuzzleRows(createCard());

    expect(rows).toEqual([
      {
        id: "national",
        type: "identity",
        name: "Narodowy konserwatysta",
        imageUrl: "https://example.com/national.png",
      },
      {
        id: "green",
        type: "identity",
        name: "Zielony postępowiec",
        imageUrl: "https://example.com/green.png",
      },
      { id: "sovereign", type: "identity", name: "Suwerenny patriota" },
    ]);

    for (const row of rows) expect(row).not.toHaveProperty("color");
  });

  it("does not change the card it was given", () => {
    const card = createCard();
    const before = JSON.stringify(card);

    getPositionPuzzleRows(card);

    expect(JSON.stringify(card)).toBe(before);
    expect(card.options[0].color).toBe("#3f51b5");
    expect(card.leader.color).toBe("#e91e63");
  });
});
