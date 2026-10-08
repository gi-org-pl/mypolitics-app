import { describe, expect, it } from "vitest";

import type { NolanPosition } from "@/types/results";

import { getPositionStyle } from "./getPositionStyle";

const at = (x: number, y: number) =>
  getPositionStyle({ x, y } as NolanPosition);

describe("getPositionStyle()", () => {
  it("puts the centre in the middle of the map", () => {
    expect(at(0, 0)).toEqual({ "--nolan-x": "50%", "--nolan-y": "50%" });
  });

  it("runs the horizontal axis left to right and the vertical bottom to top", () => {
    expect(at(-1, 1)).toEqual({ "--nolan-x": "0%", "--nolan-y": "0%" });
    expect(at(1, -1)).toEqual({ "--nolan-x": "100%", "--nolan-y": "100%" });
    expect(at(-0.5, 0.5)).toEqual({ "--nolan-x": "25%", "--nolan-y": "25%" });
  });
});
