import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GLYPH_ADDRESS, PORTRAIT_ADDRESS } from "@/constants/image.fixtures";

import { PreviewIcon } from "./PreviewIcon";

const ICON_URL = "https://example.com/force-start.svg";
const OTHER_ICON_URL = "https://example.com/faith-start.svg";

const getImage = (container: HTMLElement) =>
  container.querySelector("img") as HTMLImageElement;

describe("<PreviewIcon />", () => {
  describe("given the address of an icon", () => {
    it("renders the icon as decoration on a small white disc", () => {
      const { container } = render(<PreviewIcon imageUrl={ICON_URL} />);

      expect(getImage(container)).toHaveAttribute("src", ICON_URL);
      expect(getImage(container)).toHaveAttribute("alt", "");
      expect(getImage(container)).toHaveClass("brightness-0");
      expect(container.firstElementChild).toHaveClass(
        "size-4",
        "rounded-full",
        "bg-white",
        "overflow-hidden",
      );
    });

    // The image is laid out as on the 32 px cap of a bar and drawn at half
    // scale, so it takes the same share of the 16 px disc as of the cap.
    it("draws the image as it stands on the cap of its bar, at half the size", () => {
      const { container } = render(<PreviewIcon imageUrl={ICON_URL} />);

      expect(getImage(container)).toHaveClass(
        "size-8",
        "max-w-none",
        "origin-top-left",
        "scale-50",
      );
    });
  });

  describe("given an icon that is a glyph", () => {
    it("draws it whole, at half its own size, instead of covering the disc with it", () => {
      const { container } = render(<PreviewIcon imageUrl={GLYPH_ADDRESS} />);

      expect(getImage(container)).toHaveClass("object-scale-down");
      expect(getImage(container)).not.toHaveClass("object-cover");
    });
  });

  describe("given an icon that is a picture", () => {
    it("lets it cover the disc", () => {
      const { container } = render(<PreviewIcon imageUrl={PORTRAIT_ADDRESS} />);

      expect(getImage(container)).toHaveClass("object-cover");
      expect(getImage(container)).not.toHaveClass("object-scale-down");
    });
  });

  describe("when the icon fails to load", () => {
    it("renders nothing, not even the disc", () => {
      const { container } = render(<PreviewIcon imageUrl={ICON_URL} />);

      fireEvent.error(getImage(container));

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("when the address changes after a failure", () => {
    it("tries the new icon", () => {
      const { container, rerender } = render(
        <PreviewIcon imageUrl={ICON_URL} />,
      );

      fireEvent.error(getImage(container));
      rerender(<PreviewIcon imageUrl={OTHER_ICON_URL} />);

      expect(getImage(container)).toHaveAttribute("src", OTHER_ICON_URL);
    });
  });
});
