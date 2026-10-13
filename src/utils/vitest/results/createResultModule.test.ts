import { describe, expect, it } from "vitest";

import { createResultModule } from "./createResultModule";

describe("createResultModule()", () => {
  it("builds a record of the type given, with no parameter set and every other field at its default", () => {
    expect(createResultModule("ranking", "horizontal_bar")).toEqual({
      id: "ranking",
      type: "horizontal_bar",
      position: 0,
      column: "start",
      orientationIds: [],
      axisIds: [],
      params: {},
      labels: {},
      colors: {},
    });
  });

  it("lets the overrides replace the defaults", () => {
    const record = createResultModule("header", "header", {
      position: 4,
      column: "end",
      orientationIds: ["left"],
      params: { marker: null },
      labels: { link: "Strona" },
    });

    expect(record).toMatchObject({
      id: "header",
      type: "header",
      position: 4,
      column: "end",
      orientationIds: ["left"],
      params: { marker: null },
      labels: { link: "Strona" },
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
