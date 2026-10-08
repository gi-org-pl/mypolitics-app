import { describe, expect, it } from "vitest";

import {
  axisPuzzleCard,
  createRecord,
  doubleClosenessCard,
  halfwayCard,
  singleClosenessCard,
} from "./getNextCheckpoint.fixtures";
import { getShownCards } from "./getShownCards";

const { cardsShown } = createRecord([
  singleClosenessCard,
  halfwayCard,
  {
    card: axisPuzzleCard,
    revealLines: { hit: { pool: "axis-puzzle-hit", index: 0 } },
  },
  doubleClosenessCard,
]);

describe("getShownCards()", () => {
  it("returns the cards of the type, oldest first", () => {
    expect(getShownCards(cardsShown, "axis-closeness")).toEqual([
      singleClosenessCard,
      doubleClosenessCard,
    ]);
    expect(getShownCards(cardsShown, "axis-puzzle")).toEqual([axisPuzzleCard]);
  });

  it("returns nothing for a type that was not shown", () => {
    expect(getShownCards(cardsShown, "stats")).toEqual([]);
    expect(getShownCards([], "halfway")).toEqual([]);
  });
});
