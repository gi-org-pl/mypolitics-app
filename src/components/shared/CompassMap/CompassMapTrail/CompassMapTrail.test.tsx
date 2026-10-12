import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { CompassMapPoint } from "../CompassMap.types";
import { CompassMapTrail } from "./CompassMapTrail";

const at = (x: number, y: number): CompassMapPoint => ({ x, y });

const TRAIL = [at(-0.5, 0.5), at(0.2, 0.6), at(0.4, -0.3)];

const getPath = () => screen.getByTestId("compass-map-trail");

describe("<CompassMapTrail />", () => {
  describe("given two or more distinct points", () => {
    it("renders one path", () => {
      const { container } = render(<CompassMapTrail trail={TRAIL} />);

      expect(container.querySelectorAll("svg")).toHaveLength(1);
      expect(container.querySelectorAll("path")).toHaveLength(1);
      expect(container.querySelectorAll("line, polyline, circle")).toHaveLength(
        0,
      );
      expect(getPath().getAttribute("d")).toMatch(/^M25 25C.+ 70 65$/);
    });

    it("draws it through the points in the order given", () => {
      render(<CompassMapTrail trail={[...TRAIL].reverse()} />);

      expect(getPath().getAttribute("d")).toMatch(/^M70 65C.+ 25 25$/);
    });

    it("is hidden from assistive technology", () => {
      const { container } = render(<CompassMapTrail trail={TRAIL} />);

      expect(container.firstElementChild).toHaveAttribute(
        "aria-hidden",
        "true",
      );
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(container.querySelector("title, desc")).toBeNull();
    });

    it("is a dotted line in the dot's colour with a light edge, of one width at every size of the map", () => {
      const { container } = render(<CompassMapTrail trail={TRAIL} />);
      const drawing = container.querySelector("svg");

      expect(drawing).toHaveClass(
        "fill-none",
        "stroke-gi-light-primary",
        "stroke-2",
        "[stroke-dasharray:4_4]",
        "drop-shadow-[0_0_1px_white]",
      );
      expect(drawing).toHaveAttribute("viewBox", "0 0 100 100");
      expect(drawing).toHaveAttribute("preserveAspectRatio", "none");
      expect(getPath()).toHaveAttribute("vector-effect", "non-scaling-stroke");
    });

    it("is cut at the edge of the map and takes no pointer", () => {
      const { container } = render(
        <CompassMapTrail trail={[at(-1, 1), at(1, -1)]} />,
      );

      expect(container.firstElementChild).toHaveClass(
        "pointer-events-none",
        "absolute",
        "inset-0",
        "overflow-hidden",
        "rounded-xl",
      );
      expect(getPath().getAttribute("d")).toMatch(/^M0 0C.+ 100 100$/);
    });

    it("does not move", () => {
      const { container } = render(<CompassMapTrail trail={TRAIL} />);

      expect(
        container.querySelector("animate, animateMotion, animateTransform"),
      ).toBeNull();
      expect(container.innerHTML).not.toMatch(/animate|transition/);
    });
  });

  describe("given neighbouring points that are the same to two decimals", () => {
    it("draws them as one point", () => {
      render(
        <CompassMapTrail
          trail={[at(-0.5, 0.5), at(-0.5, 0.5), at(-0.501, 0.5), at(0.4, -0.3)]}
        />,
      );

      expect(getPath().getAttribute("d")?.match(/C/g)).toHaveLength(1);
    });
  });

  describe("given a trail of three hundred points", () => {
    it("still renders one path", () => {
      const trail = Array.from({ length: 300 }, (_, index) =>
        at(Math.cos(index / 9) * 0.9, Math.sin(index / 7) * 0.9),
      );
      const { container } = render(<CompassMapTrail trail={trail} />);

      expect(container.querySelectorAll("path")).toHaveLength(1);
      expect(getPath().getAttribute("d")?.match(/C/g)).toHaveLength(299);
    });
  });

  describe("given fewer than two distinct points", () => {
    it.each([
      { name: "no trail", trail: undefined },
      { name: "an empty trail", trail: [] },
      { name: "one point", trail: [at(0.5, 0.5)] },
      { name: "one place twice", trail: [at(0.5, 0.5), at(0.5, 0.5)] },
      {
        name: "one point that is a number",
        trail: [at(0.5, 0.5), at(Number.NaN, 0)],
      },
    ])("renders nothing: $name", ({ trail }) => {
      const { container } = render(<CompassMapTrail trail={trail} />);

      expect(container).toBeEmptyDOMElement();
    });
  });
});
