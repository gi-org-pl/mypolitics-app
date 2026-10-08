import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { render, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { HOME_FEATURES, HOME_PROMOTIONS } from "@/constants/home";
import { PATHS } from "@/constants/paths";

import { useHomeContent } from "./useHomeContent";

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

const getContent = () => renderHook(() => useHomeContent(), { wrapper }).result;

describe("useHomeContent", () => {
  describe("when the page asks for its promotions", () => {
    it("returns every promotion with its name as text", () => {
      const { promotions } = getContent().current;

      expect(promotions).toHaveLength(HOME_PROMOTIONS.length);
      expect(promotions[0].name).toBe(
        "Dołącz na Discord Fundacji Generacja Innowacja",
      );
    });

    it("keeps the address, the dates and the pictures of a promotion", () => {
      const [promotion] = getContent().current.promotions;
      const [source] = HOME_PROMOTIONS;

      expect(promotion.url).toBe(source.url);
      expect(promotion.date).toBe(source.date);
      expect(promotion.imageUrl).toBe(source.imageUrl);
    });
  });

  describe("when the page asks for its features", () => {
    it("returns the titles as text, in the order of the content", () => {
      const { features } = getContent().current;

      expect(features.map(({ title }) => title)).toEqual([
        "+4 000 000 osób",
        "Nikt nas nie finansuje",
        "Algorytm jest jawny",
      ]);
      expect(features).toHaveLength(HOME_FEATURES.length);
    });

    it("returns a plain description without a link", () => {
      const [feature] = getContent().current.features;

      render(<p>{feature.description}</p>, { wrapper });

      expect(
        screen.getByText(/^Milionom Polek i Polaków pomogliśmy/),
      ).toBeInTheDocument();
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("returns the description of the algorithm with a link to the white paper", () => {
      const [, , feature] = getContent().current.features;

      render(<p>{feature.description}</p>, { wrapper });

      const link = screen.getByRole("link", {
        name: "Sprawdź jak działa algorytm.",
      });

      expect(link).toHaveAttribute("href", PATHS.whitepaperPDF);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(
        screen.getByText(/^Jesteśmy w pełni transparentni/),
      ).toBeInTheDocument();
    });
  });
});
