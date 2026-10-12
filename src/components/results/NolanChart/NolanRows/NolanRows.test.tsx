import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getNolanPosition } from "@/utils/results/getNolanPosition";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import type { NolanAxis, NolanComparison } from "../NolanChart.types";
import { NolanRows } from "./NolanRows";

const createAxis = (name: string): NolanAxis => ({
  name,
  start: {
    entry: {
      orientation: { id: `${name}-start`, type: "ideology", name: "Start" },
      value: 0,
    },
    names: { extreme: `${name}: skrajny start` },
  },
  end: {
    entry: {
      orientation: { id: `${name}-end`, type: "ideology", name: "End" },
      value: 100,
    },
    names: { extreme: `${name}: skrajny koniec` },
  },
});

const horizontal = createAxis("Gospodarka");
const vertical = createAxis("Światopogląd");
const POSITION = getNolanPosition(
  { start: 0, end: 100 },
  { start: 100, end: 0 },
);

const friend: NolanComparison = {
  orientation: { id: "friend", type: "person", name: "Rafał" },
  horizontal: { start: 58, end: 42 },
  vertical: { start: 68, end: 32 },
};

const getRows = () => screen.getAllByTestId("axis-row");
const getCapColor = (row: HTMLElement, side: string) =>
  within(row)
    .getByTestId(`universal-axis-cap-${side}`)
    .style.getPropertyValue("--axis-color");

describe("<NolanRows />", () => {
  it("renders two rows under the given id, horizontal first", () => {
    renderWithI18n(
      <NolanRows
        id="rows"
        horizontal={horizontal}
        vertical={vertical}
        position={POSITION}
      />,
    );

    const rows = getRows();

    expect(screen.getByTestId("nolan-chart-rows")).toHaveAttribute(
      "id",
      "rows",
    );
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent(
      "Gospodarka — Gospodarka: skrajny koniec",
    );
    expect(rows[1]).toHaveTextContent(
      "Światopogląd — Światopogląd: skrajny start",
    );
  });

  it("colours each row on the side its own axis leans to", () => {
    renderWithI18n(
      <NolanRows
        id="rows"
        horizontal={horizontal}
        vertical={vertical}
        position={POSITION}
        color="#8443e9"
      />,
    );

    const [horizontalRow, verticalRow] = getRows();

    expect(getCapColor(horizontalRow, "end")).toBe("#8443e9");
    expect(getCapColor(horizontalRow, "start")).toBe("");
    expect(getCapColor(verticalRow, "start")).toBe("#8443e9");
    expect(getCapColor(verticalRow, "end")).toBe("");
  });

  describe("given no position", () => {
    it("renders both rows by the axis name alone, uncoloured", () => {
      renderWithI18n(
        <NolanRows
          id="rows"
          horizontal={horizontal}
          vertical={vertical}
          position={null}
          color="#8443e9"
        />,
      );

      const [horizontalRow, verticalRow] = getRows();

      expect(
        within(horizontalRow).getByRole("heading", { level: 3 }),
      ).toHaveTextContent(/^Gospodarka$/);
      expect(
        within(verticalRow).getByRole("heading", { level: 3 }),
      ).toHaveTextContent(/^Światopogląd$/);
      expect(getCapColor(horizontalRow, "end")).toBe("");
    });
  });

  describe("given a comparison", () => {
    it("passes each row the other side's value for its own axis", () => {
      renderWithI18n(
        <NolanRows
          id="rows"
          horizontal={horizontal}
          vertical={vertical}
          position={POSITION}
          comparison={friend}
        />,
      );

      const [horizontalRow, verticalRow] = getRows();

      expect(
        within(horizontalRow).getByRole("img", { name: /Rafał: 58%/ }),
      ).toBeInTheDocument();
      expect(
        within(verticalRow).getByRole("img", { name: /Rafał: 68%/ }),
      ).toBeInTheDocument();
    });
  });
});
