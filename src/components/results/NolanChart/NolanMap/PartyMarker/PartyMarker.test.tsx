import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HATCH_CLASS_NAME } from "@/constants/hatch";

import type { NolanPosition } from "../../NolanChart.types";
import { PartyMarker } from "./PartyMarker";

const at = (x: number, y: number) => ({ x, y }) as NolanPosition;
const friend = {
  id: "friend",
  name: "Rafał",
  imageUrl: "https://example.com/friend.png",
};

const getDisc = () => screen.getByTestId("nolan-chart-comparison");
const getImage = () => screen.getByTestId("nolan-chart-comparison-image");

describe("<PartyMarker />", () => {
  it("renders the image at the position, on the shared hatching", () => {
    render(<PartyMarker party={friend} position={at(-0.16, -0.36)} />);

    expect(getDisc().style.getPropertyValue("--nolan-x")).toBe("42%");
    expect(getDisc().style.getPropertyValue("--nolan-y")).toBe("68%");
    expect(getDisc()).toHaveClass(...HATCH_CLASS_NAME.split(" "));
    expect(getImage().querySelector("img")).toHaveAttribute(
      "src",
      friend.imageUrl,
    );
  });

  it("keeps the image fully on the map at an edge or a corner", () => {
    render(<PartyMarker party={friend} position={at(1, 1)} />);

    expect(getDisc().style.getPropertyValue("--nolan-x")).toBe("100%");
    expect(getDisc().style.getPropertyValue("--nolan-y")).toBe("0%");
    expect(getDisc()).toHaveClass(
      "left-[clamp(14px,var(--nolan-x),calc(100%-14px))]",
      "top-[clamp(14px,var(--nolan-y),calc(100%-14px))]",
    );
  });

  it("clips the hatched disc to the map's rounded corners", () => {
    render(<PartyMarker party={friend} position={at(1, 1)} />);

    expect(getDisc().parentElement).toHaveClass(
      "absolute",
      "inset-0",
      "overflow-hidden",
      "rounded-xl",
    );
  });

  describe("given a party without an image", () => {
    it("renders a neutral placeholder", () => {
      render(
        <PartyMarker
          party={{ id: "friend", name: "Rafał" }}
          position={at(0, 0)}
        />,
      );

      expect(getImage().querySelector("img")).toBeNull();
      expect(getImage()).toHaveClass("bg-gi-dark-gray");
    });

    it("does not throw without a party", () => {
      render(<PartyMarker position={at(0, 0)} />);

      expect(getImage()).toHaveClass("bg-gi-dark-gray");
    });
  });

  describe("given a party colour", () => {
    it("applies a safe one behind the image through a custom property", () => {
      render(
        <PartyMarker
          party={{ ...friend, color: "#123456" }}
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
        <PartyMarker
          party={{ id: "friend", name: "Rafał", color: "url(x)" }}
          position={at(0, 0)}
        />,
      );

      expect(getImage()).toHaveClass("bg-gi-dark-gray");
      expect(getImage().style.getPropertyValue("--nolan-color")).toBe("");
    });
  });
});
