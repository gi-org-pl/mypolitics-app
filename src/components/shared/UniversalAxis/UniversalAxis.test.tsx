import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { AxisEntry } from "@/types/axis";
import type { Orientation } from "@/types/orientation";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { UniversalAxis } from "./UniversalAxis";

const orientationA: Orientation = {
  id: "a",
  type: "ideology",
  name: "Orientation A",
  imageUrl: "https://example.com/a.png",
  color: "#59b6a6",
};

const orientationB: Orientation = {
  id: "b",
  type: "ideology",
  name: "Orientation B",
  imageUrl: "https://example.com/b.png",
  color: "#bc831a",
};

const friend: Orientation = {
  id: "friend",
  type: "person",
  name: "Ania",
  imageUrl: "https://example.com/ania.png",
  color: "#004554",
};

const entryA = (value: number): AxisEntry => ({
  orientation: orientationA,
  value,
});

const entryB = (value: number): AxisEntry => ({
  orientation: orientationB,
  value,
});

const friendEntry = (value: number): AxisEntry => ({
  orientation: friend,
  value,
});

describe("<UniversalAxis />", () => {
  describe("given no entries", () => {
    it("renders an empty track with no caps and no values", () => {
      renderWithI18n(<UniversalAxis />);

      expect(screen.getByTestId("universal-axis-track")).toBeInTheDocument();
      expect(screen.getByTestId("universal-axis-socket")).toBeInTheDocument();
      expect(screen.queryByTestId(/universal-axis-cap/)).toBeNull();
      expect(screen.queryByTestId(/universal-axis-fill/)).toBeNull();
      expect(screen.queryByText(/%/)).toBeNull();
    });

    it("still renders the marker", () => {
      renderWithI18n(<UniversalAxis />);

      expect(
        screen
          .getByTestId("universal-axis-marker")
          .style.getPropertyValue("--axis-position"),
      ).toBe("50%");
    });
  });

  describe("given only a start entry", () => {
    it("renders one cap on the left and a fill from the left", () => {
      renderWithI18n(<UniversalAxis start={entryA(25)} />);

      expect(screen.getByTestId("universal-axis-cap-start")).toHaveClass(
        "left-0",
      );
      expect(screen.queryByTestId("universal-axis-cap-end")).toBeNull();
      expect(screen.getByTestId("universal-axis-fill-start")).toHaveClass(
        "left-0",
      );
      expect(screen.getByTestId("universal-axis-fill-start")).toHaveStyle({
        width: "25%",
      });
      expect(screen.getByText("25%")).toBeInTheDocument();
    });

    it("rounds the free right end of the track", () => {
      renderWithI18n(<UniversalAxis start={entryA(25)} />);

      expect(screen.getByTestId("universal-axis-track")).toHaveClass(
        "left-5",
        "right-0",
        "rounded-r-full",
      );
    });
  });

  describe("given only an end entry", () => {
    it("renders one cap on the right and a fill from the right", () => {
      renderWithI18n(<UniversalAxis end={entryB(25)} />);

      expect(screen.getByTestId("universal-axis-cap-end")).toHaveClass(
        "right-0",
      );
      expect(screen.queryByTestId("universal-axis-cap-start")).toBeNull();
      expect(screen.getByTestId("universal-axis-fill-end")).toHaveClass(
        "right-0",
      );
      expect(screen.getByTestId("universal-axis-track")).toHaveClass(
        "left-0",
        "right-5",
        "rounded-l-full",
      );
    });
  });

  describe("given both entries", () => {
    it("renders both caps and both fills", () => {
      renderWithI18n(<UniversalAxis start={entryA(69)} end={entryB(31)} />);

      expect(
        screen.getByTestId("universal-axis-cap-start"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("universal-axis-cap-end")).toBeInTheDocument();
      expect(screen.getByTestId("universal-axis-fill-start")).toHaveStyle({
        width: "69%",
      });
      expect(screen.getByTestId("universal-axis-fill-end")).toHaveStyle({
        width: "31%",
      });
      expect(screen.getByText("69%")).toBeInTheDocument();
      expect(screen.getByText("31%")).toBeInTheDocument();
    });

    it("hides the value of a side below its threshold", () => {
      renderWithI18n(<UniversalAxis start={entryA(88)} end={entryB(12)} />);

      expect(screen.getByText("88%")).toBeInTheDocument();
      expect(screen.queryByText("12%")).toBeNull();
    });
  });

  describe("given a small one-sided value", () => {
    it("writes the value after the fill in the orientation colour", () => {
      renderWithI18n(<UniversalAxis start={entryA(5)} />);

      const value = screen.getByTestId("universal-axis-value-start");

      expect(value).toHaveTextContent("5%");
      expect(value).toHaveClass("text-(--axis-color)");
      expect(value.style.getPropertyValue("--axis-color")).toBe("#59b6a6");
      expect(value).toHaveClass(
        "left-[max(calc(var(--axis-position)+4px),16px)]",
      );
      expect(value.style.getPropertyValue("--axis-position")).toBe("5%");
    });

    it("writes the value after an end fill from the right", () => {
      renderWithI18n(<UniversalAxis end={entryB(5)} />);

      const value = screen.getByTestId("universal-axis-value-end");

      expect(value).toHaveClass(
        "right-[max(calc(var(--axis-position)+4px),16px)]",
      );
      expect(value.style.getPropertyValue("--axis-position")).toBe("5%");
    });
  });

  describe("given showLabels", () => {
    it("renders each orientation name under its own cap", () => {
      renderWithI18n(
        <UniversalAxis start={entryA(69)} end={entryB(31)} showLabels />,
      );

      expect(screen.getByText("Orientation A")).toHaveClass("truncate");
      expect(screen.getByText("Orientation B")).toHaveClass(
        "ml-auto",
        "text-right",
      );
    });

    it("reserves the label row when a name is missing", () => {
      renderWithI18n(<UniversalAxis showLabels />);

      const labels = screen.getByTestId("universal-axis-labels");

      expect(labels).toHaveClass("h-3");
      expect(labels).toBeEmptyDOMElement();
    });

    it("renders no label row by default", () => {
      renderWithI18n(<UniversalAxis start={entryA(25)} />);

      expect(screen.queryByTestId("universal-axis-labels")).toBeNull();
    });
  });

  describe("given an orientation without a name", () => {
    it("keeps the label row reserved", () => {
      renderWithI18n(
        <UniversalAxis
          start={{
            orientation: { ...orientationA, name: undefined },
            value: 69,
          }}
          showLabels
        />,
      );

      const labels = screen.getByTestId("universal-axis-labels");

      expect(labels).toHaveClass("h-3");
      expect(labels).toHaveTextContent("");
    });

    it("describes the bar by its value alone", () => {
      renderWithI18n(
        <UniversalAxis
          start={{
            orientation: { ...orientationA, name: undefined },
            value: 69,
          }}
        />,
      );

      expect(screen.getByRole("img")).toHaveAccessibleName(": 69%");
    });
  });

  describe("given marker is false", () => {
    it("does not render the marker", () => {
      renderWithI18n(<UniversalAxis start={entryA(25)} marker={false} />);

      expect(screen.queryByTestId("universal-axis-marker")).toBeNull();
    });
  });

  describe("given a custom marker", () => {
    it("renders the marker at the given position", () => {
      renderWithI18n(<UniversalAxis start={entryA(25)} marker={75} />);

      expect(
        screen
          .getByTestId("universal-axis-marker")
          .style.getPropertyValue("--axis-position"),
      ).toBe("75%");
    });
  });

  describe("given a comparison", () => {
    it("renders the hatched band and the other side image", () => {
      renderWithI18n(
        <UniversalAxis start={entryA(25)} comparison={friendEntry(77)} />,
      );

      const band = screen.getByTestId("universal-axis-band");

      expect(band).toHaveStyle({ left: "25%", width: "52%" });
      expect(
        screen
          .getByTestId("universal-axis-comparison-image")
          .querySelector("img"),
      ).toHaveAttribute("src", "https://example.com/ania.png");
      expect(
        screen
          .getByTestId("universal-axis-comparison-image")
          .parentElement?.style.getPropertyValue("--axis-position"),
      ).toBe("77%");
    });

    it("draws the other side image above everything else", () => {
      const { container } = renderWithI18n(
        <UniversalAxis start={entryA(25)} comparison={friendEntry(77)} />,
      );

      const testIds = [
        ...container.querySelectorAll("[data-testid^='universal-axis-']"),
      ].map((element) => element.getAttribute("data-testid"));

      expect(testIds.indexOf("universal-axis-fill-start")).toBeLessThan(
        testIds.indexOf("universal-axis-marker"),
      );
      expect(testIds.indexOf("universal-axis-marker")).toBeLessThan(
        testIds.indexOf("universal-axis-band"),
      );
      expect(testIds.indexOf("universal-axis-band")).toBeLessThan(
        testIds.indexOf("universal-axis-comparison-image"),
      );
      expect(testIds.at(-1)).toBe("universal-axis-comparison-image");
    });

    it("renders no band when the values are equal", () => {
      renderWithI18n(
        <UniversalAxis start={entryA(40)} comparison={friendEntry(40)} />,
      );

      expect(screen.queryByTestId("universal-axis-band")).toBeNull();
      expect(
        screen.getByTestId("universal-axis-comparison-image"),
      ).toBeInTheDocument();
    });

    it("hatches the whole track when the taker has no entry", () => {
      renderWithI18n(<UniversalAxis comparison={friendEntry(60)} />);

      expect(screen.getByTestId("universal-axis-band")).toHaveStyle({
        left: "0%",
        width: "100%",
      });
    });

    it("renders a colour-only image when the other side has no image", () => {
      renderWithI18n(
        <UniversalAxis
          start={entryA(25)}
          comparison={{
            orientation: { ...friend, imageUrl: undefined, color: undefined },
            value: 60,
          }}
        />,
      );

      const image = screen.getByTestId("universal-axis-comparison-image");

      expect(image.querySelector("img")).toBeNull();
      expect(image).toHaveClass("bg-gi-dark-gray");
    });
  });

  describe("given an orientation with an image", () => {
    it("renders the image inside the cap", () => {
      renderWithI18n(<UniversalAxis start={entryA(25)} />);

      expect(
        screen.getByTestId("universal-axis-cap-start").querySelector("img"),
      ).toHaveAttribute("src", "https://example.com/a.png");
    });
  });

  describe("given an orientation without an image", () => {
    it("renders the cap with colour only", () => {
      renderWithI18n(
        <UniversalAxis
          start={{
            orientation: { ...orientationA, imageUrl: undefined },
            value: 25,
          }}
        />,
      );

      const cap = screen.getByTestId("universal-axis-cap-start");

      expect(cap.querySelector("img")).toBeNull();
      expect(cap).toHaveClass("bg-(--axis-color)");
      expect(cap.style.getPropertyValue("--axis-color")).toBe("#59b6a6");
    });
  });

  describe("given an orientation colour", () => {
    it("darkens the fill against the cap in every mode", () => {
      renderWithI18n(<UniversalAxis start={entryA(25)} />);

      const fill = screen.getByTestId("universal-axis-fill-start");

      expect(fill).toHaveClass("bg-(--axis-color)", "from-black/20");
      expect(screen.getByTestId("universal-axis-cap-start")).not.toHaveClass(
        "from-black/20",
      );
    });

    it("darkens both fills on a double-sided bar", () => {
      renderWithI18n(<UniversalAxis start={entryA(69)} end={entryB(31)} />);

      expect(screen.getByTestId("universal-axis-fill-start")).toHaveClass(
        "from-black/20",
      );
      expect(screen.getByTestId("universal-axis-fill-end")).toHaveClass(
        "from-black/20",
      );
    });
  });

  describe("given an orientation without a colour", () => {
    it("falls back to the neutral colour", () => {
      renderWithI18n(
        <UniversalAxis
          start={{
            orientation: {
              ...orientationA,
              imageUrl: undefined,
              color: undefined,
            },
            value: 5,
          }}
        />,
      );

      expect(screen.getByTestId("universal-axis-cap-start")).toHaveClass(
        "bg-gi-dark-gray",
      );
      expect(screen.getByTestId("universal-axis-fill-start")).toHaveClass(
        "bg-gi-dark-gray",
        "from-black/20",
      );
      expect(screen.getByTestId("universal-axis-value-start")).toHaveClass(
        "text-gi-dark-gray",
      );
    });
  });

  describe("accessibility", () => {
    it("is exposed as a single image", () => {
      renderWithI18n(
        <UniversalAxis
          start={entryA(69)}
          end={entryB(31)}
          comparison={friendEntry(90)}
        />,
      );

      expect(screen.getAllByRole("img")).toHaveLength(1);
    });

    it("describes orientation names, values and the comparison value", () => {
      renderWithI18n(
        <UniversalAxis
          start={entryA(68.6)}
          end={entryB(31.4)}
          comparison={friendEntry(90)}
        />,
      );

      expect(screen.getByRole("img")).toHaveAccessibleName(
        "Orientation A: 69%, Orientation B: 31%, porównanie z Ania: 90%",
      );
    });

    it("keeps a truncated name complete in the description", () => {
      const longName = "Bardzo długa nazwa orientacji ".repeat(5).trim();

      renderWithI18n(
        <UniversalAxis
          start={{
            orientation: { ...orientationA, name: longName },
            value: 40,
          }}
          showLabels
        />,
      );

      expect(screen.getByRole("img")).toHaveAccessibleName(`${longName}: 40%`);
    });

    it("describes an empty bar", () => {
      renderWithI18n(<UniversalAxis />);

      expect(screen.getByRole("img")).toHaveAccessibleName("Brak wyniku");
    });

    it("exposes no focusable elements", () => {
      const { container } = renderWithI18n(
        <UniversalAxis
          start={entryA(69)}
          end={entryB(31)}
          comparison={friendEntry(90)}
          showLabels
        />,
      );

      expect(
        container.querySelectorAll(
          "a, button, input, select, textarea, [tabindex]",
        ),
      ).toHaveLength(0);
    });
  });

  describe("given invalid input", () => {
    it("renders without throwing", () => {
      expect(() =>
        renderWithI18n(
          <UniversalAxis
            start={entryA(Number.NaN)}
            end={entryB(400)}
            comparison={friendEntry(-50)}
            marker={Number.NaN}
          />,
        ),
      ).not.toThrow();
    });
  });

  describe("on mount", () => {
    it("renders the final state without an entry animation", () => {
      const { container } = renderWithI18n(<UniversalAxis start={entryA(5)} />);

      expect(container.querySelector("[class*='animate']")).toBeNull();
    });
  });

  describe("given an entry without a value", () => {
    it("renders its cap", () => {
      renderWithI18n(<UniversalAxis start={{ orientation: orientationA }} />);

      expect(
        screen.getByTestId("universal-axis-cap-start"),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId("universal-axis-socket"),
      ).not.toBeInTheDocument();
    });

    it("renders its label when labels are on", () => {
      renderWithI18n(
        <UniversalAxis start={{ orientation: orientationA }} showLabels />,
      );

      expect(screen.getByTestId("universal-axis-labels")).toHaveTextContent(
        "Orientation A",
      );
    });

    it("renders no fill and no number for it", () => {
      renderWithI18n(<UniversalAxis start={{ orientation: orientationA }} />);

      expect(
        screen.queryByTestId("universal-axis-fill-start"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("universal-axis-value-start"),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("universal-axis-track")).toHaveTextContent("");
    });

    it("says in the description that its value is missing", () => {
      renderWithI18n(<UniversalAxis start={{ orientation: orientationA }} />);

      expect(
        screen.getByRole("img", { name: "Orientation A: brak wyniku" }),
      ).toBeInTheDocument();
    });
  });

  describe("given a double-sided bar with one entry without a value", () => {
    it("renders both caps", () => {
      renderWithI18n(
        <UniversalAxis
          start={entryA(69)}
          end={{ orientation: orientationB }}
        />,
      );

      expect(
        screen.getByTestId("universal-axis-cap-start"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("universal-axis-cap-end")).toBeInTheDocument();
    });

    it("fills and describes only the side that has a value", () => {
      renderWithI18n(
        <UniversalAxis
          start={entryA(69)}
          end={{ orientation: orientationB }}
        />,
      );

      expect(screen.getByTestId("universal-axis-fill-start")).toHaveStyle({
        width: "69%",
      });
      expect(
        screen.queryByTestId("universal-axis-fill-end"),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("img", {
          name: "Orientation A: 69%, Orientation B: brak wyniku",
        }),
      ).toBeInTheDocument();
    });
  });

  describe("given a comparison and a taker entry without a value", () => {
    it("hatches the whole track", () => {
      renderWithI18n(
        <UniversalAxis
          start={{ orientation: orientationA }}
          comparison={friendEntry(60)}
        />,
      );

      expect(screen.getByTestId("universal-axis-band")).toHaveStyle({
        left: "0%",
        width: "100%",
      });
      expect(
        screen.getByTestId("universal-axis-comparison-image"),
      ).toBeInTheDocument();
    });
  });
});

describe("<UniversalAxis /> - showValues and description", () => {
  describe("given showValues is false on a one-sided bar", () => {
    it("writes no number inside a fill that would fit one", () => {
      renderWithI18n(<UniversalAxis start={entryA(64)} showValues={false} />);

      expect(screen.getByTestId("universal-axis-fill-start")).toHaveStyle({
        width: "64%",
      });
      expect(
        screen.getByTestId("universal-axis-fill-start"),
      ).toBeEmptyDOMElement();
      expect(screen.queryByText(/\d/)).not.toBeInTheDocument();
    });

    it("writes no number after a small fill", () => {
      renderWithI18n(<UniversalAxis start={entryA(5)} showValues={false} />);

      expect(screen.getByTestId("universal-axis-fill-start")).toHaveStyle({
        width: "5%",
      });
      expect(
        screen.queryByTestId("universal-axis-value-start"),
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/\d/)).not.toBeInTheDocument();
    });
  });

  describe("given showValues is false on a double-sided bar", () => {
    it("writes no number on either side", () => {
      renderWithI18n(
        <UniversalAxis
          start={entryA(69)}
          end={entryB(31)}
          showValues={false}
        />,
      );

      expect(
        screen.getByTestId("universal-axis-fill-start"),
      ).toBeEmptyDOMElement();
      expect(
        screen.getByTestId("universal-axis-fill-end"),
      ).toBeEmptyDOMElement();
      expect(screen.queryByTestId(/universal-axis-value/)).toBeNull();
      expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    });
  });

  describe("given showValues is false", () => {
    it("keeps the fills, the caps, the marker and the labels as they are", () => {
      renderWithI18n(
        <UniversalAxis
          start={entryA(140)}
          end={entryB(60)}
          showValues={false}
          showLabels
        />,
      );

      // Values that exceed the track are scaled as they are with numbers.
      expect(screen.getByTestId("universal-axis-fill-start")).toHaveStyle({
        width: "62.5%",
      });
      expect(screen.getByTestId("universal-axis-fill-end")).toHaveStyle({
        width: "37.5%",
      });
      expect(screen.getByTestId("universal-axis-cap-start")).toHaveClass(
        "left-0",
      );
      expect(screen.getByTestId("universal-axis-cap-end")).toHaveClass(
        "right-0",
      );
      expect(
        screen
          .getByTestId("universal-axis-marker")
          .style.getPropertyValue("--axis-position"),
      ).toBe("50%");
      expect(screen.getByText("Orientation A")).toHaveClass("truncate");
      expect(screen.getByText("Orientation B")).toHaveClass("text-right");
    });

    it("keeps the band and the image of a comparison, with no number", () => {
      renderWithI18n(
        <UniversalAxis
          start={entryA(25)}
          comparison={friendEntry(77)}
          showValues={false}
        />,
      );

      expect(screen.getByTestId("universal-axis-band")).toHaveStyle({
        left: "25%",
        width: "52%",
      });
      expect(
        screen.getByTestId("universal-axis-comparison-image"),
      ).toBeInTheDocument();
      expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    });

    it("describes the bar by its names, with no number", () => {
      renderWithI18n(
        <UniversalAxis
          start={entryA(69)}
          end={{ orientation: orientationB }}
          showValues={false}
        />,
      );

      expect(screen.getByRole("img")).toHaveAccessibleName(
        "Orientation A, Orientation B",
      );
    });

    it("describes a comparison by its name, with no number", () => {
      renderWithI18n(
        <UniversalAxis
          start={entryA(69)}
          end={entryB(31)}
          comparison={friendEntry(90)}
          showValues={false}
        />,
      );

      expect(screen.getByRole("img")).toHaveAccessibleName(
        "Orientation A, Orientation B, porównanie z Ania",
      );
    });

    it("leaves out an entry and a comparison that have no name", () => {
      renderWithI18n(
        <UniversalAxis
          start={{
            orientation: { ...orientationA, name: undefined },
            value: 69,
          }}
          end={entryB(31)}
          comparison={{ orientation: { ...friend, name: "  " }, value: 90 }}
          showValues={false}
        />,
      );

      expect(screen.getByRole("img")).toHaveAccessibleName("Orientation B");
    });

    it("falls back to the text of an empty bar when there is no name", () => {
      renderWithI18n(
        <UniversalAxis
          start={{
            orientation: { ...orientationA, name: undefined },
            value: 69,
          }}
          showValues={false}
        />,
      );

      expect(screen.getByRole("img")).toHaveAccessibleName("Brak wyniku");
    });
  });

  describe("given a description", () => {
    it("uses it as the description of the image", () => {
      renderWithI18n(
        <UniversalAxis
          start={entryA(69)}
          end={entryB(31)}
          showValues={false}
          description="„Orientation A” i „Orientation B”: wyższy wynik po stronie „Orientation A”"
        />,
      );

      expect(screen.getAllByRole("img")).toHaveLength(1);
      expect(screen.getByRole("img")).toHaveAccessibleName(
        "„Orientation A” i „Orientation B”: wyższy wynik po stronie „Orientation A”",
      );
    });

    it("still draws the numbers when showValues is not false", () => {
      renderWithI18n(
        <UniversalAxis
          start={entryA(69)}
          end={entryB(31)}
          description="Opis słowny"
        />,
      );

      expect(screen.getByRole("img")).toHaveAccessibleName("Opis słowny");
      expect(screen.getByText("69%")).toBeInTheDocument();
      expect(screen.getByText("31%")).toBeInTheDocument();
    });
  });

  describe("given a blank description", () => {
    it("uses the bar's own description", () => {
      const { unmount } = renderWithI18n(
        <UniversalAxis start={entryA(69)} description="" />,
      );

      expect(screen.getByRole("img")).toHaveAccessibleName(
        "Orientation A: 69%",
      );

      unmount();
      renderWithI18n(
        <UniversalAxis
          start={entryA(69)}
          showValues={false}
          description={" \n "}
        />,
      );

      expect(screen.getByRole("img")).toHaveAccessibleName("Orientation A");
    });
  });

  describe("given neither prop", () => {
    it("draws and describes the bar exactly as before", () => {
      const { container } = renderWithI18n(
        <UniversalAxis
          start={entryA(69)}
          end={entryB(31)}
          comparison={friendEntry(90)}
          showLabels
        />,
      );
      const markup = container.innerHTML;

      // `showValues` on is the same as not passing it.
      renderWithI18n(
        <UniversalAxis
          start={entryA(69)}
          end={entryB(31)}
          comparison={friendEntry(90)}
          showLabels
          showValues
          description={undefined}
        />,
      );

      expect(screen.getAllByRole("img")[1].parentElement?.innerHTML).toBe(
        markup,
      );
      expect(screen.getAllByRole("img")[0]).toHaveAccessibleName(
        "Orientation A: 69%, Orientation B: 31%, porównanie z Ania: 90%",
      );
    });

    it("writes a value inside a fill that fits it and after a small one", () => {
      const { unmount } = renderWithI18n(<UniversalAxis start={entryA(64)} />);

      expect(screen.getByTestId("universal-axis-fill-start")).toHaveTextContent(
        "64%",
      );

      unmount();
      renderWithI18n(<UniversalAxis start={entryA(5)} />);

      expect(
        screen.getByTestId("universal-axis-value-start"),
      ).toHaveTextContent("5%");
    });
  });
});
