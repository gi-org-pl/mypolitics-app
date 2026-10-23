import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GLYPH_ADDRESS, PORTRAIT_ADDRESS } from "@/constants/image.fixtures";
import {
  RING_IMAGE_CLASS_NAME,
  RING_TRACK_CLASS_NAME,
} from "../ResultsHeader.constants";
import { ResultsHeaderRing } from "./ResultsHeaderRing";

const IMAGE_URL = "https://example.org/liberalism.png";

describe("<ResultsHeaderRing />", () => {
  describe("given a confidence", () => {
    it("draws an arc as long as the confidence", () => {
      render(<ResultsHeaderRing confidence={86.6} band="match" />);

      const arc = screen.getByTestId("results-header-ring-arc");

      expect(arc).toHaveAttribute("pathLength", "100");
      expect(arc).toHaveAttribute("stroke-dasharray", "86.6 100");
    });

    it("draws the track over the rest of the circle, running on under both ends of the arc", () => {
      render(<ResultsHeaderRing confidence={75} band="partial" />);

      const track = screen.getByTestId("results-header-ring-track");

      expect(track).toHaveAttribute("pathLength", "100");
      expect(track).toHaveAttribute("stroke-dasharray", "1 73 26");
      expect(track).toHaveAttribute("r", "30");
      expect(track).toHaveAttribute("stroke-width", "5");
    });

    it("draws the track in an opaque colour, without a fill", () => {
      render(<ResultsHeaderRing confidence={80} band="match" />);

      const track = screen.getByTestId("results-header-ring-track");

      expect(track).toHaveClass(...RING_TRACK_CLASS_NAME.split(" "));
      expect(track).not.toHaveClass("opacity-10");
      expect(RING_TRACK_CLASS_NAME).toContain("fill-none");
      expect(RING_TRACK_CLASS_NAME).toContain("color-mix");
    });

    it("hides the decorative ring from assistive technology", () => {
      render(<ResultsHeaderRing confidence={80} band="match" />);

      expect(screen.getByTestId("results-header-ring")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });
  });

  describe("given the match band", () => {
    it("draws the ring in the match colour", () => {
      render(<ResultsHeaderRing confidence={80} band="match" />);

      expect(
        screen.getByTestId("results-header-ring").parentElement,
      ).toHaveClass("text-gi-green");
    });
  });

  describe("given the partial band", () => {
    it("draws the ring in the partial colour", () => {
      render(<ResultsHeaderRing confidence={75} band="partial" />);

      expect(
        screen.getByTestId("results-header-ring").parentElement,
      ).toHaveClass("text-gi-orange");
    });
  });

  describe("given an image", () => {
    it("renders it inside the ring", () => {
      render(
        <ResultsHeaderRing confidence={80} band="match" imageUrl={IMAGE_URL} />,
      );

      expect(
        screen.getByTestId("results-header-image").querySelector("img"),
      ).toHaveAttribute("src", IMAGE_URL);
      expect(
        screen.queryByTestId("results-header-image-placeholder"),
      ).not.toBeInTheDocument();
    });

    it("draws the dark base only while it draws the image", () => {
      render(
        <ResultsHeaderRing confidence={80} band="match" imageUrl={IMAGE_URL} />,
      );

      expect(screen.getByTestId("results-header-image")).toHaveClass(
        "bg-gi-dark-ash",
        "has-[>img]:bg-gi-dark-primary",
      );
    });

    it("looks like the placeholder when the image fails to load", () => {
      render(
        <ResultsHeaderRing confidence={80} band="match" imageUrl={IMAGE_URL} />,
      );

      const image = screen.getByTestId("results-header-image");

      fireEvent.error(image.querySelector("img") as HTMLImageElement);

      expect(image.querySelector("img")).toBeNull();
      expect(image).toHaveClass(
        "bg-gi-dark-ash",
        "[&>[aria-hidden=true]]:hidden",
      );
      expect(
        image.querySelectorAll(":scope > [aria-hidden=true]"),
      ).toHaveLength(image.children.length);
    });

    it("draws the ring over the edge of the image", () => {
      render(
        <ResultsHeaderRing confidence={80} band="match" imageUrl={IMAGE_URL} />,
      );

      const image = screen.getByTestId("results-header-image");
      const ring = screen.getByTestId("results-header-ring");

      expect(image).toHaveClass(...RING_IMAGE_CLASS_NAME.split(" "));
      expect(image).toHaveClass("inset-[4px]", "size-[57px]", "p-px");
      expect(
        image.compareDocumentPosition(ring) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });
  });

  describe("given no image", () => {
    it("renders a neutral placeholder inside the ring", () => {
      render(<ResultsHeaderRing confidence={80} band="match" />);

      expect(
        screen.getByTestId("results-header-image-placeholder").parentElement,
      ).toContainElement(screen.getByTestId("results-header-ring"));
      expect(
        screen.queryByTestId("results-header-image"),
      ).not.toBeInTheDocument();
    });

    it("draws the ring over the edge of the placeholder", () => {
      render(<ResultsHeaderRing confidence={80} band="match" />);

      const placeholder = screen.getByTestId(
        "results-header-image-placeholder",
      );

      expect(placeholder).toHaveClass(...RING_IMAGE_CLASS_NAME.split(" "));
      expect(
        placeholder.compareDocumentPosition(
          screen.getByTestId("results-header-ring"),
        ) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });
  });
});

describe("<ResultsHeaderRing />", () => {
  describe("given an image that is a glyph", () => {
    it("draws it whole inside the ring, at its own size", () => {
      render(
        <ResultsHeaderRing
          confidence={60}
          band="partial"
          imageUrl={GLYPH_ADDRESS}
        />,
      );

      expect(screen.getByTestId("results-header-image")).toHaveClass(
        "[&>img]:object-scale-down",
      );
    });
  });

  describe("given an image that is a picture", () => {
    it("lets it cover the inside of the ring", () => {
      render(
        <ResultsHeaderRing
          confidence={60}
          band="partial"
          imageUrl={PORTRAIT_ADDRESS}
        />,
      );

      expect(screen.getByTestId("results-header-image")).not.toHaveClass(
        "[&>img]:object-scale-down",
      );
    });
  });

  describe("given a confidence below a partial match", () => {
    it("draws the ring in the colour of that band", () => {
      const { container } = render(
        <ResultsHeaderRing confidence={44} band="none" />,
      );

      expect(container.firstElementChild).toHaveClass("text-gi-red");
      expect(screen.getByTestId("results-header-ring-arc")).toHaveAttribute(
        "stroke-dasharray",
        "44 100",
      );
    });
  });
});
