import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CompassMap } from "@/components/shared/CompassMap/CompassMap";
import { UniversalAxis } from "@/components/shared/UniversalAxis/UniversalAxis";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { DEFAULT_COMPASS_QUADRANTS, MATCH_BAND_COLORS } from "./results";

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
