import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { HorizontalBarChartEmpty } from "./HorizontalBarChartEmpty";

const TEXT = "Brak najbliższej partii";

describe("<HorizontalBarChartEmpty />", () => {
  describe("given a text", () => {
    it("renders it where a name would stand, quiet", () => {
      renderWithI18n(<HorizontalBarChartEmpty text={TEXT} />);

      expect(screen.getByText(TEXT).tagName).toBe("P");
      expect(screen.getByText(TEXT)).toHaveClass("text-gi-primary/50");
    });

    it("wraps the text and never cuts it", () => {
      renderWithI18n(<HorizontalBarChartEmpty text={TEXT} />);

      expect(screen.getByText(TEXT)).toHaveClass("wrap-break-word");
      expect(screen.getByText(TEXT).className).not.toMatch(
        /truncate|line-clamp/,
      );
    });

    it("draws an empty track under it: no fill, no cap, no marker", () => {
      renderWithI18n(<HorizontalBarChartEmpty text={TEXT} />);

      expect(screen.getByRole("img", { name: "Brak wyniku" })).toBeVisible();
      expect(screen.getByTestId("universal-axis-socket")).toBeInTheDocument();
      expect(
        screen.queryByTestId("universal-axis-fill-start"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("universal-axis-cap-start"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("universal-axis-marker"),
      ).not.toBeInTheDocument();
    });
  });
});
