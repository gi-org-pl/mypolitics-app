import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { QuizCardImage } from "./QuizCardImage";
import { IMAGE_HIDDEN_ON_WIDE_SCREEN_CLASS_NAME } from "./QuizCardImage.constants";
import type { QuizCardImageProps } from "./QuizCardImage.types";

const IMAGE_URL = "/assets/lata-90.png";

const renderImage = (props: Partial<QuizCardImageProps> = {}) =>
  render(
    <QuizCardImage
      url={IMAGE_URL}
      isTall={false}
      isHiddenOnWideScreen={false}
      {...props}
    />,
  );

describe("<QuizCardImage />", () => {
  describe("given the address of an image", () => {
    it("renders the image", () => {
      renderImage();

      expect(screen.getByRole("presentation")).toHaveAttribute(
        "src",
        IMAGE_URL,
      );
    });

    it("renders it as decorative: an empty alternative text, and not hidden on top of that", () => {
      renderImage();

      const image = screen.getByRole("presentation");

      expect(image).toHaveAttribute("alt", "");
      expect(image).not.toHaveAttribute("aria-hidden");
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("loads the picture lazily, so it is not downloaded while it is hidden or far from the viewport", () => {
      renderImage();

      expect(screen.getByRole("presentation")).toHaveAttribute(
        "loading",
        "lazy",
      );
    });
  });

  describe("given an open card", () => {
    it("renders the same decorative image", () => {
      renderImage({ isTall: true });

      expect(screen.getByRole("presentation")).toHaveAttribute(
        "src",
        IMAGE_URL,
      );
    });
  });

  describe("given an image that only a narrow screen shows", () => {
    it("is hidden from the wide breakpoint up, in CSS alone", () => {
      renderImage({ isHiddenOnWideScreen: true });

      expect(screen.getByRole("presentation")).toHaveClass(
        IMAGE_HIDDEN_ON_WIDE_SCREEN_CLASS_NAME,
      );
    });

    it("renders the same markup as an image that every width shows", () => {
      renderImage({ isHiddenOnWideScreen: true });

      expect(screen.getByRole("presentation")).toHaveAttribute(
        "src",
        IMAGE_URL,
      );
    });
  });
});
