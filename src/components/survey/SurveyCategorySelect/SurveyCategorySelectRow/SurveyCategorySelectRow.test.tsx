import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ROW_FADE_MS, ROW_STAGGER_MS } from "../SurveyCategorySelect.constants";
import { SurveyCategorySelectRow } from "./SurveyCategorySelectRow";
import type { SurveyCategorySelectRowProps } from "./SurveyCategorySelectRow.types";

const renderRow = (props: Partial<SurveyCategorySelectRowProps> = {}) =>
  render(
    <ul>
      <SurveyCategorySelectRow
        name="Gospodarka"
        index={0}
        isSelected={false}
        isDisabled={false}
        onToggle={vi.fn()}
        {...props}
      />
    </ul>,
  );

describe("<SurveyCategorySelectRow />", () => {
  describe("given an unselected category", () => {
    it("renders a list item with a button named after the category", () => {
      renderRow();

      expect(screen.getByRole("listitem")).toContainElement(
        screen.getByRole("button", { name: "Gospodarka" }),
      );
    });

    it("exposes the button as not selected", () => {
      renderRow();

      expect(
        screen.getByRole("button", { name: "Gospodarka", pressed: false }),
      ).toBeEnabled();
    });
  });

  describe("given a selected category", () => {
    it("exposes the button as selected", () => {
      renderRow({ isSelected: true });

      expect(
        screen.getByRole("button", { name: "Gospodarka", pressed: true }),
      ).toBeEnabled();
    });
  });

  describe("when the row is activated", () => {
    it("calls onToggle once", async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      renderRow({ onToggle });

      await user.click(screen.getByRole("button", { name: "Gospodarka" }));

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("calls onToggle when activated from the keyboard", async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      renderRow({ onToggle });

      await user.tab();
      await user.keyboard("{Enter}");

      expect(screen.getByRole("button", { name: "Gospodarka" })).toHaveFocus();
      expect(onToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe("given a disabled row", () => {
    it("disables the button", () => {
      renderRow({ isDisabled: true });

      expect(screen.getByRole("button", { name: "Gospodarka" })).toBeDisabled();
    });

    it("does not call onToggle when activated", async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      renderRow({ isDisabled: true, onToggle });

      await user.click(screen.getByRole("button", { name: "Gospodarka" }));

      expect(onToggle).not.toHaveBeenCalled();
    });
  });

  describe("appearance on mount", () => {
    it("is visible by default and only starts from transparent in CSS", () => {
      renderRow();

      const row = screen.getByRole("listitem");
      expect(row).toHaveClass("starting:opacity-0", "transition-opacity");
      expect(row).not.toHaveClass("opacity-0");
      expect(row.style.opacity).toBe("");
    });

    it("skips the fade under prefers-reduced-motion", () => {
      renderRow();

      expect(screen.getByRole("listitem")).toHaveClass(
        "motion-reduce:transition-none",
      );
    });

    it("delays the fade by its position and fades for the fade length", () => {
      renderRow({ index: 3 });

      expect(screen.getByRole("listitem")).toHaveStyle({
        transitionDelay: `${3 * ROW_STAGGER_MS}ms`,
        transitionDuration: `${ROW_FADE_MS}ms`,
      });
    });
  });
});
