import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AxisPill } from "./AxisPill";

describe("<AxisPill />", () => {
  describe("given the horizontal side", () => {
    it("renders the name and the coordinate rounded to two decimals", () => {
      render(
        <AxisPill side="horizontal" name="Gospodarka" coordinate={-0.544} />,
      );

      const pill = screen.getByTestId("nolan-chart-axis-horizontal");

      expect(pill).toHaveTextContent("Gospodarka-0.54");
      expect(
        screen.getByTestId("nolan-chart-coordinate-horizontal"),
      ).toHaveTextContent(/^-0\.54$/);
      expect(pill).not.toHaveClass("[writing-mode:vertical-rl]");
      expect(pill.querySelector("img")).not.toHaveClass("rotate-90");
    });
  });

  describe("given the vertical side", () => {
    it("runs along the map's side, centred, with the arrow turned", () => {
      render(<AxisPill side="vertical" name="Światopogląd" coordinate={1} />);

      const pill = screen.getByTestId("nolan-chart-axis-vertical");

      expect(pill).toHaveTextContent("Światopogląd1.0");
      expect(pill).toHaveClass(
        "[writing-mode:vertical-rl]",
        "absolute",
        "top-1/2",
        "-translate-y-1/2",
      );
      expect(pill.querySelector("img")).toHaveClass("rotate-90");
    });
  });

  it("never grows past its side of the map and truncates the name", () => {
    render(<AxisPill side="horizontal" name="Gospodarka" coordinate={0} />);

    expect(screen.getByTestId("nolan-chart-axis-horizontal")).toHaveClass(
      "[max-inline-size:100%]",
    );
    expect(screen.getByText("Gospodarka")).toHaveClass("truncate");
  });

  describe("given no coordinate", () => {
    it("renders the name alone", () => {
      render(<AxisPill side="horizontal" name="Gospodarka" />);

      expect(
        screen.getByTestId("nolan-chart-axis-horizontal"),
      ).toHaveTextContent(/^Gospodarka$/);
      expect(
        screen.queryByTestId("nolan-chart-coordinate-horizontal"),
      ).not.toBeInTheDocument();
    });
  });

  describe("given no name", () => {
    it("renders the coordinate alone", () => {
      render(<AxisPill side="vertical" name="" coordinate={0.5} />);

      expect(screen.getByTestId("nolan-chart-axis-vertical")).toHaveTextContent(
        /^0\.5$/,
      );
    });
  });
});
