import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

import { SAFE_COLOR_PATTERN } from "@/components/shared/UniversalAxis/UniversalAxis.constants";

import { MATCH_BAND_COLORS } from "./results";

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
  )("holds a colour the bar accepts for the %s band", (_band, color) => {
    expect(color).toMatch(SAFE_COLOR_PATTERN);
  });

  it.each(
    Object.entries(TOKENS),
  )("mirrors the Athena palette token for the %s band", (band, token) => {
    expect(MATCH_BAND_COLORS[band as keyof typeof TOKENS]).toBe(
      getTokenValue(token),
    );
  });
});
