import { describe, expect, it } from "vitest";

import type { NolanAxis } from "../NolanChart.types";
import { getAxisValues } from "./getAxisValues";

const createAxis = (start?: number, end?: number): NolanAxis => ({
  name: "Gospodarka",
  start: { entry: { orientation: { id: "a", name: "A" }, value: start } },
  end: { entry: { orientation: { id: "b", name: "B" }, value: end } },
});

describe("getAxisValues()", () => {
  it("returns the values of both poles", () => {
    expect(getAxisValues(createAxis(77, 23))).toEqual({ start: 77, end: 23 });
  });

  it("keeps an absent value absent", () => {
    expect(getAxisValues(createAxis(undefined, 23))).toEqual({
      start: undefined,
      end: 23,
    });
  });

  it("does not throw on a missing or incomplete axis", () => {
    expect(getAxisValues()).toEqual({ start: undefined, end: undefined });
    expect(getAxisValues({ name: "X" } as unknown as NolanAxis)).toEqual({
      start: undefined,
      end: undefined,
    });
  });
});
