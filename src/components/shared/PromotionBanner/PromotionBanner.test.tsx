import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PromotionBanner } from "./PromotionBanner";
import type { Promotion } from "./PromotionBanner.types";

const activePromotion: Promotion = {
  name: "Dołącz do kampanii myPolitics",
  url: "https://example.com/active",
  date: {
    start: new Date("2026-01-01T00:00:00.000Z"),
    end: new Date("2026-12-31T23:59:59.999Z"),
  },
  content: {
    leftTitle: "Podoba Ci się myPolitics?",
    leftSubtitle: "Twórz to z nami.",
    rightTitle: "Dołącz na Discord",
    rightSubtitle: "Fundacji Generacja Innowacja",
  },
};

const secondActivePromotion: Promotion = {
  name: "Wesprzyj myPolitics",
  url: "https://example.com/second-active",
  date: {
    start: new Date("2026-01-01T00:00:00.000Z"),
    end: new Date("2026-12-31T23:59:59.999Z"),
  },
  content: {
    leftTitle: "Masz pomysł?",
    leftSubtitle: "Zbuduj go z nami.",
    rightTitle: "Dołącz do zespołu",
    rightSubtitle: "myPolitics",
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
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("given a currently active promotion", () => {
    it("renders the left title", () => {
      render(<PromotionBanner promotions={[activePromotion]} />);

      expect(
        screen.getByText(activePromotion.content.leftTitle),
      ).toBeInTheDocument();
    });

    it("renders the left subtitle in teal", () => {
      render(<PromotionBanner promotions={[activePromotion]} />);

      expect(
        screen.getByText(activePromotion.content.leftSubtitle),
      ).toHaveClass("text-gi-secondary");
    });

    it("renders the right title", () => {
      render(<PromotionBanner promotions={[activePromotion]} />);

      expect(
        screen.getByText(activePromotion.content.rightTitle),
      ).toBeInTheDocument();
    });

    it("renders the right subtitle in red", () => {
      render(<PromotionBanner promotions={[activePromotion]} />);

      expect(
        screen.getByText(activePromotion.content.rightSubtitle),
      ).toHaveClass("text-gi-red");
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

      expect(
        screen.queryByText(activePromotion.content.leftTitle),
      ).not.toBeInTheDocument();
      expect(
        screen.getByText(secondActivePromotion.content.leftTitle),
      ).toBeInTheDocument();
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

      expect(
        screen.getByText(secondActivePromotion.content.leftTitle),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(activePromotion.content.leftTitle),
      ).not.toBeInTheDocument();
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
