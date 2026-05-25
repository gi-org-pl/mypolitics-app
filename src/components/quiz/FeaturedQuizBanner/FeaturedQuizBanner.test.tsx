import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FeaturedQuizBanner from "./FeaturedQuizBanner";

// Mocking the image imports
vi.mock("@/assets/images/home/quiz-banner-content.png", () => ({
  default: "mock-content-path",
}));
vi.mock("@/assets/images/home/quiz-banner-bg.png", () => ({
  default: "mock-bg-path",
}));

// Mocking lingui macro
vi.mock("@lingui/core/macro", () => ({
  t: (msg: any) => (Array.isArray(msg) ? msg[0] : msg),
}));

describe("<FeaturedQuizBanner />", () => {
  describe("content", () => {
    it("renders the background image layer", () => {
      const { container } = render(<FeaturedQuizBanner />);
      const bgImg = container.querySelector('img[src="mock-bg-path"]');
      expect(bgImg).toBeInTheDocument();
    });

    it("renders the floating banner image with drop shadow", () => {
      render(<FeaturedQuizBanner />);
      const contentImg = screen.getByAltText("mypolitics banner content");
      expect(contentImg).toBeInTheDocument();
      expect(contentImg).toHaveAttribute("src", "mock-content-path");
      expect(contentImg).toHaveAttribute("class", expect.stringContaining("drop-shadow"));
    });
  });

  describe("structure & styles", () => {
    it("has the correct legacy height and background color", () => {
      const { container } = render(<FeaturedQuizBanner />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("h-[292px]");
      expect(wrapper).toHaveClass("bg-[#01171B]");
    });

    it("centers the content using flexbox", () => {
      const { container } = render(<FeaturedQuizBanner />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("flex");
      expect(wrapper).toHaveClass("items-center");
      expect(wrapper).toHaveClass("justify-center");
    });

    it("applies the overflow safety margin (height offset) for animation", () => {
      render(<FeaturedQuizBanner />);
      const img = screen.getByAltText("mypolitics banner content");
      expect(img).toHaveClass("h-[calc(100%+30px)]");
    });

    it("applies rounded corners and overflow-hidden to the container", () => {
      const { container } = render(<FeaturedQuizBanner />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("rounded-[32px]");
      expect(wrapper).toHaveClass("overflow-hidden");
    });
  });
});
