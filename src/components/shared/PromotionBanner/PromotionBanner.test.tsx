import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PromotionBanner } from "./PromotionBanner";
import type { Promotion } from "./PromotionBanner.types";

const MOCKED_NOW = new Date("2026-06-15T12:00:00.000Z");

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
  name: "Wesprzyj myPolitics",
  url: "https://example.com/second-active",
  date: {
    start: new Date("2026-01-01T00:00:00.000Z"),
    end: new Date("2026-12-31T23:59:59.999Z"),
  },
  imageUrl: {
    mobile: "https://example.com/banner2-mobile.png",
    tablet: "https://example.com/banner2-tablet.png",
    desktop: "https://example.com/banner2-desktop.png",
  },
};

const futurePromotion: Promotion = {
  ...activePromotion,
  name: "Future promotion",
  date: {
    start: new Date("2027-01-01T00:00:00.000Z"),
    end: new Date("2027-12-31T23:59:59.999Z"),
  },
};

const expiredPromotion: Promotion = {
  ...activePromotion,
  name: "Expired promotion",
  date: {
    start: new Date("2025-01-01T00:00:00.000Z"),
    end: new Date("2025-12-31T23:59:59.999Z"),
  },
};

describe("<PromotionBanner />", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCKED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("given a currently active promotion", () => {
    it("renders the mobile image", () => {
      render(<PromotionBanner promotions={[activePromotion]} />);

      const images = screen.getAllByRole("img");
      expect(images[0]).toHaveAttribute("src", activePromotion.imageUrl.mobile);
    });

    it("renders the tablet image", () => {
      render(<PromotionBanner promotions={[activePromotion]} />);

      const images = screen.getAllByRole("img");
      expect(images[1]).toHaveAttribute("src", activePromotion.imageUrl.tablet);
    });

    it("renders the desktop image", () => {
      render(<PromotionBanner promotions={[activePromotion]} />);

      const images = screen.getAllByRole("img");
      expect(images[2]).toHaveAttribute(
        "src",
        activePromotion.imageUrl.desktop,
      );
    });

    it("sets alt from promotion.name on all images", () => {
      render(<PromotionBanner promotions={[activePromotion]} />);

      const images = screen.getAllByRole("img");
      for (const img of images) {
        expect(img).toHaveAttribute("alt", activePromotion.name);
      }
    });

    it("wraps the banner in an external link with the promotion URL", () => {
      render(<PromotionBanner promotions={[activePromotion]} />);

      expect(
        screen.getByRole("link", { name: activePromotion.name }),
      ).toHaveAttribute("href", activePromotion.url);
    });

    it('sets target="_blank" and rel="noopener noreferrer" on the link', () => {
      render(<PromotionBanner promotions={[activePromotion]} />);

      const link = screen.getByRole("link", { name: activePromotion.name });

      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("sets aria-label from promotion.name", () => {
      render(<PromotionBanner promotions={[activePromotion]} />);

      expect(screen.getByLabelText(activePromotion.name)).toBeInTheDocument();
    });
  });

  describe("given multiple active promotions", () => {
    it("renders exactly one promotion", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.75);

      render(
        <PromotionBanner
          promotions={[activePromotion, secondActivePromotion]}
        />,
      );

      expect(screen.getAllByRole("img")[0]).toHaveAttribute(
        "src",
        secondActivePromotion.imageUrl.mobile,
      );
    });

    it("does not change the selected promotion on re-render", () => {
      const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.75);
      const { rerender } = render(
        <PromotionBanner
          promotions={[activePromotion, secondActivePromotion]}
        />,
      );

      randomSpy.mockReturnValue(0);
      rerender(
        <PromotionBanner
          promotions={[activePromotion, secondActivePromotion]}
        />,
      );

      expect(screen.getAllByRole("img")[0]).toHaveAttribute(
        "src",
        secondActivePromotion.imageUrl.mobile,
      );
    });
  });

  describe("given no active promotion", () => {
    describe("when a fallback is provided", () => {
      it("renders the fallback", () => {
        render(
          <PromotionBanner
            fallback={<span>Brak aktywnej promocji</span>}
            promotions={[expiredPromotion]}
          />,
        );

        expect(screen.getByText("Brak aktywnej promocji")).toBeInTheDocument();
      });
    });

    describe("when no fallback is provided", () => {
      it("renders nothing", () => {
        const { container } = render(
          <PromotionBanner promotions={[expiredPromotion]} />,
        );

        expect(container).toBeEmptyDOMElement();
      });
    });
  });

  describe("given a future promotion (not yet active)", () => {
    it("does not render it", () => {
      const { container } = render(
        <PromotionBanner promotions={[futurePromotion]} />,
      );

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("given an expired promotion", () => {
    it("does not render it", () => {
      const { container } = render(
        <PromotionBanner promotions={[expiredPromotion]} />,
      );

      expect(container).toBeEmptyDOMElement();
    });
  });
});
