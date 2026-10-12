import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Orientation } from "@/types/orientation";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { DoubleAxisChart } from "./DoubleAxisChart";

const euroscepticism: Orientation = {
  id: "euroscepticism",
  type: "ideology",
  name: "Eurosceptycyzm",
  imageUrl: "https://example.com/euroscepticism.svg",
  color: "#b57459",
};

const federalism: Orientation = {
  id: "federalism",
  type: "ideology",
  name: "Federacjonizm",
  imageUrl: "https://example.com/federalism.svg",
  color: "#1976be",
};

const friend: Orientation = {
  id: "friend",
  type: "person",
  name: "Ania",
  imageUrl: "https://example.com/ania.png",
  color: "#004554",
};

const LONG_START_NAME = "Eurosceptycyzm z bardzo długą nazwą autorską";
const LONG_END_NAME = "Federacjonizm z równie długą nazwą autorską";

const renderChart = (
  startValue?: number,
  endValue?: number,
  start: Orientation = euroscepticism,
  end: Orientation = federalism,
) =>
  renderWithI18n(
    <DoubleAxisChart
      start={{ orientation: start, value: startValue }}
      end={{ orientation: end, value: endValue }}
    />,
  );

const getChip = () => screen.getByTestId("orientation-chip");

const expectBothCapsAndLabels = () => {
  expect(screen.getByTestId("universal-axis-cap-start")).toBeInTheDocument();
  expect(screen.getByTestId("universal-axis-cap-end")).toBeInTheDocument();

  const labels = screen.getByTestId("universal-axis-labels");

  expect(labels).toHaveTextContent("Eurosceptycyzm");
  expect(labels).toHaveTextContent("Federacjonizm");
};

describe("<DoubleAxisChart />", () => {
  describe("given a lead", () => {
    it("renders a chip with the leading orientation, in its colour", () => {
      renderChart(69, 31);

      const chip = getChip();

      expect(chip).toHaveAttribute("data-look", "emphasised");
      expect(chip).toHaveTextContent("Eurosceptycyzm");
      expect(chip.style.getPropertyValue("--chip-color")).toBe("#b57459");
      expect(screen.getByTestId("orientation-chip-image")).toHaveAttribute(
        "src",
        "https://example.com/euroscepticism.svg",
      );
      expect(screen.getByTestId("module-wrapper-title-slot")).toContainElement(
        chip,
      );
    });

    it("renders the end orientation when it leads", () => {
      renderChart(31, 69);

      const chip = getChip();

      expect(chip).toHaveTextContent("Federacjonizm");
      expect(chip.style.getPropertyValue("--chip-color")).toBe("#1976be");
      expect(screen.getByTestId("orientation-chip-image")).toHaveAttribute(
        "src",
        "https://example.com/federalism.svg",
      );
    });

    it("names the card after the leading orientation", () => {
      renderChart(69, 31);

      expect(
        screen.getByRole("region", { name: "Eurosceptycyzm" }),
      ).toBeInTheDocument();
    });

    it("names a side on a narrow lead", () => {
      renderChart(49, 51);

      expect(getChip()).toHaveAttribute("data-look", "emphasised");
      expect(getChip()).toHaveTextContent("Federacjonizm");
    });
  });

  describe("given a tie", () => {
    it("renders a neutral chip naming both poles, start first", () => {
      renderChart(50, 50);

      const chip = getChip();

      expect(chip).toHaveAttribute("data-look", "neutral");
      expect(chip).toHaveTextContent("Eurosceptycyzm / Federacjonizm");
      expect(chip.style.getPropertyValue("--chip-color")).toBe("");
      expect(
        screen.queryByTestId("orientation-chip-image"),
      ).not.toBeInTheDocument();
    });

    it("names the card after both poles", () => {
      renderChart(50, 50);

      expect(
        screen.getByRole("region", { name: "Eurosceptycyzm / Federacjonizm" }),
      ).toBeInTheDocument();
    });

    it("gives the chip the word for a tie to show on a narrow card", () => {
      renderChart(50, 50);

      const shortName = screen.getByTestId("orientation-chip-short-name");

      expect(getChip()).toContainElement(shortName);
      expect(shortName).toHaveTextContent(/^Remis$/);
      expect(shortName).toHaveAttribute("aria-hidden", "true");
    });

    it("keeps both poles for assistive technology on a narrow card", () => {
      renderChart(50, 50);

      const pair = screen.getByTestId("orientation-chip-name-pair");

      expect(pair.textContent).toBe("Eurosceptycyzm / Federacjonizm");
      expect(pair).toHaveClass("@max-[240px]:sr-only");
      expect(pair).not.toHaveAttribute("aria-hidden");
    });

    it("is a tie when the values round to the same number", () => {
      renderChart(50.4, 49.6);

      expect(getChip()).toHaveAttribute("data-look", "neutral");
      expect(
        screen.getByRole("img", {
          name: "Eurosceptycyzm: 50%, Federacjonizm: 50%",
        }),
      ).toBeInTheDocument();
    });

    it("is a tie when both values are zero", () => {
      renderChart(0, 0);

      expect(getChip()).toHaveAttribute("data-look", "neutral");
    });
  });

  describe("given both values", () => {
    it("renders a double-sided bar with labels", () => {
      renderChart(69, 31);

      expect(screen.getByTestId("universal-axis-fill-start")).toHaveStyle({
        width: "69%",
      });
      expect(screen.getByTestId("universal-axis-fill-end")).toHaveStyle({
        width: "31%",
      });
      expectBothCapsAndLabels();
      expect(
        screen.getByRole("img", {
          name: "Eurosceptycyzm: 69%, Federacjonizm: 31%",
        }),
      ).toBeInTheDocument();
    });

    it("does not normalise values that do not reach 100", () => {
      renderChart(47, 31);

      expect(screen.getByTestId("universal-axis-fill-start")).toHaveStyle({
        width: "47%",
      });
      expect(screen.getByTestId("universal-axis-fill-end")).toHaveStyle({
        width: "31%",
      });
      expect(getChip()).toHaveTextContent("Eurosceptycyzm");
    });

    it("renders the marker at 50 by default", () => {
      renderChart(69, 31);

      expect(
        screen
          .getByTestId("universal-axis-marker")
          .style.getPropertyValue("--axis-position"),
      ).toBe("50%");
    });
  });

  describe("given values that exceed 100 together", () => {
    it("lets the bar scale them and decides the lead on the values as given", () => {
      renderChart(80, 120);

      expect(screen.getByTestId("universal-axis-fill-start")).toHaveStyle({
        width: `${(80 / 180) * 100}%`,
      });
      expect(getChip()).toHaveTextContent("Federacjonizm");
    });
  });

  describe("given one absent value", () => {
    it("keeps that side cap and label, with no fill and no number", () => {
      renderChart(undefined, 31);

      expect(
        screen.queryByTestId("universal-axis-fill-start"),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("universal-axis-fill-end")).toHaveStyle({
        width: "31%",
      });
      expect(screen.getByTestId("universal-axis-track")).toHaveTextContent(
        /^31%$/,
      );
      expectBothCapsAndLabels();
    });

    it("names the side that has a value above zero", () => {
      renderChart(undefined, 31);

      expect(getChip()).toHaveAttribute("data-look", "emphasised");
      expect(getChip()).toHaveTextContent("Federacjonizm");
    });

    it("is a tie when the other side is zero", () => {
      renderChart(0);

      expect(getChip()).toHaveAttribute("data-look", "neutral");
      expectBothCapsAndLabels();
    });
  });

  describe("given both values absent", () => {
    it("renders an empty double-sided track with both caps and labels", () => {
      renderChart();

      expect(screen.getByTestId("universal-axis-track")).toHaveTextContent("");
      expect(
        screen.queryByTestId("universal-axis-fill-start"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("universal-axis-fill-end"),
      ).not.toBeInTheDocument();
      expectBothCapsAndLabels();
      expect(getChip()).toHaveAttribute("data-look", "neutral");
    });
  });

  describe("given a value that is not a number", () => {
    it.each([
      Number.NaN,
      "69" as unknown as number,
      null as unknown as number,
    ])("treats %j as absent", (value) => {
      renderChart(value, 31);

      expect(
        screen.queryByTestId("universal-axis-fill-start"),
      ).not.toBeInTheDocument();
      expect(getChip()).toHaveTextContent("Federacjonizm");
      expectBothCapsAndLabels();
    });
  });

  describe("given a comparison", () => {
    it("passes it to the bar", () => {
      renderWithI18n(
        <DoubleAxisChart
          start={{ orientation: euroscepticism, value: 69 }}
          end={{ orientation: federalism, value: 31 }}
          comparison={{ orientation: friend, value: 90 }}
        />,
      );

      expect(
        screen.getByTestId("universal-axis-comparison-image"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("universal-axis-band")).toHaveStyle({
        left: "69%",
        width: "21%",
      });
      expect(
        screen.getByRole("img", {
          name: "Eurosceptycyzm: 69%, Federacjonizm: 31%, porównanie z Ania: 90%",
        }),
      ).toBeInTheDocument();
    });
  });

  describe("given a leading orientation without an image", () => {
    it("renders the chip with the name alone", () => {
      renderChart(69, 31, { ...euroscepticism, imageUrl: undefined });

      expect(getChip()).toHaveTextContent("Eurosceptycyzm");
      expect(
        screen.queryByTestId("orientation-chip-image"),
      ).not.toBeInTheDocument();
    });
  });

  describe("given a leading orientation without a name", () => {
    it.each([
      "",
      "   ",
      undefined,
    ])("renders the chip with the image alone for %j", (name) => {
      renderChart(69, 31, { ...euroscepticism, name });

      expect(getChip()).toHaveTextContent("");
      expect(screen.getByTestId("orientation-chip-image")).toBeInTheDocument();
      expect(screen.getByTestId("universal-axis-labels")).toHaveTextContent(
        "Federacjonizm",
      );
    });

    it("passes no title when there is no image either", () => {
      renderChart(69, 31, { ...euroscepticism, name: "", imageUrl: undefined });

      expect(screen.queryByTestId("orientation-chip")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("module-wrapper-title-slot"),
      ).not.toBeInTheDocument();
      expect(
        screen.getByTestId("universal-axis-fill-start"),
      ).toBeInTheDocument();
    });
  });

  describe("given a tie with a missing name", () => {
    it("shows the word for a tie, never the pole that has a name", () => {
      renderChart(50, 50, { ...euroscepticism, name: "" });

      expect(getChip()).toHaveAttribute("data-look", "neutral");
      expect(getChip().textContent).toBe("Remis");
      expect(screen.getByText("Remis")).not.toHaveAttribute("aria-hidden");
      expect(
        screen.queryByTestId("orientation-chip-short-name"),
      ).not.toBeInTheDocument();
    });

    it("names the card with the word for a tie", () => {
      renderChart(50, 50, euroscepticism, { ...federalism, name: " " });

      expect(screen.getByRole("region", { name: "Remis" })).toBeInTheDocument();
      expect(
        screen.queryByRole("region", { name: "Eurosceptycyzm" }),
      ).not.toBeInTheDocument();
    });

    it("still names the pole that has a name under its cap", () => {
      renderChart(50, 50, { ...euroscepticism, name: "" });

      expect(screen.getByTestId("universal-axis-labels")).toHaveTextContent(
        "Federacjonizm",
      );
    });

    it("shows the word for a tie when both names are missing", () => {
      renderChart(
        50,
        50,
        { ...euroscepticism, name: "" },
        { ...federalism, name: "" },
      );

      expect(getChip().textContent).toBe("Remis");
      expect(screen.getByTestId("module-wrapper-title-slot")).toContainElement(
        getChip(),
      );
      expect(screen.getByRole("region", { name: "Remis" })).toBeInTheDocument();
      expect(screen.getByTestId("universal-axis-cap-end")).toBeInTheDocument();
    });
  });

  describe("given an orientation without a colour", () => {
    it("uses the neutral fallback on the chip and on the bar", () => {
      renderChart(69, 31, { ...euroscepticism, color: undefined });

      expect(getChip()).toHaveClass("bg-gi-dark-gray");
      expect(screen.getByTestId("universal-axis-fill-start")).toHaveClass(
        "bg-gi-dark-gray",
      );
    });

    it("drops an unsafe colour on the chip and on the bar", () => {
      renderChart(69, 31, {
        ...euroscepticism,
        color: "red; background: url(x)",
      });

      expect(getChip().style.getPropertyValue("--chip-color")).toBe("");
      expect(
        screen
          .getByTestId("universal-axis-fill-start")
          .style.getPropertyValue("--axis-color"),
      ).toBe("");
    });
  });

  describe("given both poles are the same orientation", () => {
    it("draws them as given", () => {
      renderChart(69, 31, euroscepticism, euroscepticism);

      expect(getChip()).toHaveTextContent("Eurosceptycyzm");
      expect(
        screen.getByRole("img", {
          name: "Eurosceptycyzm: 69%, Eurosceptycyzm: 31%",
        }),
      ).toBeInTheDocument();
    });
  });

  describe("given long names", () => {
    it("truncates the labels and keeps the full names for assistive technology", () => {
      renderChart(
        50,
        50,
        { ...euroscepticism, name: LONG_START_NAME },
        { ...federalism, name: LONG_END_NAME },
      );

      const labels = within(screen.getByTestId("universal-axis-labels"));

      expect(labels.getByText(LONG_START_NAME)).toHaveClass("truncate");
      expect(labels.getByText(LONG_END_NAME)).toHaveClass("truncate");
      expect(
        screen.getByRole("region", {
          name: `${LONG_START_NAME} / ${LONG_END_NAME}`,
        }),
      ).toBeInTheDocument();
    });

    it("truncates each name of a tie title on its own, so that both poles remain", () => {
      renderChart(
        50,
        50,
        { ...euroscepticism, name: LONG_START_NAME },
        { ...federalism, name: LONG_END_NAME },
      );

      const pair = screen.getByTestId("orientation-chip-name-pair");

      expect(within(pair).getByText(LONG_START_NAME)).toHaveClass("truncate");
      expect(within(pair).getByText(LONG_END_NAME)).toHaveClass("truncate");
      expect(pair).not.toHaveClass("truncate");
      expect(pair.textContent).toBe(`${LONG_START_NAME} / ${LONG_END_NAME}`);
    });

    it("truncates a title with a lead as one text", () => {
      renderChart(69, 31, { ...euroscepticism, name: LONG_START_NAME });

      expect(within(getChip()).getByText(LONG_START_NAME)).toHaveClass(
        "truncate",
      );
      expect(
        screen.queryByTestId("orientation-chip-short-name"),
      ).not.toBeInTheDocument();
    });
  });

  describe("given marker is false", () => {
    it("renders the bar without a marker", () => {
      renderWithI18n(
        <DoubleAxisChart
          start={{ orientation: euroscepticism, value: 69 }}
          end={{ orientation: federalism, value: 31 }}
          marker={false}
        />,
      );

      expect(
        screen.queryByTestId("universal-axis-marker"),
      ).not.toBeInTheDocument();
    });
  });

  describe("given a custom marker", () => {
    it("passes it to the bar without changing the lead", () => {
      renderWithI18n(
        <DoubleAxisChart
          start={{ orientation: euroscepticism, value: 69 }}
          end={{ orientation: federalism, value: 31 }}
          marker={75}
        />,
      );

      expect(
        screen
          .getByTestId("universal-axis-marker")
          .style.getPropertyValue("--axis-position"),
      ).toBe("75%");
      expect(getChip()).toHaveTextContent("Eurosceptycyzm");
    });
  });

  describe("given handlers", () => {
    it("passes onStatsClick and onInfoClick to the wrapper", () => {
      const handleStatsClick = vi.fn();
      const handleInfoClick = vi.fn();
      renderWithI18n(
        <DoubleAxisChart
          start={{ orientation: euroscepticism, value: 69 }}
          end={{ orientation: federalism, value: 31 }}
          onStatsClick={handleStatsClick}
          onInfoClick={handleInfoClick}
        />,
      );

      fireEvent.click(
        screen.getByRole("button", { name: "Statystyki: Eurosceptycyzm" }),
      );
      fireEvent.click(
        screen.getByRole("button", { name: "Informacje: Eurosceptycyzm" }),
      );

      expect(handleStatsClick).toHaveBeenCalledTimes(1);
      expect(handleInfoClick).toHaveBeenCalledTimes(1);
    });

    it("renders no buttons without handlers", () => {
      renderChart(69, 31);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });
});
