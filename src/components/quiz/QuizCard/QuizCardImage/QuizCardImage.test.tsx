import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuizCardImage } from "./QuizCardImage";
import {
  IMAGE_SHORT_CLASS_NAME,
  IMAGE_TALL_CLASS_NAME,
} from "./QuizCardImage.constants";

const IMAGE_URL = "/assets/lata-90.png";

describe("<QuizCardImage />", () => {
  describe("given the address of an image", () => {
    it("renders the image", () => {
      render(<QuizCardImage url={IMAGE_URL} isTall={false} />);

      expect(screen.getByRole("presentation")).toHaveAttribute(
        "src",
        IMAGE_URL,
      );
    });

    it("renders it as decorative: an empty alternative text, and not hidden on top of that", () => {
      render(<QuizCardImage url={IMAGE_URL} isTall={false} />);

      const image = screen.getByRole("presentation");

      expect(image).toHaveAttribute("alt", "");
      expect(image).not.toHaveAttribute("aria-hidden");
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });
  });

  describe("given a collapsed card", () => {
    it("renders the short image", () => {
      render(<QuizCardImage url={IMAGE_URL} isTall={false} />);

      const image = screen.getByRole("presentation");

      expect(image).toHaveClass(IMAGE_SHORT_CLASS_NAME);
      expect(image).not.toHaveClass(IMAGE_TALL_CLASS_NAME);
    });
  });

  describe("given an open card", () => {
    it("renders the tall image", () => {
      render(<QuizCardImage url={IMAGE_URL} isTall />);

      const image = screen.getByRole("presentation");

      expect(image).toHaveClass(IMAGE_TALL_CLASS_NAME);
      expect(image).not.toHaveClass(IMAGE_SHORT_CLASS_NAME);
    });
  });
});
