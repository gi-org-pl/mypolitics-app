import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import type { NolanAxis } from "../../NolanChart.types";
import { NolanRow } from "./NolanRow";

const axis: NolanAxis = {
  name: "Gospodarka",
  start: {
    entry: {
      orientation: {
        id: "left",
        type: "ideology",
        name: "Lewica",
        imageUrl: "https://example.com/left.svg",
        color: "#111111",
      },
      value: 77,
    },
    names: { moderate: "Umiarkowana lewica", extreme: "Skrajna lewica" },
  },
  end: {
    entry: {
      orientation: {
        id: "right",
        type: "ideology",
        name: "Prawica",
        imageUrl: "https://example.com/right.svg",
        color: "#222222",
      },
      value: 23,
    },
    names: { moderate: "Umiarkowana prawica" },
  },
};

const getCapColor = (side: "start" | "end") =>
  screen
    .getByTestId(`universal-axis-cap-${side}`)
    .style.getPropertyValue("--axis-color");

describe("<NolanRow />", () => {
  describe("given a lean past the centre level", () => {
    it("heads the row with the axis name and the pole name", () => {
      renderWithI18n(<NolanRow axis={axis} coordinate={-0.54} lean="start" />);

      expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
        "Gospodarka — Umiarkowana lewica",
      );
    });

    it("colours the leaning side and leaves the other neutral", () => {
      const { unmount } = renderWithI18n(
        <NolanRow
          axis={axis}
          coordinate={-0.54}
          lean="start"
          color="#36db8b"
        />,
      );

      expect(getCapColor("start")).toBe("#36db8b");
      expect(getCapColor("end")).toBe("");

      unmount();
      renderWithI18n(
        <NolanRow axis={axis} coordinate={0.54} lean="end" color="#36db8b" />,
      );

      expect(getCapColor("start")).toBe("");
      expect(getCapColor("end")).toBe("#36db8b");
    });
  });

  describe("given the centre level or no lean", () => {
    it("heads the row with the axis name alone", () => {
      const { unmount } = renderWithI18n(
        <NolanRow axis={axis} coordinate={-0.1} lean="start" />,
      );

      expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
        /^Gospodarka$/,
      );

      unmount();
      renderWithI18n(<NolanRow axis={axis} color="#36db8b" />);

      expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
        /^Gospodarka$/,
      );
      expect(getCapColor("start")).toBe("");
      expect(getCapColor("end")).toBe("");
    });
  });

  it("draws a double-sided bar with the marker and no labels", () => {
    renderWithI18n(<NolanRow axis={axis} coordinate={-0.54} lean="start" />);

    expect(screen.getByTestId("universal-axis-cap-start")).toBeInTheDocument();
    expect(screen.getByTestId("universal-axis-cap-end")).toBeInTheDocument();
    expect(screen.getByTestId("universal-axis-marker")).toBeInTheDocument();
    expect(
      screen.queryByTestId("universal-axis-labels"),
    ).not.toBeInTheDocument();
  });

  describe("given the other side", () => {
    it("carries the comparison at their value for the start pole", () => {
      renderWithI18n(
        <NolanRow
          axis={axis}
          otherOrientation={{ id: "friend", type: "person", name: "Rafał" }}
          otherValues={{ start: 58, end: 42 }}
        />,
      );

      expect(
        screen.getByRole("img", { name: /Rafał: 58%/ }),
      ).toBeInTheDocument();
    });

    it("carries no comparison without their start value", () => {
      renderWithI18n(
        <NolanRow
          axis={axis}
          otherOrientation={{ id: "friend", type: "person", name: "Rafał" }}
          otherValues={{ end: 42 }}
        />,
      );

      expect(
        screen.queryByTestId("universal-axis-comparison-image"),
      ).not.toBeInTheDocument();
    });
  });
});
