import { readFileSync } from "node:fs";
import path from "node:path";
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import blueLogo from "@/assets/icons/mypolitics-primary-blue-on-light.svg?raw";

import { HeaderLogo } from "./HeaderLogo";
import { LOGO_ANIMATION_MS } from "./HeaderLogo.constants";

const FRAME_MS = 16;
const SIGN_PIECES = 6;

// The stylesheet as written: a stylesheet imported in a test is not its text.
const styles = readFileSync(path.resolve("src/index.css"), "utf8");

const parseSvg = (source: string) =>
  new DOMParser().parseFromString(source, "image/svg+xml").documentElement;

// The colour a fill class stands for, read from the tokens of the palette.
const getTokenValue = (className: string) =>
  new RegExp(
    `--color-${className.replace(/^fill-/, "")}:\\s*(#[\\da-f]{6});`,
    "i",
  )
    .exec(styles)?.[1]
    .toUpperCase();

// What a drawing shows: its frame, the placement of its groups, and the
// outline and the colour of each path, whether the colour is written out or
// is a token class.
const getDrawing = (svg: Element) => ({
  viewBox: svg.getAttribute("viewBox"),
  groups: [...svg.querySelectorAll("g")].map((group) =>
    group.getAttribute("transform"),
  ),
  paths: [...svg.querySelectorAll("path")].map((path) => ({
    d: path.getAttribute("d"),
    fill:
      path.getAttribute("fill") ??
      getTokenValue(path.getAttribute("class") ?? ""),
  })),
});

const BRAND_DRAWING = getDrawing(parseSvg(blueLogo));

const renderLogo = (playId?: string) => {
  const { container } = render(<HeaderLogo playId={playId} />);
  const svg = container.querySelector("svg");

  if (!svg) throw new Error("The logo is not rendered");

  return svg;
};

const advance = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

const stubReducedMotion = (matches: boolean) => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches })),
  );
};

describe("<HeaderLogo />", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"],
    });
    stubReducedMotion(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe("given no visit to play", () => {
    it("draws mypolitics-primary-blue-on-light.svg: its frame, placement, outlines and colours", () => {
      const svg = renderLogo();

      expect(BRAND_DRAWING.paths).toHaveLength(SIGN_PIECES + 1);
      expect(getDrawing(svg)).toEqual(BRAND_DRAWING);
    });

    it("is decorative and as high as the image it replaces", () => {
      const svg = renderLogo();

      expect(svg).toHaveAttribute("aria-hidden", "true");
      expect(svg).toHaveAttribute("focusable", "false");
      expect(svg).toHaveClass("h-6", "w-auto");
      expect(svg).not.toHaveAttribute("data-playing");
    });
  });

  describe("given a visit to play", () => {
    it("draws the logo at rest on the first render", () => {
      const svg = renderLogo("home");

      expect(getDrawing(svg)).toEqual(BRAND_DRAWING);
    });

    it("moves the sign and leaves the wordmark as it is", () => {
      const svg = renderLogo("home");

      advance(FRAME_MS);
      advance(600);

      const { paths } = getDrawing(svg);

      expect(svg).toHaveAttribute("data-playing", "true");
      expect(paths.slice(0, SIGN_PIECES)).not.toEqual(
        BRAND_DRAWING.paths.slice(0, SIGN_PIECES),
      );
      expect(paths[SIGN_PIECES]).toEqual(BRAND_DRAWING.paths[SIGN_PIECES]);
    });

    it("ends exactly on mypolitics-primary-blue-on-light.svg", () => {
      const svg = renderLogo("home");

      advance(LOGO_ANIMATION_MS + 5 * FRAME_MS);

      expect(svg).not.toHaveAttribute("data-playing");
      expect(getDrawing(svg)).toEqual(BRAND_DRAWING);
    });
  });

  describe("given a person who asked for reduced motion", () => {
    it("stays at rest", () => {
      stubReducedMotion(true);

      const svg = renderLogo("home");

      advance(FRAME_MS);
      advance(600);

      expect(svg).not.toHaveAttribute("data-playing");
      expect(getDrawing(svg)).toEqual(BRAND_DRAWING);
    });
  });
});
