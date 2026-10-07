import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { AxisOrientation } from "@/types/axis";
import { createAxisPair } from "@/utils/vitest/createAxisPair";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";
import type { AxisGroup } from "../MultiAxisChart.types";
import { OpenGroup } from "./OpenGroup";

const worldview: AxisGroup = {
  name: "Światopogląd",
  axes: [
    createAxisPair("worldview", "Progresywizm", "Tradycjonalizm", 69, 31),
    createAxisPair("force", "Pacyfizm", "Militaryzm", 5, 95),
    createAxisPair("faith", "Sekularyzm", "Religijność", 60, 40),
  ],
};

const friend: AxisOrientation = { id: "friend", name: "Ania" };

const renderGroup = (
  props: Partial<Parameters<typeof OpenGroup>[0]> = {},
  group: AxisGroup = worldview,
) => {
  const onClose = vi.fn();

  renderWithI18n(<OpenGroup group={group} onClose={onClose} {...props} />);

  return onClose;
};

const getBarLabels = () =>
  screen
    .getAllByRole("img")
    .filter((element) => element.tagName === "DIV")
    .map((bar) => bar.getAttribute("aria-label"));

describe("<OpenGroup />", () => {
  describe("given a group", () => {
    it("renders the group heading once", () => {
      renderGroup();

      expect(
        screen
          .getAllByRole("heading", { level: 3 })
          .map((heading) => heading.textContent),
      ).toEqual(["Światopogląd — Progresywizm"]);
    });

    it("renders the headline bar, then every other axis as a labelled bar, in the given order", () => {
      renderGroup();

      expect(getBarLabels()).toEqual([
        "Progresywizm: 69%, Tradycjonalizm: 31%",
        "Pacyfizm: 5%, Militaryzm: 95%",
        "Sekularyzm: 60%, Religijność: 40%",
      ]);
      expect(screen.getAllByTestId("universal-axis-labels")).toHaveLength(3);
    });

    it("separates the headline bar from the other axes", () => {
      renderGroup();

      expect(screen.getByRole("separator")).toBeVisible();
    });

    it("renders one marker line and no marker on the bars", () => {
      renderGroup({ marker: 40 });

      expect(
        screen
          .getByTestId("multi-axis-chart-marker")
          .style.getPropertyValue("--axis-position"),
      ).toBe("40%");
      expect(
        screen.queryByTestId("universal-axis-marker"),
      ).not.toBeInTheDocument();
    });

    it("positions the line against the bars that follow the heading row", () => {
      renderGroup();

      const lane = screen.getByTestId("multi-axis-chart-marker").parentElement;
      const bars = lane?.parentElement;

      expect(bars).toHaveClass("relative", "flex", "flex-col", "gap-3");
      expect(bars).not.toContainElement(screen.getByRole("heading"));
      expect(bars?.parentElement).toHaveClass("flex", "flex-col", "gap-3");
    });

    it("renders no line when the marker is off", () => {
      renderGroup({ marker: false });

      expect(
        screen.queryByTestId("multi-axis-chart-marker"),
      ).not.toBeInTheDocument();
    });

    it("passes each comparison value to its bar", () => {
      renderGroup({
        comparison: { party: friend, values: { worldview: 90, faith: 20 } },
      });

      expect(getBarLabels()).toEqual([
        "Progresywizm: 69%, Tradycjonalizm: 31%, porównanie z Ania: 90%",
        "Pacyfizm: 5%, Militaryzm: 95%",
        "Sekularyzm: 60%, Religijność: 40%, porównanie z Ania: 20%",
      ]);
    });
  });

  describe("close control", () => {
    it("names the group and says it is open", () => {
      renderGroup();

      const control = screen.getByRole("button", {
        name: "Wróć do grup, zamknij grupę: Światopogląd",
      });

      expect(control).toHaveAttribute("aria-expanded", "true");
      expect(control).toHaveAttribute("type", "button");
      expect(control).toHaveClass("w-full", "h-[33px]", "before:-top-3");
    });

    it("is named without a group when there is nothing to name it by", () => {
      renderGroup(
        {},
        {
          axes: [
            createAxisPair("a", "", "", 50, 50),
            createAxisPair("b", "Pacyfizm", "Militaryzm", 5, 95),
          ],
        },
      );

      expect(
        screen.getByRole("button", { name: "Wróć do grup" }),
      ).toBeVisible();
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    });

    it("asks to close the group when pressed", () => {
      const onClose = renderGroup();

      fireEvent.click(screen.getByRole("button"));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("reports when it gains and loses focus", () => {
      const onCloseControlFocusChange = vi.fn();

      renderGroup({ onCloseControlFocusChange });

      fireEvent.focus(screen.getByRole("button"));

      expect(onCloseControlFocusChange).toHaveBeenLastCalledWith(true);

      fireEvent.blur(screen.getByRole("button"));

      expect(onCloseControlFocusChange).toHaveBeenLastCalledWith(false);
    });

    it("does not need a focus listener", () => {
      renderGroup();

      fireEvent.focus(screen.getByRole("button"));
      fireEvent.blur(screen.getByRole("button"));

      expect(screen.getByRole("button")).toBeVisible();
    });
  });
});
