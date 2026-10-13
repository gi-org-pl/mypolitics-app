import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CompassMap } from "@/components/shared/CompassMap/CompassMap";
import { UniversalAxis } from "@/components/shared/UniversalAxis/UniversalAxis";
import { readParam } from "@/utils/result-modules/params/readParam";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import {
  DEFAULT_COMPASS_QUADRANTS,
  DEFAULT_VISIBLE_ROWS,
  HEADER_LINK_SLOT,
  HEADER_MODULE_TYPE,
  MATCH_BAND_COLORS,
  RESULT_MODULE_COLUMNS,
  RESULT_MODULE_DEFAULTS,
  RESULT_MODULE_PARAM_DEFINITIONS,
  RESULT_MODULE_PARAMS,
  RESULT_MODULE_SLOTS,
  RESULT_MODULE_TYPES,
} from "./results";

const TOKENS = {
  none: "--gi-red",
  partial: "--gi-orange",
  match: "--gi-green",
} as const;

const athenaCss = readFileSync(
  createRequire(import.meta.url).resolve("@gi-org-pl/athena/athena.css"),
  "utf8",
);

const getTokenValue = (token: string): string | undefined =>
  new RegExp(`${token}:\\s*([^;}]+)`).exec(athenaCss)?.[1].trim();

describe("MATCH_BAND_COLORS", () => {
  it("has a colour for every match band", () => {
    expect(Object.keys(MATCH_BAND_COLORS).sort()).toEqual(
      Object.keys(TOKENS).sort(),
    );
  });

  it.each(
    Object.entries(MATCH_BAND_COLORS),
  )("holds a colour the bar accepts and draws for the %s band", (band, color) => {
    renderWithI18n(
      <UniversalAxis
        start={{
          orientation: { id: band, type: "ideology", name: band, color },
          value: 60,
        }}
        marker={false}
      />,
    );

    expect(
      screen
        .getByTestId("universal-axis-fill-start")
        .style.getPropertyValue("--axis-color"),
    ).toBe(color);
  });

  it.each(
    Object.entries(TOKENS),
  )("mirrors the Athena palette token for the %s band", (band, token) => {
    expect(MATCH_BAND_COLORS[band as keyof typeof TOKENS]).toBe(
      getTokenValue(token),
    );
  });
});

const QUADRANT_TOKENS = {
  topLeft: "--color-red-400",
  topRight: "--color-sky-400",
  bottomLeft: "--color-emerald-400",
  bottomRight: "--color-violet-600",
} as const;

const tailwindCss = readFileSync(
  createRequire(import.meta.url).resolve("tailwindcss/theme.css"),
  "utf8",
);

const getPaletteValue = (token: string): string | undefined =>
  new RegExp(`${token}:\\s*([^;}]+)`).exec(tailwindCss)?.[1].trim();

describe("DEFAULT_COMPASS_QUADRANTS", () => {
  it("has a colour for each of the four corners", () => {
    expect(Object.keys(DEFAULT_COMPASS_QUADRANTS).sort()).toEqual(
      Object.keys(QUADRANT_TOKENS).sort(),
    );
  });

  it("gives every corner a colour of its own", () => {
    const colors = Object.values(DEFAULT_COMPASS_QUADRANTS).map(
      ({ color }) => color,
    );

    expect(new Set(colors).size).toBe(colors.length);
  });

  it.each(
    Object.entries(DEFAULT_COMPASS_QUADRANTS),
  )("holds a colour the map accepts and draws for the %s corner", (corner, {
    color,
  }) => {
    renderWithI18n(
      <CompassMap quadrants={DEFAULT_COMPASS_QUADRANTS} position={null} />,
    );

    const quadrant = screen.getByTestId(`nolan-chart-quadrant-${corner}`);

    expect(quadrant.style.getPropertyValue("--nolan-color")).toBe(color);
    expect(quadrant).toHaveClass("bg-(--nolan-color)/10");
  });

  it.each(
    Object.entries(QUADRANT_TOKENS),
  )("mirrors the Tailwind palette token for the %s corner", (corner, token) => {
    expect(
      DEFAULT_COMPASS_QUADRANTS[corner as keyof typeof QUADRANT_TOKENS].color,
    ).toBe(getPaletteValue(token));
  });
});

describe("RESULT_MODULE_TYPES", () => {
  it("lists the eight types as the API sends them", () => {
    expect(RESULT_MODULE_TYPES).toEqual([
      "header",
      "single_axis",
      "double_axis",
      "multi_axis",
      "horizontal_bar",
      "nolan_chart",
      "archetype",
      "traits",
    ]);
  });
});

describe("RESULT_MODULE_DEFAULTS", () => {
  it("holds what the spec gives a field that is left out, and no parameter", () => {
    expect(RESULT_MODULE_DEFAULTS).toEqual({ column: "start" });
  });

  it("holds a value the field may have", () => {
    expect(RESULT_MODULE_COLUMNS).toEqual(["start", "end"]);
    expect(RESULT_MODULE_COLUMNS).toContain(RESULT_MODULE_DEFAULTS.column);
  });
});

describe("RESULT_MODULE_PARAM_DEFINITIONS", () => {
  it("defines the parameters of the spec, each with what it may hold and its default", () => {
    expect(RESULT_MODULE_PARAM_DEFINITIONS).toEqual({
      selection: {
        kind: "choice",
        values: ["all", "linked_to_leader"],
        fallback: "all",
      },
      groupBy: {
        kind: "choice",
        values: ["none", "category"],
        fallback: "none",
      },
      marker: {
        kind: "number",
        min: 0,
        max: 100,
        whole: false,
        nullable: true,
        fallback: 50,
      },
      visibleRows: {
        kind: "number",
        min: 1,
        max: Number.MAX_SAFE_INTEGER,
        whole: true,
        nullable: false,
        fallback: 3,
      },
    });
    expect(DEFAULT_VISIBLE_ROWS).toBe(3);
  });

  it.each(
    Object.entries(RESULT_MODULE_PARAM_DEFINITIONS),
  )("gives %s a default that its own definition reads as itself", (_, definition) => {
    expect(readParam(definition, definition.fallback)).toBe(
      definition.fallback,
    );
  });
});

describe("RESULT_MODULE_PARAMS", () => {
  it("lists the parameters each module type reads, as the spec does", () => {
    expect(RESULT_MODULE_PARAMS).toEqual({
      header: [],
      single_axis: ["marker"],
      double_axis: ["marker"],
      multi_axis: ["groupBy", "marker"],
      horizontal_bar: ["selection", "groupBy", "visibleRows"],
      nolan_chart: [],
      archetype: [],
      traits: [],
    });
  });

  it("lists every module type, and only names that are defined", () => {
    expect(Object.keys(RESULT_MODULE_PARAMS)).toEqual([...RESULT_MODULE_TYPES]);

    for (const name of Object.values(RESULT_MODULE_PARAMS).flat()) {
      expect(RESULT_MODULE_PARAM_DEFINITIONS).toHaveProperty(name);
    }
  });

  it("leaves no definition unread", () => {
    expect(
      [...new Set(Object.values(RESULT_MODULE_PARAMS).flat())].sort(),
    ).toEqual(Object.keys(RESULT_MODULE_PARAM_DEFINITIONS).sort());
  });
});

const LEVELS = ["Moderate", "Extreme"];
const CORNERS = ["topLeft", "topRight", "bottomLeft", "bottomRight"];

const NOLAN_CHART_LABELS = [
  "centre",
  ...["horizontal", "vertical"].flatMap((axis) =>
    ["Start", "End"].flatMap((pole) =>
      LEVELS.map((level) => `${axis}${pole}${level}`),
    ),
  ),
  ...CORNERS.flatMap((corner) =>
    LEVELS.flatMap((level) => [`${corner}${level}`, `${corner}${level}Short`]),
  ),
];

describe("HEADER_MODULE_TYPE", () => {
  it("is the header, one of the types the API sends", () => {
    expect(HEADER_MODULE_TYPE).toBe("header");
    expect(RESULT_MODULE_TYPES).toContain(HEADER_MODULE_TYPE);
  });
});

describe("HEADER_LINK_SLOT", () => {
  it("is the one label slot of the header", () => {
    expect(RESULT_MODULE_SLOTS[HEADER_MODULE_TYPE].labels).toEqual([
      HEADER_LINK_SLOT,
    ]);
  });
});

describe("RESULT_MODULE_SLOTS", () => {
  it("has the slots of every type", () => {
    expect(Object.keys(RESULT_MODULE_SLOTS).sort()).toEqual(
      [...RESULT_MODULE_TYPES].sort(),
    );
  });

  it("gives the header the label of its link and no colour", () => {
    expect(RESULT_MODULE_SLOTS.header).toEqual({
      labels: ["link"],
      colors: [],
    });
  });

  it("gives the Nolan chart the names of the middle, of a lean along each axis and of each corner", () => {
    const { labels } = RESULT_MODULE_SLOTS.nolan_chart;

    expect(labels).toHaveLength(25);
    expect([...labels].sort()).toEqual([...NOLAN_CHART_LABELS].sort());
  });

  it("gives the Nolan chart a colour for each corner", () => {
    expect(RESULT_MODULE_SLOTS.nolan_chart.colors).toEqual(CORNERS);
    expect([...RESULT_MODULE_SLOTS.nolan_chart.colors].sort()).toEqual(
      Object.keys(DEFAULT_COMPASS_QUADRANTS).sort(),
    );
  });

  it.each([
    ["single_axis"],
    ["double_axis"],
    ["multi_axis"],
    ["horizontal_bar"],
    ["archetype"],
    ["traits"],
  ] as const)("gives %s no slot", (type) => {
    expect(RESULT_MODULE_SLOTS[type]).toEqual({ labels: [], colors: [] });
  });
});
