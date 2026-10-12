import { describe, expect, it } from "vitest";

import type { AxisPuzzleCheckpointCard } from "@/types/checkpoint";
import { createAxisPair } from "@/utils/vitest/createAxisPair";
import { createOrientation } from "@/utils/vitest/createOrientation";

import { getAxisPuzzleOutcome } from "./getAxisPuzzleOutcome";

const { start, end } = createAxisPair(
  "economy",
  "Interwencjonizm",
  "Wolny rynek",
  44,
  56,
);

const createCard = (
  leadingSide: "start" | "end",
): AxisPuzzleCheckpointCard => ({
  type: "axis-puzzle",
  boundary: 11,
  axisId: "economy",
  start,
  end,
  leadingSide,
  line: { pool: "axis-puzzle-ask", index: 0 },
});

describe("getAxisPuzzleOutcome()", () => {
  it("is a hit for the start pole when the start side leads", () => {
    expect(getAxisPuzzleOutcome(createCard("start"), start.orientation)).toBe(
      "hit",
    );
  });

  it("is a hit for the end pole when the end side leads", () => {
    expect(getAxisPuzzleOutcome(createCard("end"), end.orientation)).toBe(
      "hit",
    );
  });

  it("is a miss for the other pole", () => {
    expect(getAxisPuzzleOutcome(createCard("start"), end.orientation)).toBe(
      "miss",
    );
    expect(getAxisPuzzleOutcome(createCard("end"), start.orientation)).toBe(
      "miss",
    );
  });

  it("reads the side from the card and not from the values", () => {
    // The card says the start side led when it fired, whatever its values.
    expect(getAxisPuzzleOutcome(createCard("start"), start.orientation)).toBe(
      "hit",
    );
  });

  it("is a miss for an orientation that is not a pole of the card", () => {
    expect(
      getAxisPuzzleOutcome(
        createCard("end"),
        createOrientation("other", "Wolny rynek"),
      ),
    ).toBe("miss");
  });
});
