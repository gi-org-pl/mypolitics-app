import { describe, expect, it } from "vitest";

import { createResultModule } from "./createResultModule";

describe("createResultModule()", () => {
  it("builds a record of the type given, with every other field at its default", () => {
    expect(createResultModule("ranking", "horizontal_bar")).toEqual({
      id: "ranking",
      type: "horizontal_bar",
      position: 0,
      column: "start",
      orientationIds: [],
      axisIds: [],
      selection: "all",
      groupBy: "none",
      marker: 50,
      visibleRows: 3,
      labels: {},
      colors: {},
    });
  });

  it("lets the overrides replace the defaults", () => {
    const record = createResultModule("header", "header", {
      position: 4,
      column: "end",
      marker: false,
      orientationIds: ["left"],
      labels: { link: "Strona" },
    });

    expect(record).toMatchObject({
      id: "header",
      type: "header",
      position: 4,
      column: "end",
      marker: false,
      orientationIds: ["left"],
      labels: { link: "Strona" },
    });
    expect(record.visibleRows).toBe(3);
  });
});
