import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HATCH_CLASS_NAME } from "@/constants/hatch";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { NolanChart } from "./NolanChart";
import type {
  NolanAxis,
  NolanChartProps,
  NolanComparison,
  NolanLevelNames,
} from "./NolanChart.types";

const GREEN = "#36db8b";
const PURPLE = "#8443e9";

const LEFT_NAMES: NolanLevelNames = {
  moderate: "Umiarkowana lewica",
  extreme: "Skrajna lewica",
};
const RIGHT_NAMES: NolanLevelNames = {
  moderate: "Umiarkowana prawica",
  extreme: "Skrajna prawica",
};

const createAxis = (
  name: string,
  start?: number,
  end?: number,
  hasNames = true,
): NolanAxis => ({
  name,
  start: {
    entry: {
      orientation: {
        id: `${name}-start`,
        type: "ideology",
        name: `${name} start`,
        imageUrl: `https://example.com/${name}-start.svg`,
        color: "#111111",
      },
      value: start,
    },
    names: hasNames ? LEFT_NAMES : undefined,
  },
  end: {
    entry: {
      orientation: {
        id: `${name}-end`,
        type: "ideology",
        name: `${name} end`,
        imageUrl: `https://example.com/${name}-end.svg`,
        color: "#222222",
      },
      value: end,
    },
    names: hasNames ? RIGHT_NAMES : undefined,
  },
});

const quadrants: NolanChartProps["quadrants"] = {
  topLeft: {
    color: "#eb5760",
    names: { moderate: "Umiarkowana czerwona", extreme: "Skrajna czerwona" },
  },
  topRight: {
    color: "#57bfeb",
    names: { moderate: "Umiarkowana niebieska", extreme: "Skrajna niebieska" },
  },
  bottomLeft: {
    color: GREEN,
    names: { moderate: "Umiarkowana zielona", extreme: "Skrajna zielona" },
  },
  bottomRight: {
    color: PURPLE,
    names: { moderate: "Umiarkowana fioletowa", extreme: "Skrajna fioletowa" },
  },
};

const friend: NolanComparison = {
  orientation: {
    id: "friend",
    type: "person",
    name: "Rafał",
    imageUrl: "https://example.com/friend.png",
  },
  horizontal: { start: 58, end: 42 },
  vertical: { start: 68, end: 32 },
};

const CENTRE: [number, number, number, number] = [50, 50, 50, 50];
const MODERATE: [number, number, number, number] = [77, 23, 67, 33];
const EXTREME: [number, number, number, number] = [0, 100, 100, 0];

const renderChart = (
  [xStart, xEnd, yStart, yEnd]: (number | undefined)[] = MODERATE,
  props: Partial<NolanChartProps> = {},
) =>
  renderWithI18n(
    <NolanChart
      horizontal={createAxis("Gospodarka", xStart, xEnd)}
      vertical={createAxis("Światopogląd", yStart, yEnd)}
      quadrants={quadrants}
      centreName="Centrum"
      {...props}
    />,
  );

const getFilledQuadrants = () =>
  screen
    .getAllByTestId(/^nolan-chart-quadrant-/)
    .filter((quadrant) => quadrant.dataset.filled === "true")
    .map((quadrant) => quadrant.dataset.testid);

const getControl = () => screen.getByRole("button", { name: /osie$/ });
const openCard = () => fireEvent.click(getControl());
const getRows = () => screen.getAllByTestId("axis-row");
const getMapDescription = () =>
  screen
    .getAllByRole("img")
    .find((image) => within(image).queryByTestId("nolan-chart-map"))
    ?.getAttribute("aria-label");

describe("<NolanChart />", () => {
  describe("given a centre position", () => {
    it("renders the centre name in the plain title style", () => {
      renderChart(CENTRE);

      expect(
        screen.getByRole("heading", { level: 2, name: "Centrum" }),
      ).toBeInTheDocument();
      expect(screen.queryByTestId("nolan-chart-title")).not.toBeInTheDocument();
    });

    it("fills no quadrant", () => {
      renderChart(CENTRE);

      expect(getFilledQuadrants()).toEqual([]);
      expect(screen.getAllByTestId(/^nolan-chart-quadrant-/)).toHaveLength(4);
    });

    it("still draws the dot", () => {
      renderChart(CENTRE);

      expect(screen.getByTestId("nolan-chart-dot")).toBeInTheDocument();
    });
  });

  describe("given a moderate position", () => {
    it("renders the quadrant moderate name on a pale tint", () => {
      renderChart(MODERATE);

      const title = screen.getByTestId("nolan-chart-title");

      expect(title).toHaveTextContent("Umiarkowana zielona");
      expect(title).toHaveClass("bg-(--nolan-color)/10", "text-gi-primary");
      expect(title.style.getPropertyValue("--nolan-color")).toBe(GREEN);
      expect(
        screen.getByRole("region", { name: "Umiarkowana zielona" }),
      ).toBeInTheDocument();
    });

    it("fills the taker quadrant", () => {
      renderChart(MODERATE);

      const quadrant = screen.getByTestId("nolan-chart-quadrant-bottomLeft");

      expect(getFilledQuadrants()).toEqual(["nolan-chart-quadrant-bottomLeft"]);
      expect(quadrant).toHaveClass("bg-(--nolan-color)");
      expect(quadrant.style.getPropertyValue("--nolan-color")).toBe(GREEN);
      expect(screen.getByTestId("nolan-chart-quadrant-topLeft")).toHaveClass(
        "bg-(--nolan-color)/10",
      );
    });
  });

  describe("given an extreme position", () => {
    it("renders the quadrant extreme name on the full colour", () => {
      renderChart(EXTREME);

      const title = screen.getByTestId("nolan-chart-title");

      expect(title).toHaveTextContent("Skrajna fioletowa");
      expect(title).toHaveAttribute("data-look", "extreme");
      expect(title).toHaveClass("bg-(--nolan-color)", "text-white");
      expect(title.style.getPropertyValue("--nolan-color")).toBe(PURPLE);
      expect(getFilledQuadrants()).toEqual([
        "nolan-chart-quadrant-bottomRight",
      ]);
    });
  });

  describe("given no position", () => {
    it("renders the no result wording, no dot and no filled quadrant", () => {
      renderChart([undefined, 23, 67, 33]);

      expect(
        screen.getByRole("heading", { level: 2, name: "Brak wyniku" }),
      ).toBeInTheDocument();
      expect(screen.queryByTestId("nolan-chart-dot")).not.toBeInTheDocument();
      expect(getFilledQuadrants()).toEqual([]);
      expect(
        screen.queryByTestId("nolan-chart-coordinate-horizontal"),
      ).not.toBeInTheDocument();
      expect(getMapDescription()).toBe("Brak wyniku");
    });

    it("treats a value that is not a number as no position", () => {
      renderChart([77, 23, Number.NaN, 33]);

      expect(
        screen.getByRole("heading", { level: 2, name: "Brak wyniku" }),
      ).toBeInTheDocument();
    });

    it("opens into rows without a lean or a pole name", () => {
      renderChart([undefined, 23, 67, 33]);
      openCard();

      const [row] = getRows();

      expect(within(row).getByRole("heading", { level: 3 })).toHaveTextContent(
        /^Gospodarka$/,
      );
      expect(
        within(row)
          .getByTestId("universal-axis-cap-end")
          .style.getPropertyValue("--axis-color"),
      ).toBe("");
    });
  });

  describe("map", () => {
    it("renders the dot at the position", () => {
      renderChart(MODERATE);

      const dot = screen.getByTestId("nolan-chart-dot");

      expect(dot.style.getPropertyValue("--nolan-x")).toBe("23%");
      expect(dot.style.getPropertyValue("--nolan-y")).toBe("67%");
      expect(dot).toHaveClass("left-(--nolan-x)", "top-(--nolan-y)");
    });

    it("places the dot exactly at a corner and does not clip it", () => {
      renderChart(EXTREME);

      const dot = screen.getByTestId("nolan-chart-dot");
      const map = screen.getByTestId("nolan-chart-map");

      expect(dot.style.getPropertyValue("--nolan-x")).toBe("100%");
      expect(dot.style.getPropertyValue("--nolan-y")).toBe("100%");
      expect(dot.parentElement).toBe(map);
      expect(map).toHaveClass("aspect-square", "rounded-xl");
      expect(map).not.toHaveClass("overflow-hidden");
    });

    it("keeps the halo and the quadrants clipped to the rounded map", () => {
      renderChart(EXTREME);

      const clipClassNames = ["overflow-hidden", "rounded-xl"];

      expect(screen.getByTestId("nolan-chart-halo").parentElement).toHaveClass(
        ...clipClassNames,
      );
      expect(
        screen.getByTestId("nolan-chart-quadrant-topLeft").parentElement
          ?.parentElement,
      ).toHaveClass(...clipClassNames);
    });

    it("names both axes with their coordinates rounded to two decimals", () => {
      renderChart([77.4, 23, 67, 33]);

      expect(
        screen.getByTestId("nolan-chart-axis-horizontal"),
      ).toHaveTextContent("Gospodarka-0.54");
      expect(screen.getByTestId("nolan-chart-axis-vertical")).toHaveTextContent(
        "Światopogląd-0.34",
      );
    });

    it("is announced as a single described image", () => {
      renderChart(MODERATE);

      expect(
        screen.getByRole("img", {
          name: "Umiarkowana zielona. Gospodarka: -0.54, Światopogląd: -0.34",
        }),
      ).toContainElement(screen.getByTestId("nolan-chart-map"));
    });

    it("draws an axis without a name by its coordinate alone", () => {
      renderChart(MODERATE, {
        horizontal: { ...createAxis("Gospodarka", 77, 23), name: "" },
      });

      expect(
        screen.getByTestId("nolan-chart-axis-horizontal"),
      ).toHaveTextContent(/^-0\.54$/);
    });
  });

  describe("when the card is opened", () => {
    it("starts closed", () => {
      renderChart();

      expect(screen.queryByTestId("axis-row")).not.toBeInTheDocument();
    });

    it("renders two axis rows, horizontal first", () => {
      renderChart();
      openCard();

      const rows = getRows();

      expect(rows).toHaveLength(2);
      expect(rows[0]).toHaveTextContent("Gospodarka");
      expect(rows[1]).toHaveTextContent("Światopogląd");
    });

    it("heads each row with the axis name and the pole name for its level", () => {
      renderChart([100, 0, 30, 70]);
      openCard();

      const [horizontalRow, verticalRow] = getRows();

      expect(horizontalRow).toHaveTextContent("Gospodarka — Skrajna lewica");
      expect(verticalRow).toHaveTextContent(
        "Światopogląd — Umiarkowana prawica",
      );
    });

    it("heads a row at the centre level with the axis name alone", () => {
      renderChart([100, 0, 40, 60]);
      openCard();

      expect(
        within(getRows()[1]).getByRole("heading", { level: 3 }),
      ).toHaveTextContent(/^Światopogląd$/);
    });

    it("colours the side the taker leans to with the quadrant colour", () => {
      renderChart(EXTREME);
      openCard();

      const [horizontalRow, verticalRow] = getRows();
      const getColor = (row: HTMLElement, side: string) =>
        within(row)
          .getByTestId(`universal-axis-cap-${side}`)
          .style.getPropertyValue("--axis-color");

      expect(getColor(horizontalRow, "end")).toBe(PURPLE);
      expect(getColor(horizontalRow, "start")).toBe("");
      expect(getColor(verticalRow, "start")).toBe(PURPLE);
      expect(getColor(verticalRow, "end")).toBe("");
    });

    it("renders the rows without labels, with the marker", () => {
      renderChart();
      openCard();

      expect(
        screen.queryByTestId("universal-axis-labels"),
      ).not.toBeInTheDocument();
      expect(screen.getAllByTestId("universal-axis-marker")).toHaveLength(2);
    });
  });

  describe("when the card is closed again", () => {
    it("renders no axis rows", () => {
      renderChart();
      openCard();
      openCard();

      expect(screen.queryByTestId("axis-row")).not.toBeInTheDocument();
      expect(getControl()).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("given a comparison", () => {
    it("renders the other side at their position, on a hatched disc", () => {
      renderChart(EXTREME, { comparison: friend });

      const disc = screen.getByTestId("nolan-chart-comparison");

      expect(disc.style.getPropertyValue("--nolan-x")).toBe("42%");
      expect(disc.style.getPropertyValue("--nolan-y")).toBe("68%");
      expect(disc).toHaveClass(...HATCH_CLASS_NAME.split(" "));
      expect(
        within(disc)
          .getByTestId("nolan-chart-comparison-image")
          .querySelector("img"),
      ).toHaveAttribute("src", "https://example.com/friend.png");
    });

    it("never fills the other side quadrant", () => {
      renderChart(CENTRE, {
        comparison: {
          ...friend,
          horizontal: { start: 100, end: 0 },
          vertical: { start: 0, end: 100 },
        },
      });

      expect(getFilledQuadrants()).toEqual([]);
    });

    it("moves the other side inward at a corner", () => {
      renderChart(MODERATE, {
        comparison: {
          ...friend,
          horizontal: { start: 0, end: 100 },
          vertical: { start: 0, end: 100 },
        },
      });

      const disc = screen.getByTestId("nolan-chart-comparison");

      expect(disc.style.getPropertyValue("--nolan-x")).toBe("100%");
      expect(disc.style.getPropertyValue("--nolan-y")).toBe("0%");
      expect(disc).toHaveClass(
        "left-[clamp(14px,var(--nolan-x),calc(100%-14px))]",
        "top-[clamp(14px,var(--nolan-y),calc(100%-14px))]",
      );
    });

    it("draws the other side on top of the taker at the same position", () => {
      renderChart(MODERATE, {
        comparison: {
          ...friend,
          horizontal: { start: 77, end: 23 },
          vertical: { start: 67, end: 33 },
        },
      });

      const dot = screen.getByTestId("nolan-chart-dot");
      const disc = screen.getByTestId("nolan-chart-comparison");

      expect(
        dot.compareDocumentPosition(disc) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it("renders no second marker when the other side has no position", () => {
      renderChart(MODERATE, {
        comparison: { ...friend, vertical: { start: 68 } },
      });

      expect(
        screen.queryByTestId("nolan-chart-comparison"),
      ).not.toBeInTheDocument();
      expect(getMapDescription()).toBe(
        "Umiarkowana zielona. Gospodarka: -0.54, Światopogląd: -0.34",
      );
    });

    it("renders a neutral placeholder when the other side has no image", () => {
      renderChart(MODERATE, {
        comparison: {
          ...friend,
          orientation: { id: "friend", type: "person", name: "Rafał" },
        },
      });

      const image = screen.getByTestId("nolan-chart-comparison-image");

      expect(image.querySelector("img")).toBeNull();
      expect(image).toHaveClass("bg-gi-dark-gray");
    });

    it("applies a safe colour of the other side behind the image", () => {
      renderChart(MODERATE, {
        comparison: {
          ...friend,
          orientation: { ...friend.orientation, color: "#123456" },
        },
      });

      const image = screen.getByTestId("nolan-chart-comparison-image");

      expect(image).toHaveClass("bg-(--nolan-color)");
      expect(image.style.getPropertyValue("--nolan-color")).toBe("#123456");
    });

    it("passes the comparison to both rows when opened", () => {
      renderChart(EXTREME, { comparison: friend });
      openCard();

      const [horizontalRow, verticalRow] = getRows();

      expect(
        within(horizontalRow).getByRole("img", { name: /Rafał: 58%/ }),
      ).toBeInTheDocument();
      expect(
        within(verticalRow).getByRole("img", { name: /Rafał: 68%/ }),
      ).toBeInTheDocument();
    });

    it("passes no comparison to a row the other side has no value for", () => {
      renderChart(EXTREME, {
        comparison: { ...friend, vertical: { end: 32 } },
      });
      openCard();

      const [horizontalRow, verticalRow] = getRows();

      expect(
        within(horizontalRow).getByTestId("universal-axis-comparison-image"),
      ).toBeInTheDocument();
      expect(
        within(verticalRow).queryByTestId("universal-axis-comparison-image"),
      ).not.toBeInTheDocument();
    });

    it("includes the other side quadrant in the map description", () => {
      renderChart(EXTREME, {
        comparison: {
          ...friend,
          horizontal: { start: 90, end: 10 },
          vertical: { start: 10, end: 90 },
        },
      });

      expect(getMapDescription()).toBe(
        "Skrajna fioletowa. Gospodarka: 1.0, Światopogląd: -1.0. Rafał: Skrajna czerwona",
      );
    });

    it("describes the other side at the centre by the centre name", () => {
      renderChart(EXTREME, { comparison: friend });

      expect(getMapDescription()).toContain("Rafał: Centrum");
    });

    it("leaves the other side out of the description without a name", () => {
      renderChart(EXTREME, {
        comparison: {
          ...friend,
          orientation: { id: "friend", type: "person", name: " " },
        },
      });

      expect(getMapDescription()).toBe(
        "Skrajna fioletowa. Gospodarka: 1.0, Światopogląd: -1.0",
      );
    });
  });

  describe("given missing names", () => {
    it("falls back to the quadrant other name, then to the centre name", () => {
      const { unmount } = renderChart(MODERATE, {
        quadrants: {
          ...quadrants,
          bottomLeft: { color: GREEN, names: { extreme: "Skrajna zielona" } },
        },
      });

      expect(screen.getByTestId("nolan-chart-title")).toHaveTextContent(
        "Skrajna zielona",
      );

      unmount();

      const second = renderChart(EXTREME, {
        quadrants: {
          ...quadrants,
          bottomRight: { color: PURPLE, names: { moderate: "Fioletowa" } },
        },
      });

      expect(screen.getByTestId("nolan-chart-title")).toHaveTextContent(
        "Fioletowa",
      );

      second.unmount();

      renderChart(MODERATE, {
        quadrants: { ...quadrants, bottomLeft: { color: GREEN } },
      });

      expect(
        screen.getByRole("heading", { level: 2, name: "Centrum" }),
      ).toBeInTheDocument();
      expect(getFilledQuadrants()).toEqual(["nolan-chart-quadrant-bottomLeft"]);
    });

    it("renders no title when the centre name is missing", () => {
      renderChart(CENTRE, { centreName: undefined });

      expect(
        screen.queryByRole("heading", { level: 2 }),
      ).not.toBeInTheDocument();
      expect(getMapDescription()).toBe("Gospodarka: 0.0, Światopogląd: 0.0");
    });

    it("heads a row with the axis name alone when the pole name is missing", () => {
      renderChart(MODERATE, {
        horizontal: createAxis("Gospodarka", 77, 23, false),
      });
      openCard();

      expect(
        within(getRows()[0]).getByRole("heading", { level: 3 }),
      ).toHaveTextContent(/^Gospodarka$/);
    });

    it("does not throw without quadrants", () => {
      renderChart(MODERATE, {
        quadrants: undefined as unknown as NolanChartProps["quadrants"],
      });

      expect(
        screen.getByRole("heading", { level: 2, name: "Centrum" }),
      ).toBeInTheDocument();
    });
  });

  describe("given short quadrant names", () => {
    const shortQuadrants: NolanChartProps["quadrants"] = {
      ...quadrants,
      bottomLeft: {
        color: GREEN,
        names: {
          ...quadrants.bottomLeft.names,
          moderateShort: "Um. zielona",
        },
      },
      bottomRight: {
        color: PURPLE,
        names: {
          ...quadrants.bottomRight.names,
          extremeShort: "Skr. fioletowa",
        },
      },
    };

    it("offers the short name to a narrow title and keeps the full one for assistive technology", () => {
      renderChart(MODERATE, { quadrants: shortQuadrants });

      const short = screen.getByTestId("nolan-chart-title-short");

      expect(short).toHaveTextContent("Um. zielona");
      expect(short).toHaveAttribute("aria-hidden", "true");
      expect(short).toHaveClass("hidden", "@max-[176px]:block");
      expect(screen.getByText("Umiarkowana zielona")).toHaveClass(
        "@max-[176px]:sr-only",
      );
      expect(
        screen.getByRole("region", { name: "Umiarkowana zielona" }),
      ).toBeInTheDocument();
      expect(getMapDescription()).toContain("Umiarkowana zielona.");
    });

    it("offers the short extreme name too", () => {
      renderChart(EXTREME, { quadrants: shortQuadrants });

      expect(screen.getByTestId("nolan-chart-title-short")).toHaveTextContent(
        "Skr. fioletowa",
      );
    });

    it("renders the full name alone when no short one was supplied", () => {
      renderChart(MODERATE);

      expect(
        screen.queryByTestId("nolan-chart-title-short"),
      ).not.toBeInTheDocument();
      expect(screen.getByText("Umiarkowana zielona")).not.toHaveClass(
        "@max-[176px]:sr-only",
      );
    });

    it("leaves the row headings and the axis pills on the full names", () => {
      renderChart(MODERATE, { quadrants: shortQuadrants });
      openCard();

      expect(getRows()[0]).toHaveTextContent("Gospodarka — Umiarkowana lewica");
    });
  });

  describe("given a quadrant without a colour", () => {
    it("uses the neutral fallback", () => {
      renderChart(MODERATE, {
        quadrants: {
          ...quadrants,
          bottomLeft: { names: quadrants.bottomLeft.names },
          topLeft: {
            color: "url(javascript:alert(1))",
            names: quadrants.topLeft.names,
          },
        },
      });
      openCard();

      const title = screen.getByTestId("nolan-chart-title");
      const tinted = screen.getByTestId("nolan-chart-quadrant-topLeft");

      expect(title).toHaveClass("bg-gi-dark-gray/10", "text-gi-dark-gray");
      expect(title.style.getPropertyValue("--nolan-color")).toBe("");
      expect(screen.getByTestId("nolan-chart-quadrant-bottomLeft")).toHaveClass(
        "bg-gi-dark-gray",
      );
      expect(tinted).toHaveClass("bg-gi-dark-gray/10");
      expect(tinted.style.getPropertyValue("--nolan-color")).toBe("");
      expect(
        within(getRows()[0])
          .getByTestId("universal-axis-cap-start")
          .style.getPropertyValue("--axis-color"),
      ).toBe("");
    });
  });

  describe("accessibility", () => {
    it("says on the control whether the card is open", () => {
      renderChart();

      const control = screen.getByRole("button", { name: "Pokaż osie" });

      expect(control).toHaveAttribute("aria-expanded", "false");
      expect(control).not.toHaveAttribute("aria-controls");

      fireEvent.click(control);

      expect(control).toHaveAccessibleName("Ukryj osie");
      expect(control).toHaveAttribute("aria-expanded", "true");
      expect(control).toHaveAttribute(
        "aria-controls",
        screen.getByTestId("nolan-chart-rows").id,
      );
    });

    it("keeps the same control, and so the focus, across open and close", () => {
      renderChart();

      const control = getControl();

      control.focus();
      fireEvent.click(control);

      expect(getControl()).toBe(control);
      expect(control).toHaveFocus();
    });

    it("names the wrapper actions after the title", () => {
      const onStatsClick = vi.fn();
      const onInfoClick = vi.fn();

      renderChart(MODERATE, { onStatsClick, onInfoClick });

      fireEvent.click(
        screen.getByRole("button", { name: "Statystyki: Umiarkowana zielona" }),
      );
      fireEvent.click(
        screen.getByRole("button", { name: "Informacje: Umiarkowana zielona" }),
      );

      expect(onStatsClick).toHaveBeenCalledTimes(1);
      expect(onInfoClick).toHaveBeenCalledTimes(1);
    });
  });
});
