import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HATCH_CLASS_NAME } from "@/constants/hatch";
import type { NolanPosition } from "@/types/results";
import { createOrientation } from "@/utils/vitest/createOrientation";

import { OrientationMarker } from "./OrientationMarker";

const at = (x: number, y: number) => ({ x, y }) as NolanPosition;
const friend = createOrientation("friend", "Rafał", {
  type: "person",
  imageUrl: "https://example.com/friend.png",
});

const getDisc = () => screen.getByTestId("nolan-chart-comparison");
const getImage = () => screen.getByTestId("nolan-chart-comparison-image");

describe("<OrientationMarker />", () => {
  it("renders the image at the position, on the shared hatching", () => {
    render(
      <OrientationMarker orientation={friend} position={at(-0.16, -0.36)} />,
    );

    expect(getDisc().style.getPropertyValue("--nolan-x")).toBe("42%");
    expect(getDisc().style.getPropertyValue("--nolan-y")).toBe("68%");
    expect(getDisc()).toHaveClass(...HATCH_CLASS_NAME.split(" "));
    expect(getImage().querySelector("img")).toHaveAttribute(
      "src",
      friend.imageUrl,
    );
  });

  it("keeps the image fully on the map at an edge or a corner", () => {
    render(<OrientationMarker orientation={friend} position={at(1, 1)} />);

    expect(getDisc().style.getPropertyValue("--nolan-x")).toBe("100%");
    expect(getDisc().style.getPropertyValue("--nolan-y")).toBe("0%");
    expect(getDisc()).toHaveClass(
      "left-[clamp(14px,var(--nolan-x),calc(100%-14px))]",
      "top-[clamp(14px,var(--nolan-y),calc(100%-14px))]",
    );
  });

  it("clips the hatched disc to the map's rounded corners", () => {
    render(<OrientationMarker orientation={friend} position={at(1, 1)} />);

    expect(getDisc().parentElement).toHaveClass(
      "absolute",
      "inset-0",
      "overflow-hidden",
      "rounded-xl",
    );
  });

  describe("given an orientation without an image", () => {
    it("renders a neutral placeholder", () => {
      render(
        <OrientationMarker
          orientation={{ id: "friend", type: "person", name: "Rafał" }}
          position={at(0, 0)}
        />,
      );

      expect(getImage().querySelector("img")).toBeNull();
      expect(getImage()).toHaveClass("bg-gi-dark-gray");
    });

    it("does not throw without an orientation", () => {
      render(<OrientationMarker position={at(0, 0)} />);

      expect(getImage()).toHaveClass("bg-gi-dark-gray");
    });
  });

  describe("given an orientation colour", () => {
    it("applies a safe one behind the image through a custom property", () => {
      render(
        <OrientationMarker
          orientation={{ ...friend, color: "#123456" }}
          position={at(0, 0)}
        />,
      );

      expect(getImage()).toHaveClass("bg-(--nolan-color)");
      expect(getImage().style.getPropertyValue("--nolan-color")).toBe(
        "#123456",
      );
    });

    it("ignores an unsafe one", () => {
      render(
        <OrientationMarker
          orientation={{
            id: "friend",
            type: "person",
            name: "Rafał",
            color: "url(x)",
          }}
          position={at(0, 0)}
        />,
      );

      expect(getImage()).toHaveClass("bg-gi-dark-gray");
      expect(getImage().style.getPropertyValue("--nolan-color")).toBe("");
    });
  });
});
