import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CompassMap } from "@/components/shared/CompassMap/CompassMap";
import { UniversalAxis } from "@/components/shared/UniversalAxis/UniversalAxis";
import type { ResultModuleValueKind } from "@/types/results";
import { readValue } from "@/utils/result-modules/values/readValue";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import {
  COLOR_KEY_PREFIX,
  DEFAULT_COMPASS_QUADRANTS,
  DEFAULT_VISIBLE_ROWS,
  HEADER_MODULE_TYPE,
  LABEL_KEY_PREFIX,
  MATCH_BAND_COLORS,
  RESULT_MODULE_COLUMNS,
  RESULT_MODULE_DEFAULTS,
  RESULT_MODULE_KEYS,
  RESULT_MODULE_TYPES,
  RESULT_MODULE_VALUE_DEFINITIONS,
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
  it("holds what the spec gives a field that is left out, and no value of a key", () => {
    expect(RESULT_MODULE_DEFAULTS).toEqual({ column: "start" });
  });

  it("holds a value the field may have", () => {
    expect(RESULT_MODULE_COLUMNS).toEqual(["start", "end"]);
    expect(RESULT_MODULE_COLUMNS).toContain(RESULT_MODULE_DEFAULTS.column);
  });
});

describe("HEADER_MODULE_TYPE", () => {
  it("is the header, one of the types the API sends", () => {
    expect(HEADER_MODULE_TYPE).toBe("header");
    expect(RESULT_MODULE_TYPES).toContain(HEADER_MODULE_TYPE);
  });
});

// The keys of the map as the spec lists them, written out here on their own:
// the table is not asked what it holds.
const LEVELS = ["Moderate", "Extreme"];
const CORNERS = ["topLeft", "topRight", "bottomLeft", "bottomRight"];

const NOLAN_CHART_LABEL_KEYS = [
  "centre",
  ...["horizontal", "vertical"].flatMap((axis) =>
    ["Start", "End"].flatMap((pole) =>
      LEVELS.map((level) => `${axis}${pole}${level}`),
    ),
  ),
  ...CORNERS.flatMap((corner) =>
    LEVELS.flatMap((level) => [`${corner}${level}`, `${corner}${level}Short`]),
  ),
].map((name) => `label.${name}`);

const NOLAN_CHART_COLOR_KEYS = CORNERS.map((corner) => `color.${corner}`);

const KINDS: ResultModuleValueKind[] = [
  "text",
  "localizedText",
  "number",
  "choice",
  "boolean",
  "color",
];

const LOCALIZED_TEXT = { kind: "localizedText" };
const COLOR = { kind: "color" };

const DEFINITIONS: Record<string, { kind: string }> =
  RESULT_MODULE_VALUE_DEFINITIONS;

describe("RESULT_MODULE_VALUE_DEFINITIONS", () => {
  it("defines the title, the description, the four settings and the label of the header's link, each with what it may hold and its default", () => {
    expect(RESULT_MODULE_VALUE_DEFINITIONS).toMatchObject({
      title: LOCALIZED_TEXT,
      description: LOCALIZED_TEXT,
      selection: {
        kind: "choice",
        choices: ["all", "linked_to_leader"],
        fallback: "all",
      },
      groupBy: {
        kind: "choice",
        choices: ["none", "category"],
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
      "label.link": LOCALIZED_TEXT,
    });
    expect(DEFAULT_VISIBLE_ROWS).toBe(3);
  });

  it("defines what a module does with a leader below a partial match, with saying that nothing matches as its default", () => {
    expect(RESULT_MODULE_VALUE_DEFINITIONS.lowMatch).toStrictEqual({
      kind: "choice",
      choices: ["no_match", "named"],
      fallback: "no_match",
    });
  });

  it("defines a text per language for what the header says under a leader named below a partial match, and for what a ranking says when it has nothing to rank", () => {
    expect(DEFINITIONS["label.lowMatch"]).toStrictEqual(LOCALIZED_TEXT);
    expect(DEFINITIONS["label.empty"]).toStrictEqual(LOCALIZED_TEXT);
  });

  it("defines a text per language for the name of the middle, of a lean along each axis and of each corner of the map", () => {
    expect(NOLAN_CHART_LABEL_KEYS).toHaveLength(25);

    for (const key of NOLAN_CHART_LABEL_KEYS) {
      expect(DEFINITIONS[key]).toStrictEqual(LOCALIZED_TEXT);
    }
  });

  it("defines a colour for each corner of the map", () => {
    expect([...NOLAN_CHART_COLOR_KEYS].sort()).toEqual(
      Object.keys(DEFAULT_COMPASS_QUADRANTS)
        .map((corner) => `color.${corner}`)
        .sort(),
    );

    for (const key of NOLAN_CHART_COLOR_KEYS) {
      expect(DEFINITIONS[key]).toStrictEqual(COLOR);
    }
  });

  it("defines no other key", () => {
    expect(Object.keys(RESULT_MODULE_VALUE_DEFINITIONS).sort()).toEqual(
      [
        "title",
        "description",
        "selection",
        "groupBy",
        "marker",
        "visibleRows",
        "lowMatch",
        "label.link",
        "label.lowMatch",
        "label.empty",
        ...NOLAN_CHART_LABEL_KEYS,
        ...NOLAN_CHART_COLOR_KEYS,
      ].sort(),
    );
  });

  // The prefix says what kind of value follows.
  it("starts the key of a colour with `color.`, and holds a text under every key that starts with `label.`", () => {
    expect(LABEL_KEY_PREFIX).toBe("label.");
    expect(COLOR_KEY_PREFIX).toBe("color.");

    for (const [key, { kind }] of Object.entries(DEFINITIONS)) {
      expect([key, key.startsWith(COLOR_KEY_PREFIX)]).toEqual([
        key,
        kind === "color",
      ]);

      if (key.startsWith(LABEL_KEY_PREFIX)) {
        expect([key, kind]).toEqual([key, "localizedText"]);
      }
    }
  });

  it("gives every key one of the six kinds a value is read by", () => {
    for (const { kind } of Object.values(DEFINITIONS)) {
      expect(KINDS).toContain(kind);
    }
  });

  it.each(
    Object.entries(RESULT_MODULE_VALUE_DEFINITIONS),
  )("gives %s a default that its own definition reads as itself, or none", (_, definition) => {
    expect(
      "fallback" in definition
        ? readValue(definition, definition.fallback)
        : readValue(definition),
    ).toBe("fallback" in definition ? definition.fallback : undefined);
  });

  it("holds a key that follows the contract of the API: letters, digits, dots and underscores, 64 at most", () => {
    for (const key of Object.keys(RESULT_MODULE_VALUE_DEFINITIONS)) {
      expect(key).toMatch(/^[A-Za-z0-9._]{1,64}$/);
    }
  });
});

describe("RESULT_MODULE_KEYS", () => {
  it("lists the keys each module type reads, as the spec does", () => {
    expect(RESULT_MODULE_KEYS).toEqual({
      header: ["description", "lowMatch", "label.link", "label.lowMatch"],
      single_axis: ["description", "marker"],
      double_axis: ["description", "marker"],
      multi_axis: ["title", "description", "groupBy", "marker"],
      horizontal_bar: [
        "title",
        "description",
        "selection",
        "groupBy",
        "visibleRows",
        "label.empty",
      ],
      nolan_chart: expect.any(Array),
      archetype: ["title", "description", "lowMatch"],
      traits: ["title", "description"],
    });
    expect([...RESULT_MODULE_KEYS.nolan_chart].sort()).toEqual(
      [
        "description",
        ...NOLAN_CHART_LABEL_KEYS,
        ...NOLAN_CHART_COLOR_KEYS,
      ].sort(),
    );
  });

  it("lists every module type, and only keys that are defined", () => {
    expect(Object.keys(RESULT_MODULE_KEYS)).toEqual([...RESULT_MODULE_TYPES]);

    for (const key of Object.values(RESULT_MODULE_KEYS).flat()) {
      expect(RESULT_MODULE_VALUE_DEFINITIONS).toHaveProperty([key]);
    }
  });

  it.each(
    RESULT_MODULE_TYPES,
  )("lists the description for %s, and no key twice", (type) => {
    const keys: readonly string[] = RESULT_MODULE_KEYS[type];

    expect(keys).toContain("description");
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("leaves no definition unread", () => {
    expect(
      [...new Set(Object.values(RESULT_MODULE_KEYS).flat())].sort(),
    ).toEqual(Object.keys(RESULT_MODULE_VALUE_DEFINITIONS).sort());
  });
});
