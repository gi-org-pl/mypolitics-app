import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FeaturedQuizBanner from "./FeaturedQuizBanner";

vi.mock("@/assets/images/home/quiz-banner-content.png", () => ({
  default: "mock-image-path",
}));

vi.mock("@lingui/core/macro", () => ({
  t: (msg: any) => (Array.isArray(msg) ? msg[0] : msg),
}));

describe("<FeaturedQuizBanner />", () => {
  describe("content", () => {
    it("renders the banner image", () => {
      render(<FeaturedQuizBanner />);
      const img = screen.getByRole("img");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "mock-image-path");
    });

    it("image has an alt attribute", () => {
      render(<FeaturedQuizBanner />);
      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("alt", "mypolitics banner content");
    });
  });

  describe("animation", () => {
    it("applies the float animation class to the image", () => {
      render(<FeaturedQuizBanner />);
      const img = screen.getByRole("img");
      expect(img).toHaveClass("animate-quiz-banner-float");
    });
  });
});
