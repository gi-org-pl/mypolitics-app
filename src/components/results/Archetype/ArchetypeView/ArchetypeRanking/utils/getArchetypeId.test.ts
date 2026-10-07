import { describe, expect, it } from "vitest";

import type { ArchetypeEntry } from "../../../Archetype.types";
import { getArchetypeId } from "./getArchetypeId";

describe("getArchetypeId()", () => {
  it("returns the id of the archetype orientation", () => {
    expect(
      getArchetypeId({
        orientation: { id: "alfa", type: "ideology", name: "Alfa" },
      }),
    ).toBe("alfa");
  });

  it("returns an empty id for an archetype without an orientation", () => {
    expect(getArchetypeId({ match: 30 } as unknown as ArchetypeEntry)).toBe("");
  });
});
