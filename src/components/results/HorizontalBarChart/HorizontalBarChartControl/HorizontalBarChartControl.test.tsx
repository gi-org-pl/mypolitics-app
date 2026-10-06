import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { HorizontalBarChartControl } from "./HorizontalBarChartControl";

describe("<HorizontalBarChartControl />", () => {
  describe("given a closed list", () => {
    it("renders a button with its name that says the list is closed", () => {
      render(
        <HorizontalBarChartControl
          label="Pokaż wszystkie"
          isExpanded={false}
          onClick={vi.fn()}
        />,
      );

      const control = screen.getByRole("button", { name: "Pokaż wszystkie" });

      expect(control.tagName).toBe("BUTTON");
      expect(control).toHaveAttribute("aria-expanded", "false");
      expect(control.querySelector("img")).toHaveAttribute("alt", "");
      expect(control.querySelector("img")).not.toHaveClass("rotate-180");
    });
  });

  describe("given an open list", () => {
    it("says the list is open and turns the chevron up", () => {
      render(
        <HorizontalBarChartControl
          label="Pokaż mniej"
          isExpanded
          onClick={vi.fn()}
        />,
      );

      const control = screen.getByRole("button", { name: "Pokaż mniej" });

      expect(control).toHaveAttribute("aria-expanded", "true");
      expect(control.querySelector("img")).toHaveClass("rotate-180");
    });
  });

  describe("when pressed", () => {
    it("calls the handler once", () => {
      const onClick = vi.fn();

      render(
        <HorizontalBarChartControl
          label="Pokaż wszystkie"
          isExpanded={false}
          onClick={onClick}
        />,
      );
      fireEvent.click(screen.getByRole("button"));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("given isQuiet", () => {
    it("renders with no background until hovered", () => {
      render(
        <HorizontalBarChartControl
          label="Pokaż wszystkie"
          isExpanded={false}
          isQuiet
          onClick={vi.fn()}
        />,
      );

      expect(screen.getByRole("button")).toHaveClass(
        "bg-transparent",
        "hover:bg-gi-ash",
      );
    });
  });

  describe("given neither isQuiet nor hasDivider", () => {
    it("keeps the filled background and draws no line", () => {
      render(
        <HorizontalBarChartControl
          label="Pokaż mniej"
          isExpanded
          onClick={vi.fn()}
        />,
      );

      expect(screen.getByRole("button")).not.toHaveClass("bg-transparent");
      expect(screen.getByRole("button")).not.toHaveClass("border-b");
    });
  });

  describe("given hasDivider", () => {
    it("draws a line under the control", () => {
      render(
        <HorizontalBarChartControl
          label="Pokaż kategorię"
          isExpanded={false}
          hasDivider
          onClick={vi.fn()}
        />,
      );

      expect(screen.getByRole("button")).toHaveClass(
        "border-b",
        "border-gi-ash",
      );
    });
  });

  describe("given a ref", () => {
    it("passes it to the button", () => {
      const ref = createRef<HTMLButtonElement>();

      render(
        <HorizontalBarChartControl
          ref={ref}
          label="Wróć do kategorii"
          isExpanded
          onClick={vi.fn()}
        />,
      );

      expect(ref.current).toBe(screen.getByRole("button"));
    });
  });
});
