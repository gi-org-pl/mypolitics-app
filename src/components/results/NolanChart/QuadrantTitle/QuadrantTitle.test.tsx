import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { QuadrantTitle } from "./QuadrantTitle";

const getTitle = () => screen.getByTestId("nolan-chart-title");

describe("<QuadrantTitle />", () => {
  describe("given the moderate look", () => {
    it("renders coloured text on a pale tint of the colour", () => {
      render(
        <QuadrantTitle
          name="Umiarkowana zielona"
          shortName=""
          look="moderate"
          color="#36db8b"
        />,
      );

      expect(getTitle()).toHaveTextContent("Umiarkowana zielona");
      expect(getTitle()).toHaveAttribute("data-look", "moderate");
      expect(getTitle()).toHaveClass(
        "bg-(--nolan-color)/10",
        "text-(--nolan-color)",
      );
      expect(getTitle().style.getPropertyValue("--nolan-color")).toBe(
        "#36db8b",
      );
    });

    it("uses the neutral fallback without a colour", () => {
      render(<QuadrantTitle name="Zielona" shortName="" look="moderate" />);

      expect(getTitle()).toHaveClass("bg-gi-dark-gray/10", "text-gi-dark-gray");
      expect(getTitle().style.getPropertyValue("--nolan-color")).toBe("");
    });
  });

  describe("given the extreme look", () => {
    it("renders white text on the colour at full strength", () => {
      render(
        <QuadrantTitle
          name="Skrajna zielona"
          shortName=""
          look="extreme"
          color="#36db8b"
        />,
      );

      expect(getTitle()).toHaveAttribute("data-look", "extreme");
      expect(getTitle()).toHaveClass("bg-(--nolan-color)", "text-white");
    });

    it("uses the neutral fallback without a colour", () => {
      render(<QuadrantTitle name="Zielona" shortName="" look="extreme" />);

      expect(getTitle()).toHaveClass("bg-gi-dark-gray", "text-white");
    });
  });

  describe("given a short name", () => {
    it("swaps to it by a container query on the title, not by measuring", () => {
      render(
        <QuadrantTitle
          name="Umiarkowana zielona"
          shortName="Um. zielona"
          look="moderate"
        />,
      );

      expect(getTitle()).toHaveClass("@container");
      expect(screen.getByText("Umiarkowana zielona")).toHaveClass(
        "@max-[176px]:sr-only",
      );
      expect(screen.getByTestId("nolan-chart-title-short")).toHaveClass(
        "hidden",
        "@max-[176px]:block",
      );
    });

    it("keeps the full name for assistive technology and hides the short one", () => {
      render(
        <QuadrantTitle
          name="Umiarkowana zielona"
          shortName="Um. zielona"
          look="moderate"
        />,
      );

      expect(screen.getByText("Um. zielona")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
      expect(screen.getByText("Umiarkowana zielona")).not.toHaveAttribute(
        "aria-hidden",
      );
    });
  });

  describe("given no short name", () => {
    it("renders the full name alone, truncated when it does not fit", () => {
      render(
        <QuadrantTitle
          name="Umiarkowana zielona"
          shortName=""
          look="moderate"
        />,
      );

      const name = screen.getByText("Umiarkowana zielona");

      expect(
        screen.queryByTestId("nolan-chart-title-short"),
      ).not.toBeInTheDocument();
      expect(name).toHaveClass("truncate");
      expect(name).not.toHaveClass("@max-[176px]:sr-only");
    });
  });
});
