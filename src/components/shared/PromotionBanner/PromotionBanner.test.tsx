import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PromotionBanner } from "./PromotionBanner";
import type { Promotion } from "./PromotionBanner.types";

const NOW = new Date("2026-06-15T12:00:00.000Z");
const FALLBACK = "Brak aktywnej promocji";

const activePromotion: Promotion = {
  name: "Dołącz do kampanii myPolitics",
  url: "https://example.com/active",
  date: {
    start: new Date("2026-01-01T00:00:00.000Z"),
    end: new Date("2026-12-31T23:59:59.999Z"),
  },
  imageUrl: {
    mobile: "https://example.com/banner-mobile.png",
    tablet: "https://example.com/banner-tablet.png",
    desktop: "https://example.com/banner-desktop.png",
  },
};

const secondActivePromotion: Promotion = {
  ...activePromotion,
  name: "Wesprzyj myPolitics",
  url: "https://example.com/second-active",
};

const expiredPromotion: Promotion = {
  ...activePromotion,
  name: "Zakończona kampania",
  date: {
    start: new Date("2025-01-01T00:00:00.000Z"),
    end: new Date("2025-12-31T23:59:59.999Z"),
  },
};

const getImageAddresses = (name: string) =>
  within(screen.getByRole("link", { name }))
    .getAllByRole("img", { name })
    .map((image) => image.getAttribute("src"));

describe("<PromotionBanner />", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("when one promotion runs today", () => {
    it("renders a link to the promotion, named by it", () => {
      render(<PromotionBanner promotions={[activePromotion]} />);

      expect(
        screen.getByRole("link", { name: activePromotion.name }),
      ).toHaveAttribute("href", activePromotion.url);
    });

    it("opens the promotion in a new tab, without access to the app", () => {
      render(<PromotionBanner promotions={[activePromotion]} />);

      const link = screen.getByRole("link", { name: activePromotion.name });

      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("renders the picture for a narrow, a medium and a wide screen", () => {
      render(<PromotionBanner promotions={[activePromotion]} />);

      expect(getImageAddresses(activePromotion.name)).toEqual([
        activePromotion.imageUrl.mobile,
        activePromotion.imageUrl.tablet,
        activePromotion.imageUrl.desktop,
      ]);
    });

    it("loads the pictures lazily, so only the displayed one is downloaded", () => {
      render(<PromotionBanner promotions={[activePromotion]} />);

      for (const image of screen.getAllByRole("img")) {
        expect(image).toHaveAttribute("loading", "lazy");
      }
    });
  });

  describe("when several promotions run today", () => {
    it("renders one of them", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.75);

      render(
        <PromotionBanner
          promotions={[activePromotion, secondActivePromotion]}
        />,
      );

      expect(screen.getAllByRole("link")).toHaveLength(1);
      expect(
        screen.getByRole("link", { name: secondActivePromotion.name }),
      ).toBeInTheDocument();
    });

    it("keeps the same one when it renders again", () => {
      const random = vi.spyOn(Math, "random").mockReturnValue(0.75);
      const { rerender } = render(
        <PromotionBanner
          promotions={[activePromotion, secondActivePromotion]}
        />,
      );

      random.mockReturnValue(0);
      rerender(
        <PromotionBanner
          promotions={[activePromotion, secondActivePromotion]}
        />,
      );

      expect(
        screen.getByRole("link", { name: secondActivePromotion.name }),
      ).toBeInTheDocument();
    });
  });

  describe("when no promotion runs today", () => {
    it("renders the fallback when there is one", () => {
      render(
        <PromotionBanner
          fallback={<span>{FALLBACK}</span>}
          promotions={[expiredPromotion]}
        />,
      );

      expect(screen.getByText(FALLBACK)).toBeInTheDocument();
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("renders nothing without a fallback", () => {
      const { container } = render(
        <PromotionBanner promotions={[expiredPromotion]} />,
      );

      expect(container).toBeEmptyDOMElement();
    });
  });
});
