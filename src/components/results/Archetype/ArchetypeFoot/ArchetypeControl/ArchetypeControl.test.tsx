import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ArchetypeControl } from "./ArchetypeControl";

describe("<ArchetypeControl />", () => {
  describe("given a closed view", () => {
    it("renders a native button with its name that says the view is closed", () => {
      render(
        <ArchetypeControl label="Pełny opis" isOpen={false} onClick={vi.fn()}>
          <img src="icon.svg" alt="" />
        </ArchetypeControl>,
      );

      const control = screen.getByRole("button", { name: "Pełny opis" });

      expect(control.tagName).toBe("BUTTON");
      expect(control).toBeEnabled();
      expect(control).toHaveAttribute("aria-expanded", "false");
      expect(control.querySelector("img")).toHaveAttribute("src", "icon.svg");
    });

    it("has no background until hovered", () => {
      render(
        <ArchetypeControl label="Ranking" isOpen={false} onClick={vi.fn()}>
          x
        </ArchetypeControl>,
      );

      expect(screen.getByRole("button")).toHaveClass(
        "bg-transparent",
        "hover:bg-gi-ash",
      );
    });
  });

  describe("given an open view", () => {
    it("says the view is open and keeps the filled background", () => {
      render(
        <ArchetypeControl label="Ranking" isOpen onClick={vi.fn()}>
          x
        </ArchetypeControl>,
      );

      const control = screen.getByRole("button", { name: "Ranking" });

      expect(control).toHaveAttribute("aria-expanded", "true");
      expect(control).not.toHaveClass("bg-transparent");
    });
  });

  describe("when pressed", () => {
    it("calls the handler once", () => {
      const onClick = vi.fn();

      render(
        <ArchetypeControl label="Ranking" isOpen={false} onClick={onClick}>
          x
        </ArchetypeControl>,
      );
      fireEvent.click(screen.getByRole("button"));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("given hasDivider", () => {
    it("draws a line on its leading edge", () => {
      render(
        <ArchetypeControl
          label="Ranking"
          isOpen={false}
          hasDivider
          onClick={vi.fn()}
        >
          x
        </ArchetypeControl>,
      );

      expect(screen.getByRole("button")).toHaveClass(
        "border-l",
        "border-gi-ash",
      );
    });
  });

  describe("given no hasDivider", () => {
    it("draws no line", () => {
      render(
        <ArchetypeControl label="Ranking" isOpen={false} onClick={vi.fn()}>
          x
        </ArchetypeControl>,
      );

      expect(screen.getByRole("button")).not.toHaveClass("border-l");
    });
  });

  describe("given a pressable area", () => {
    it("extends it beyond the drawn control", () => {
      render(
        <ArchetypeControl label="Ranking" isOpen={false} onClick={vi.fn()}>
          x
        </ArchetypeControl>,
      );

      expect(screen.getByRole("button")).toHaveClass(
        "h-[33px]",
        "before:absolute",
        "before:-inset-y-1.5",
      );
    });
  });
});
