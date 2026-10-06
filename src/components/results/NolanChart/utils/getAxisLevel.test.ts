import { describe, expect, it } from "vitest";

import { getAxisLevel } from "./getAxisLevel";

describe("getAxisLevel()", () => {
  it("returns centre nearer to zero than 1/3", () => {
    expect(getAxisLevel(0).level).toBe("centre");
    expect(getAxisLevel(0.33).level).toBe("centre");
    expect(getAxisLevel(-0.33).level).toBe("centre");
  });

  it("returns moderate at 1/3", () => {
    expect(getAxisLevel(1 / 3).level).toBe("moderate");
    expect(getAxisLevel(-1 / 3).level).toBe("moderate");
    expect(getAxisLevel((200 / 3 - 100 / 3) / 100).level).toBe("moderate");
  });

  it("returns moderate just short of 1", () => {
    expect(getAxisLevel(0.99).level).toBe("moderate");
    expect(getAxisLevel(-0.99).level).toBe("moderate");
  });

  it("returns extreme at 1 and at -1", () => {
    expect(getAxisLevel(1).level).toBe("extreme");
    expect(getAxisLevel(-1).level).toBe("extreme");
  });

  it("returns extreme beyond the pole", () => {
    expect(getAxisLevel(1.5).level).toBe("extreme");
  });

  it("returns the pole the coordinate leans to", () => {
    expect(getAxisLevel(-0.5).pole).toBe("start");
    expect(getAxisLevel(0.5).pole).toBe("end");
  });

  it("counts a coordinate of zero toward the end pole", () => {
    expect(getAxisLevel(0).pole).toBe("end");
    expect(getAxisLevel(-0).pole).toBe("end");
  });

  it("returns the centre for a coordinate that is not a number", () => {
    expect(getAxisLevel(Number.NaN)).toEqual({ level: "centre", pole: "end" });
    expect(getAxisLevel(undefined as unknown as number)).toEqual({
      level: "centre",
      pole: "end",
    });
  });
});
