import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createOrientation } from "@/utils/vitest/createOrientation";

import { OrientationChip } from "./OrientationChip";

const IMAGE_URL = "https://example.com/radicalism.svg";
const LONG_NAME =
  "Radykalizm społeczno-gospodarczy z bardzo długą nazwą autorską";

describe("<OrientationChip />", () => {
  describe("given no look", () => {
    it("renders emphasised", () => {
      render(<OrientationChip name="Radykalizm" color="#924747" />);

      expect(screen.getByTestId("orientation-chip")).toHaveAttribute(
        "data-look",
        "emphasised",
      );
    });
  });

  describe("given the emphasised look", () => {
    it("fills the chip with the orientation colour through a custom property", () => {
      render(
        <OrientationChip
          name="Radykalizm"
          imageUrl={IMAGE_URL}
          color="#924747"
          look="emphasised"
        />,
      );

      const chip = screen.getByTestId("orientation-chip");

      expect(chip.style.getPropertyValue("--chip-color")).toBe("#924747");
      expect(chip).toHaveClass("bg-(--chip-color)", "text-white");
      expect(chip).not.toHaveClass("border");
    });

    it("renders the image untouched next to the name", () => {
      render(
        <OrientationChip
          name="Radykalizm"
          imageUrl={IMAGE_URL}
          color="#924747"
        />,
      );

      const image = screen.getByTestId("orientation-chip-image");

      expect(image).toHaveAttribute("src", IMAGE_URL);
      expect(image).toHaveAttribute("alt", "");
      expect(image).not.toHaveClass("brightness-0");
      expect(screen.getByText("Radykalizm")).toBeInTheDocument();
    });

    it("falls back to the neutral fill without a colour", () => {
      render(<OrientationChip name="Radykalizm" />);

      const chip = screen.getByTestId("orientation-chip");

      expect(chip.style.getPropertyValue("--chip-color")).toBe("");
      expect(chip).toHaveClass("bg-gi-dark-gray", "text-white");
    });

    it("falls back to the neutral fill for an unsafe colour", () => {
      render(
        <OrientationChip name="Radykalizm" color="red; background: url(x)" />,
      );

      const chip = screen.getByTestId("orientation-chip");

      expect(chip.style.getPropertyValue("--chip-color")).toBe("");
      expect(chip).toHaveClass("bg-gi-dark-gray");
      expect(chip).not.toHaveClass("bg-(--chip-color)");
    });
  });

  describe("given the quiet look", () => {
    it("outlines the chip and mutes its content", () => {
      render(
        <OrientationChip
          name="Radykalizm"
          imageUrl={IMAGE_URL}
          color="#924747"
          look="quiet"
        />,
      );

      const chip = screen.getByTestId("orientation-chip");

      expect(chip).toHaveClass("border", "border-gi-ash", "text-gi-dark-ash");
      expect(chip).not.toHaveClass("bg-(--chip-color)", "bg-gi-dark-gray");
      expect(screen.getByTestId("orientation-chip-image")).toHaveClass(
        "brightness-0",
        "opacity-20",
      );
    });

    it("does not apply the orientation colour", () => {
      render(
        <OrientationChip name="Radykalizm" color="#924747" look="quiet" />,
      );

      expect(
        screen
          .getByTestId("orientation-chip")
          .style.getPropertyValue("--chip-color"),
      ).toBe("");
    });
  });

  describe("given the neutral look", () => {
    it("renders the name alone, with no image and no colour", () => {
      render(
        <OrientationChip
          name="Liberalizm / Konserwatyzm"
          imageUrl={IMAGE_URL}
          color="#924747"
          look="neutral"
        />,
      );

      const chip = screen.getByTestId("orientation-chip");

      expect(chip).toHaveTextContent("Liberalizm / Konserwatyzm");
      expect(chip).toHaveClass("border", "border-gi-ash", "text-gi-primary");
      expect(chip).not.toHaveClass("bg-(--chip-color)", "bg-gi-dark-gray");
      expect(chip.style.getPropertyValue("--chip-color")).toBe("");
      expect(
        screen.queryByTestId("orientation-chip-image"),
      ).not.toBeInTheDocument();
    });

    it("renders nothing without a name, even with an image", () => {
      const { container } = render(
        <OrientationChip imageUrl={IMAGE_URL} look="neutral" />,
      );

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("given no image", () => {
    it("renders the name alone", () => {
      render(<OrientationChip name="Radykalizm" color="#924747" />);

      expect(screen.getByText("Radykalizm")).toBeInTheDocument();
      expect(
        screen.queryByTestId("orientation-chip-image"),
      ).not.toBeInTheDocument();
    });
  });

  describe("given an image that fails to load", () => {
    it("renders the name alone, as without an image", () => {
      render(
        <OrientationChip
          name="Radykalizm"
          imageUrl={IMAGE_URL}
          color="#924747"
        />,
      );

      fireEvent.error(screen.getByTestId("orientation-chip-image"));

      expect(screen.getByText("Radykalizm")).toBeInTheDocument();
      expect(
        screen.queryByTestId("orientation-chip-image"),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("orientation-chip").children).toHaveLength(1);
    });

    it("does so in the quiet look as well", () => {
      render(
        <OrientationChip name="Radykalizm" imageUrl={IMAGE_URL} look="quiet" />,
      );

      fireEvent.error(screen.getByTestId("orientation-chip-image"));

      expect(screen.getByText("Radykalizm")).toBeInTheDocument();
      expect(
        screen.queryByTestId("orientation-chip-image"),
      ).not.toBeInTheDocument();
    });

    it("renders nothing when there is no name either", () => {
      const { container } = render(<OrientationChip imageUrl={IMAGE_URL} />);

      fireEvent.error(screen.getByTestId("orientation-chip-image"));

      expect(container).toBeEmptyDOMElement();
    });

    it("draws an image again when the address changes", () => {
      const { rerender } = render(
        <OrientationChip name="Radykalizm" imageUrl={IMAGE_URL} />,
      );

      fireEvent.error(screen.getByTestId("orientation-chip-image"));
      rerender(
        <OrientationChip
          name="Radykalizm"
          imageUrl="https://example.com/other.svg"
        />,
      );

      expect(screen.getByTestId("orientation-chip-image")).toHaveAttribute(
        "src",
        "https://example.com/other.svg",
      );
    });
  });

  describe("given no name", () => {
    it.each([
      undefined,
      "",
      "   ",
    ])("renders the image alone for %j", (name) => {
      render(<OrientationChip name={name} imageUrl={IMAGE_URL} />);

      const chip = screen.getByTestId("orientation-chip");

      expect(chip).toHaveTextContent("");
      expect(chip.querySelector("span")).toBeNull();
      expect(screen.getByTestId("orientation-chip-image")).toBeInTheDocument();
    });

    it("renders nothing when there is no image either", () => {
      const { container } = render(<OrientationChip name=" " />);

      expect(container).toBeEmptyDOMElement();
    });

    it("renders nothing for a name that is not a string", () => {
      const { container } = render(
        <OrientationChip name={42 as unknown as string} />,
      );

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("given an orientation without a name", () => {
    it("shows the image alone", () => {
      const { name, imageUrl, color } = createOrientation(
        "radicalism",
        undefined,
        {
          imageUrl: IMAGE_URL,
          color: "#47924c",
        },
      );

      render(<OrientationChip name={name} imageUrl={imageUrl} color={color} />);

      const chip = screen.getByTestId("orientation-chip");

      expect(chip).toHaveTextContent("");
      expect(chip.querySelector("span")).toBeNull();
      expect(screen.getByTestId("orientation-chip-image")).toHaveAttribute(
        "src",
        IMAGE_URL,
      );
    });
  });

  describe("given a long name", () => {
    it("truncates it and keeps the full text for assistive technology", () => {
      render(<OrientationChip name={LONG_NAME} />);

      const name = screen.getByText(LONG_NAME);

      expect(name).toHaveClass("truncate");
      expect(screen.getByTestId("orientation-chip")).toHaveClass(
        "w-full",
        "min-w-0",
      );
    });
  });

  describe("given a name with line breaks", () => {
    it("collapses it into one line", () => {
      render(<OrientationChip name={"  Radykalizm\n\nspołeczny "} />);

      expect(screen.getByTestId("orientation-chip").textContent).toBe(
        "Radykalizm społeczny",
      );
    });
  });

  describe("interaction", () => {
    it("is never interactive", () => {
      render(
        <OrientationChip
          name="Radykalizm"
          imageUrl={IMAGE_URL}
          color="#924747"
        />,
      );

      const chip = screen.getByTestId("orientation-chip");

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(chip).not.toHaveAttribute("tabindex");
    });
  });
});
