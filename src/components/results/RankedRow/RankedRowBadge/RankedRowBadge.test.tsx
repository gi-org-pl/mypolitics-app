import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RankedRowBadge } from "./RankedRowBadge";

const ICON_URL = "https://example.org/verified.svg";

describe("<RankedRowBadge />", () => {
  describe("given an icon alone", () => {
    it("renders the icon with the label as its text name", () => {
      render(
        <RankedRowBadge
          badge={{ iconUrl: ICON_URL, label: "Zweryfikowany" }}
        />,
      );

      const icon = screen.getByRole("img", { name: "Zweryfikowany" });

      expect(icon).toHaveAttribute("src", ICON_URL);
      expect(screen.getByTestId("ranked-row-badge")).toContainElement(icon);
    });

    it("renders the icon as decoration when there is no label", () => {
      render(<RankedRowBadge badge={{ iconUrl: ICON_URL }} />);

      expect(
        screen.getByTestId("ranked-row-badge").querySelector("img"),
      ).toHaveAttribute("alt", "");
    });
  });

  describe("given an icon and a text", () => {
    it("renders the text with a decorative icon and ignores the label", () => {
      render(
        <RankedRowBadge
          badge={{ iconUrl: ICON_URL, text: "Oficjalne", label: "Ignored" }}
        />,
      );

      const badge = screen.getByTestId("ranked-row-badge");

      expect(badge).toHaveTextContent("Oficjalne");
      expect(badge).not.toHaveTextContent("Ignored");
      expect(badge.querySelector("img")).toHaveAttribute("src", ICON_URL);
      expect(badge.querySelector("img")).toHaveAttribute("alt", "");
    });
  });

  describe("given a text alone", () => {
    it("renders the text with no icon", () => {
      render(<RankedRowBadge badge={{ text: " Oficjalne\n" }} />);

      const badge = screen.getByTestId("ranked-row-badge");

      expect(badge).toHaveTextContent("Oficjalne");
      expect(badge.querySelector("img")).not.toBeInTheDocument();
    });
  });

  describe("given neither an icon nor a text", () => {
    it("renders nothing", () => {
      const { container, rerender } = render(
        <RankedRowBadge badge={{ label: "Zweryfikowany", text: "   " }} />,
      );

      expect(container).toBeEmptyDOMElement();

      rerender(<RankedRowBadge />);

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("given any badge", () => {
    it("keeps its width and is not interactive", () => {
      render(
        <RankedRowBadge badge={{ iconUrl: ICON_URL, text: "Oficjalne" }} />,
      );

      const badge = screen.getByTestId("ranked-row-badge");

      expect(badge).toHaveClass("shrink-0");
      expect(badge.querySelector("button, a, [tabindex]")).toBeNull();
    });
  });
});
