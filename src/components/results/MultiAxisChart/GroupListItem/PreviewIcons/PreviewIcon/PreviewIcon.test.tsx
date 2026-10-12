import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

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
      expect(getImage(container)).toHaveClass("size-4", "brightness-0");
      expect(container.firstElementChild).toHaveClass(
        "size-4",
        "rounded-full",
        "bg-white",
      );
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
