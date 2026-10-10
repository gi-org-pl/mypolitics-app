import { describe, expect, it } from "vitest";

import { toSlotThesis } from "./toSlotThesis";

describe("toSlotThesis()", () => {
  it("removes one closing full stop", () => {
    expect(toSlotThesis("Podatki powinny być niższe.")).toBe(
      "Podatki powinny być niższe",
    );
  });

  it("removes only one of several closing full stops", () => {
    expect(toSlotThesis("I tak dalej...")).toBe("I tak dalej..");
  });

  it("keeps a closing question mark and an exclamation mark", () => {
    expect(toSlotThesis("Czy podatki powinny być niższe?")).toBe(
      "Czy podatki powinny być niższe?",
    );
    expect(toSlotThesis("Niższe podatki!")).toBe("Niższe podatki!");
  });

  it("keeps a full stop in the middle", () => {
    expect(toSlotThesis("Art. 5 ust. 2 należy uchylić.")).toBe(
      "Art. 5 ust. 2 należy uchylić",
    );
    expect(toSlotThesis("Płaca min. powinna rosnąć")).toBe(
      "Płaca min. powinna rosnąć",
    );
  });

  it("trims the space around the thesis, also the one in front of the full stop", () => {
    expect(toSlotThesis("  Podatki powinny być niższe .\n")).toBe(
      "Podatki powinny być niższe",
    );
  });

  it("returns nothing for a thesis with no text", () => {
    expect(toSlotThesis("")).toBeUndefined();
    expect(toSlotThesis("   ")).toBeUndefined();
    expect(toSlotThesis(".")).toBeUndefined();
    expect(toSlotThesis(" . ")).toBeUndefined();
    expect(toSlotThesis(undefined)).toBeUndefined();
    expect(toSlotThesis(12)).toBeUndefined();
  });
});
