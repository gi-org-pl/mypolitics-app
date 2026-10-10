import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Orientation } from "@/types/orientation";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SingleAxisChart } from "./SingleAxisChart";

const radicalism: Orientation = {
  id: "radicalism",
  type: "ideology",
  name: "Radykalizm",
  imageUrl: "https://example.com/radicalism.svg",
  color: "#924747",
};

const friend: Orientation = {
  id: "friend",
  type: "person",
  name: "Ania",
  imageUrl: "https://example.com/ania.png",
  color: "#004554",
};

const LONG_NAME =
  "Radykalizm społeczno-gospodarczy z bardzo długą nazwą autorską";

const getChipLook = () =>
  screen.getByTestId("orientation-chip").getAttribute("data-look");

describe("<SingleAxisChart />", () => {
  describe("given a value at or above the marker", () => {
    it("renders the title chip emphasised", () => {
      renderWithI18n(<SingleAxisChart orientation={radicalism} value={69} />);

      const chip = screen.getByTestId("orientation-chip");

      expect(getChipLook()).toBe("emphasised");
      expect(chip.style.getPropertyValue("--chip-color")).toBe("#924747");
      expect(screen.getByTestId("module-wrapper-title-slot")).toContainElement(
        chip,
      );
    });

    it("renders the title chip emphasised exactly at the marker", () => {
      renderWithI18n(<SingleAxisChart orientation={radicalism} value={50} />);

      expect(getChipLook()).toBe("emphasised");
    });
  });

  describe("given a value below the marker", () => {
    it("renders the title chip quiet", () => {
      renderWithI18n(<SingleAxisChart orientation={radicalism} value={40} />);

      expect(getChipLook()).toBe("quiet");
      expect(
        screen
          .getByTestId("orientation-chip")
          .style.getPropertyValue("--chip-color"),
      ).toBe("");
    });

    it("stays quiet just below the marker", () => {
      renderWithI18n(<SingleAxisChart orientation={radicalism} value={49.9} />);

      expect(getChipLook()).toBe("quiet");
    });
  });

  describe("given marker is false", () => {
    it("keeps the emphasis line at 50", () => {
      const { unmount } = renderWithI18n(
        <SingleAxisChart orientation={radicalism} value={49} marker={false} />,
      );

      expect(getChipLook()).toBe("quiet");

      unmount();
      renderWithI18n(
        <SingleAxisChart orientation={radicalism} value={50} marker={false} />,
      );

      expect(getChipLook()).toBe("emphasised");
    });

    it("renders the bar without a marker", () => {
      renderWithI18n(
        <SingleAxisChart orientation={radicalism} value={69} marker={false} />,
      );

      expect(
        screen.queryByTestId("universal-axis-marker"),
      ).not.toBeInTheDocument();
    });
  });

  describe("given a custom marker", () => {
    it("moves the emphasis line with it", () => {
      const { unmount } = renderWithI18n(
        <SingleAxisChart orientation={radicalism} value={69} marker={75} />,
      );

      expect(getChipLook()).toBe("quiet");
      expect(
        screen
          .getByTestId("universal-axis-marker")
          .style.getPropertyValue("--axis-position"),
      ).toBe("75%");

      unmount();
      renderWithI18n(
        <SingleAxisChart orientation={radicalism} value={40} marker={25} />,
      );

      expect(getChipLook()).toBe("emphasised");
    });

    it("clamps a marker outside 0-100 and moves the emphasis line with it", () => {
      const { unmount } = renderWithI18n(
        <SingleAxisChart orientation={radicalism} value={99} marker={140} />,
      );

      expect(getChipLook()).toBe("quiet");

      unmount();
      renderWithI18n(
        <SingleAxisChart orientation={radicalism} value={0} marker={-20} />,
      );

      expect(getChipLook()).toBe("emphasised");
    });

    it("falls back to 50 for a marker that is not a number", () => {
      renderWithI18n(
        <SingleAxisChart
          orientation={radicalism}
          value={60}
          marker={Number.NaN}
        />,
      );

      expect(getChipLook()).toBe("emphasised");
    });
  });

  describe("given a value", () => {
    it("renders a one-sided bar from the start cap", () => {
      renderWithI18n(<SingleAxisChart orientation={radicalism} value={40} />);

      expect(
        screen.getByTestId("universal-axis-cap-start"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("universal-axis-fill-start")).toHaveStyle({
        width: "40%",
      });
      expect(
        screen.queryByTestId("universal-axis-cap-end"),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("img", { name: "Radykalizm: 40%" }),
      ).toBeInTheDocument();
    });

    it("renders the bar without labels", () => {
      renderWithI18n(<SingleAxisChart orientation={radicalism} value={40} />);

      expect(
        screen.queryByTestId("universal-axis-labels"),
      ).not.toBeInTheDocument();
    });

    it("renders the marker at 50 by default", () => {
      renderWithI18n(<SingleAxisChart orientation={radicalism} value={40} />);

      expect(
        screen
          .getByTestId("universal-axis-marker")
          .style.getPropertyValue("--axis-position"),
      ).toBe("50%");
    });
  });

  describe("given a value of zero", () => {
    it("renders the cap and an unfilled track with a quiet title", () => {
      renderWithI18n(<SingleAxisChart orientation={radicalism} value={0} />);

      expect(
        screen.getByTestId("universal-axis-cap-start"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("universal-axis-fill-start")).toHaveStyle({
        width: "0%",
      });
      expect(screen.getByTestId("universal-axis-track")).toHaveTextContent("");
      expect(getChipLook()).toBe("quiet");
    });
  });

  describe("given no value", () => {
    it("renders an empty track and a quiet title", () => {
      renderWithI18n(<SingleAxisChart orientation={radicalism} />);

      expect(screen.getByTestId("universal-axis-track")).toBeInTheDocument();
      expect(
        screen.queryByTestId("universal-axis-cap-start"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("universal-axis-fill-start"),
      ).not.toBeInTheDocument();
      expect(getChipLook()).toBe("quiet");
      expect(
        screen.getByRole("region", { name: "Radykalizm" }),
      ).toBeInTheDocument();
    });
  });

  describe("given a value that is not a number", () => {
    it.each([
      Number.NaN,
      "69" as unknown as number,
      null as unknown as number,
    ])("treats %j as absent", (value) => {
      renderWithI18n(
        <SingleAxisChart orientation={radicalism} value={value} />,
      );

      expect(
        screen.queryByTestId("universal-axis-cap-start"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("universal-axis-fill-start"),
      ).not.toBeInTheDocument();
      expect(getChipLook()).toBe("quiet");
    });
  });

  describe("given a value outside 0-100", () => {
    it("uses the clamped value for the title emphasis", () => {
      const { unmount } = renderWithI18n(
        <SingleAxisChart orientation={radicalism} value={140} marker={100} />,
      );

      expect(getChipLook()).toBe("emphasised");
      expect(screen.getByTestId("universal-axis-fill-start")).toHaveStyle({
        width: "100%",
      });

      unmount();
      renderWithI18n(
        <SingleAxisChart orientation={radicalism} value={-20} marker={0} />,
      );

      expect(getChipLook()).toBe("emphasised");
      expect(screen.getByTestId("universal-axis-fill-start")).toHaveStyle({
        width: "0%",
      });
    });
  });

  describe("given a comparison", () => {
    it("passes it to the bar", () => {
      renderWithI18n(
        <SingleAxisChart
          orientation={radicalism}
          value={69}
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
          name: "Radykalizm: 69%, porównanie z Ania: 90%",
        }),
      ).toBeInTheDocument();
    });

    it("keeps the value in the fill, next to the band", () => {
      renderWithI18n(
        <SingleAxisChart
          orientation={radicalism}
          value={69}
          comparison={{ orientation: friend, value: 90 }}
        />,
      );

      expect(screen.getByTestId("universal-axis-fill-start")).toHaveTextContent(
        "69%",
      );
    });

    it("passes it to the bar when the value is absent", () => {
      renderWithI18n(
        <SingleAxisChart
          orientation={radicalism}
          comparison={{ orientation: friend, value: 60 }}
        />,
      );

      expect(screen.getByTestId("universal-axis-band")).toHaveStyle({
        left: "0%",
        width: "100%",
      });
      expect(
        screen.queryByTestId("universal-axis-cap-start"),
      ).not.toBeInTheDocument();
    });
  });

  describe("given an orientation without an image", () => {
    it("renders the chip with the name alone", () => {
      renderWithI18n(
        <SingleAxisChart
          orientation={{ ...radicalism, imageUrl: undefined }}
          value={69}
        />,
      );

      expect(screen.getByTestId("orientation-chip")).toHaveTextContent(
        "Radykalizm",
      );
      expect(
        screen.queryByTestId("orientation-chip-image"),
      ).not.toBeInTheDocument();
    });
  });

  describe("given an orientation without a name", () => {
    it.each([
      "",
      "   ",
      undefined,
    ])("renders the chip with the image alone for %j", (name) => {
      renderWithI18n(
        <SingleAxisChart orientation={{ ...radicalism, name }} value={69} />,
      );

      expect(screen.getByTestId("orientation-chip")).toHaveTextContent("");
      expect(screen.getByTestId("orientation-chip-image")).toBeInTheDocument();
    });

    it("passes no title when there is no image either", () => {
      renderWithI18n(
        <SingleAxisChart
          orientation={{ ...radicalism, name: "", imageUrl: undefined }}
          value={69}
        />,
      );

      expect(screen.queryByTestId("orientation-chip")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("module-wrapper-title-slot"),
      ).not.toBeInTheDocument();
      expect(
        screen.getByTestId("universal-axis-fill-start"),
      ).toBeInTheDocument();
    });
  });

  describe("given an orientation without a colour", () => {
    it("uses the neutral fallback on the chip and on the bar", () => {
      renderWithI18n(
        <SingleAxisChart
          orientation={{ ...radicalism, color: undefined }}
          value={69}
        />,
      );

      expect(screen.getByTestId("orientation-chip")).toHaveClass(
        "bg-gi-dark-gray",
      );
      expect(screen.getByTestId("universal-axis-fill-start")).toHaveClass(
        "bg-gi-dark-gray",
      );
    });

    it("drops an unsafe colour on the chip and on the bar", () => {
      renderWithI18n(
        <SingleAxisChart
          orientation={{ ...radicalism, color: "red; background: url(x)" }}
          value={69}
        />,
      );

      expect(
        screen
          .getByTestId("orientation-chip")
          .style.getPropertyValue("--chip-color"),
      ).toBe("");
      expect(
        screen
          .getByTestId("universal-axis-fill-start")
          .style.getPropertyValue("--axis-color"),
      ).toBe("");
    });
  });

  describe("given a long name", () => {
    it("truncates the title and keeps the full name for assistive technology", () => {
      renderWithI18n(
        <SingleAxisChart
          orientation={{ ...radicalism, name: LONG_NAME }}
          value={69}
        />,
      );

      expect(screen.getByText(LONG_NAME)).toHaveClass("truncate");
      expect(
        screen.getByRole("region", { name: LONG_NAME }),
      ).toBeInTheDocument();
    });
  });

  describe("given handlers", () => {
    it("passes onStatsClick and onInfoClick to the wrapper", () => {
      const handleStatsClick = vi.fn();
      const handleInfoClick = vi.fn();
      renderWithI18n(
        <SingleAxisChart
          orientation={radicalism}
          value={69}
          onStatsClick={handleStatsClick}
          onInfoClick={handleInfoClick}
        />,
      );

      fireEvent.click(
        screen.getByRole("button", { name: "Statystyki: Radykalizm" }),
      );
      fireEvent.click(
        screen.getByRole("button", { name: "Informacje: Radykalizm" }),
      );

      expect(handleStatsClick).toHaveBeenCalledTimes(1);
      expect(handleInfoClick).toHaveBeenCalledTimes(1);
    });

    it("renders no buttons without handlers", () => {
      renderWithI18n(<SingleAxisChart orientation={radicalism} value={69} />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("names the card after the orientation", () => {
      renderWithI18n(<SingleAxisChart orientation={radicalism} value={69} />);

      expect(
        screen.getByRole("region", { name: "Radykalizm" }),
      ).toBeInTheDocument();
    });
  });
});
