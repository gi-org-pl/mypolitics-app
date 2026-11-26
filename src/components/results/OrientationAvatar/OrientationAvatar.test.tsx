import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OrientationAvatar } from "./OrientationAvatar";
import type { OrientationAvatarProps } from "./OrientationAvatar.types";

const AVATAR: OrientationAvatarProps = {
  color: "#9b59b6",
  imageUrl: "https://example.org/progressivism.svg",
};

const renderAvatar = (props: OrientationAvatarProps = AVATAR) =>
  render(<OrientationAvatar {...props} />);

const getAvatar = () => screen.getByTestId("orientation-avatar");
const queryImage = () => getAvatar().querySelector("img");

describe("<OrientationAvatar />", () => {
  describe("given a colour and an image", () => {
    it("draws a disc in the colour, with the image on it as decoration", () => {
      renderAvatar();

      expect(getAvatar()).toHaveStyle({ "--avatar-color": "#9b59b6" });
      expect(getAvatar()).toHaveClass("bg-(--avatar-color)", "rounded-full");
      expect(queryImage()).toHaveAttribute("src", AVATAR.imageUrl);
      expect(queryImage()).toHaveAttribute("alt", "");
    });

    it("is small unless told otherwise", () => {
      renderAvatar();

      expect(getAvatar()).toHaveClass("size-6");
    });
  });

  describe("given the regular size", () => {
    it("draws a 32 px disc", () => {
      renderAvatar({ ...AVATAR, size: "regular" });

      expect(getAvatar()).toHaveClass("size-8");
      expect(getAvatar()).not.toHaveClass("size-6");
    });
  });

  describe("given no colour, or one that is not a colour", () => {
    it.each([
      undefined,
      "url(javascript:alert(1))",
    ])("draws the grey disc of a bar: %s", (color) => {
      renderAvatar({ ...AVATAR, color });

      expect(getAvatar()).toHaveClass("bg-gi-dark-gray");
      expect(getAvatar()).not.toHaveAttribute("style");
    });
  });

  describe("given no image", () => {
    it("draws the disc alone", () => {
      renderAvatar({ color: AVATAR.color });

      expect(queryImage()).not.toBeInTheDocument();
    });
  });

  describe("when the image fails to load", () => {
    it("leaves the disc alone", () => {
      renderAvatar();

      fireEvent.error(queryImage() as HTMLImageElement);

      expect(queryImage()).not.toBeInTheDocument();
      expect(getAvatar()).toHaveStyle({ "--avatar-color": "#9b59b6" });
    });
  });
});
