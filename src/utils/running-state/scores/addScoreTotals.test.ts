import { describe, expect, it } from "vitest";

import { addScoreTotals } from "./addScoreTotals";

describe("addScoreTotals()", () => {
  it("adds points to points and maximum to maximum", () => {
    expect(
      addScoreTotals(
        { points: 1, maximum: 2 },
        { points: 3.75, maximum: 3.75 },
      ),
    ).toEqual({ points: 4.75, maximum: 5.75 });
  });

  it("leaves both totals as they were", () => {
    const total = { points: 1, maximum: 2 };
    const added = { points: 0, maximum: 4 };

    addScoreTotals(total, added);

    expect(total).toEqual({ points: 1, maximum: 2 });
    expect(added).toEqual({ points: 0, maximum: 4 });
  });
});
