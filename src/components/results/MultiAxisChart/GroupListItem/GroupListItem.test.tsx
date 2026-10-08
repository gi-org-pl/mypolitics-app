import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Orientation } from "@/types/orientation";
import { createAxisPair } from "@/utils/vitest/createAxisPair";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";
import type { AxisGroup } from "../MultiAxisChart.types";
import { GroupListItem } from "./GroupListItem";

const worldview: AxisGroup = {
  name: "Światopogląd",
  axes: [
    createAxisPair("worldview", "Progresywizm", "Tradycjonalizm", 69, 31),
    createAxisPair("force", "Pacyfizm", "Militaryzm", 5, 95),
  ],
};

const foreignPolicy: AxisGroup = {
  name: "Polityka zagraniczna",
  axes: [createAxisPair("foreign", "Globalizm", "Suwerenizm", 50, 50)],
};

const friend: Orientation = { id: "friend", type: "person", name: "Ania" };

const renderItem = (
  group: AxisGroup,
  props: Partial<Parameters<typeof GroupListItem>[0]> = {},
) => {
  const onOpen = vi.fn();

  renderWithI18n(
    <ul>
      <GroupListItem group={group} onOpen={onOpen} {...props} />
    </ul>,
  );

  return onOpen;
};

const getBar = () =>
  screen.getAllByRole("img").filter((element) => element.tagName === "DIV")[0];

describe("<GroupListItem />", () => {
  describe("given a group", () => {
    it("renders a list item headed by the group name and the headline axis lead", () => {
      renderItem(worldview);

      expect(screen.getByRole("listitem")).toBeVisible();
      expect(screen.getByRole("heading", { level: 3 }).textContent).toBe(
        "Światopogląd — Progresywizm",
      );
    });

    it("draws the headline axis as a labelled bar with the marker", () => {
      renderItem(worldview, { marker: 40 });

      expect(getBar()).toHaveAttribute(
        "aria-label",
        "Progresywizm: 69%, Tradycjonalizm: 31%",
      );
      expect(screen.getByTestId("universal-axis-labels")).toBeVisible();
      expect(
        screen
          .getByTestId("universal-axis-marker")
          .style.getPropertyValue("--axis-position"),
      ).toBe("40%");
    });

    it("passes the comparison value of the headline axis to the bar", () => {
      renderItem(worldview, {
        comparison: {
          orientation: friend,
          values: { worldview: 90, force: 20 },
        },
      });

      expect(getBar().getAttribute("aria-label")).toContain(
        "porównanie z Ania: 90%",
      );
    });
  });

  describe("given a group with more than one axis", () => {
    it("renders the preview of both sides and a control that names the group", () => {
      renderItem(worldview);

      const control = screen.getByRole("button", {
        name: "Pokaż grupę: Światopogląd",
      });

      expect(control).toHaveAttribute("aria-expanded", "false");
      expect(control).toHaveAttribute("data-group-id", "worldview");
      expect(control).toContainElement(
        screen.getByTestId("multi-axis-chart-preview-start"),
      );
      expect(control).toContainElement(
        screen.getByTestId("multi-axis-chart-preview-end"),
      );
    });

    it("asks to open the group when the control is pressed", () => {
      const onOpen = renderItem(worldview);

      fireEvent.click(screen.getByRole("button"));

      expect(onOpen).toHaveBeenCalledTimes(1);
      expect(onOpen).toHaveBeenCalledWith("worldview");
    });

    it("gives the control a pressable area at least 44px high", () => {
      renderItem(worldview);

      expect(screen.getByRole("button")).toHaveClass(
        "w-full",
        "before:absolute",
        "before:-inset-y-1.5",
      );
    });
  });

  describe("given a group with one axis", () => {
    it("renders no preview and no control", () => {
      renderItem(foreignPolicy);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("multi-axis-chart-preview-start"),
      ).not.toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 3 }).textContent).toBe(
        "Polityka zagraniczna",
      );
    });
  });

  describe("given a group with nothing to name it by", () => {
    it("names the control without a group", () => {
      renderItem({
        axes: [
          createAxisPair("a", "", "", 50, 50),
          createAxisPair("b", "Pacyfizm", "Militaryzm", 5, 95),
        ],
      });

      expect(screen.getByRole("button", { name: "Pokaż grupę" })).toBeVisible();
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    });
  });
});
