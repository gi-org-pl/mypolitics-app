import { describe, expect, it } from "vitest";

import { createResultModule } from "./createResultModule";

describe("createResultModule()", () => {
  it("builds a record of the type given, with no value set and every other field at its default", () => {
    expect(createResultModule("ranking", "horizontal_bar")).toStrictEqual({
      id: "ranking",
      type: "horizontal_bar",
      position: 0,
      column: "start",
      orientationIds: [],
      axisIds: [],
      values: {},
    });
  });

  it("lets the overrides replace the defaults", () => {
    const record = createResultModule("header", "header", {
      position: 4,
      column: "end",
      orientationIds: ["left"],
      values: { description: "Kto jest najbliżej.", "label.link": "Strona" },
    });

    expect(record).toMatchObject({
      id: "header",
      type: "header",
      position: 4,
      column: "end",
      orientationIds: ["left"],
      values: { description: "Kto jest najbliżej.", "label.link": "Strona" },
    });
    expect(record.axisIds).toEqual([]);
  });

  it("keeps the identifier and the type given, whatever the overrides hold", () => {
    expect(
      createResultModule("ranking", "horizontal_bar", {
        id: "other",
        type: "traits",
      }),
    ).toMatchObject({ id: "ranking", type: "horizontal_bar" });
  });
});
