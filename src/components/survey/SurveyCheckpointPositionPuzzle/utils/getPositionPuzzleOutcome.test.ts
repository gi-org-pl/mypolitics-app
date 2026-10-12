import { describe, expect, it } from "vitest";

import type { PositionPuzzleCheckpointCard } from "@/types/checkpoint";
import { createOrientation } from "@/utils/vitest/createOrientation";

import { getPositionPuzzleOutcome } from "./getPositionPuzzleOutcome";

const LEADER = createOrientation("green", "Zielony postępowiec");
const SECOND = createOrientation("national", "Narodowy konserwatysta");
const THIRD = createOrientation("sovereign", "Suwerenny patriota");

const CARD: PositionPuzzleCheckpointCard = {
  type: "position-puzzle",
  boundary: 5,
  leader: LEADER,
  closeness: 79,
  options: [SECOND, LEADER, THIRD],
  line: { pool: "position-puzzle-ask", index: 0 },
};

describe("getPositionPuzzleOutcome()", () => {
  it("is a hit for the leader", () => {
    expect(getPositionPuzzleOutcome(CARD, LEADER)).toBe("hit");
  });

  it("is a hit for the row of the leader, which carries no colour", () => {
    expect(
      getPositionPuzzleOutcome(
        { ...CARD, leader: { ...LEADER, color: "#e91e63" } },
        { id: "green", type: "ideology", name: "Zielony postępowiec" },
      ),
    ).toBe("hit");
  });

  it("is a miss for either other option", () => {
    expect(getPositionPuzzleOutcome(CARD, SECOND)).toBe("miss");
    expect(getPositionPuzzleOutcome(CARD, THIRD)).toBe("miss");
  });

  it("is decided by the identifier, not by the name", () => {
    expect(
      getPositionPuzzleOutcome(
        CARD,
        createOrientation("another", "Zielony postępowiec"),
      ),
    ).toBe("miss");
  });
});
