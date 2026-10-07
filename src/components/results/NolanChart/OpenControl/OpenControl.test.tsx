import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { OpenControl } from "./OpenControl";

describe("<OpenControl />", () => {
  describe("given a closed card", () => {
    it("offers to show the axes", () => {
      renderWithI18n(
        <OpenControl isOpen={false} controlsId="rows" onToggle={vi.fn()} />,
      );

      const control = screen.getByRole("button", { name: "Pokaż osie" });

      expect(control).toHaveAttribute("aria-expanded", "false");
      expect(control).not.toHaveAttribute("aria-controls");
      expect(control).toHaveClass("border-t");
      expect(control.querySelector("img")).not.toHaveClass("rotate-180");
    });
  });

  describe("given an open card", () => {
    it("offers to hide the axes and points at the rows", () => {
      renderWithI18n(
        <OpenControl isOpen controlsId="rows" onToggle={vi.fn()} />,
      );

      const control = screen.getByRole("button", { name: "Ukryj osie" });

      expect(control).toHaveAttribute("aria-expanded", "true");
      expect(control).toHaveAttribute("aria-controls", "rows");
      expect(control).toHaveClass("bg-gi-ash");
      expect(control.querySelector("img")).toHaveClass("rotate-180");
    });
  });

  describe("when pressed", () => {
    it("asks to toggle, without passing the event on", () => {
      const onToggle = vi.fn();

      renderWithI18n(
        <OpenControl isOpen={false} controlsId="rows" onToggle={onToggle} />,
      );
      fireEvent.click(screen.getByRole("button"));

      expect(onToggle).toHaveBeenCalledTimes(1);
      expect(onToggle).toHaveBeenCalledWith();
    });
  });

  it("is a native button with a pressable area taller than the strip", () => {
    renderWithI18n(
      <OpenControl isOpen={false} controlsId="rows" onToggle={vi.fn()} />,
    );

    const control = screen.getByRole("button");

    expect(control.tagName).toBe("BUTTON");
    expect(control).toHaveAttribute("type", "button");
    expect(control).toHaveClass("h-[33px]", "before:-top-3");
  });
});
