import { screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { PatroniteBanner } from "./PatroniteBanner";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n.tsx";

describe("<PatroniteBanner />", () => {
  const href = "https://patronite.pl/mypolitics";
  const ctaLabel = "5 zł na kawę";

  const renderBanner = (
    props?: Partial<React.ComponentProps<typeof PatroniteBanner>>,
  ) =>
    renderWithI18n(
      <PatroniteBanner href={href} ctaLabel={ctaLabel} {...props} />,
    );

  describe("given href and ctaLabel", () => {
    it("renders both brand copy lines", () => {
      renderBanner();

      expect(
        screen.getByText("Nikt nas nie finansuje… poza Wami!"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Wesprzyj naszą działalność:"),
      ).toBeInTheDocument();
    });

    it("renders the CTA button with ctaLabel", () => {
      renderBanner();

      expect(screen.getByRole("link", { name: ctaLabel })).toBeInTheDocument();
    });

    it("links the CTA to href", () => {
      renderBanner();

      expect(screen.getByRole("link", { name: ctaLabel })).toHaveAttribute(
        "href",
        href,
      );
    });

    it('opens the link in a new tab with rel="noopener noreferrer"', () => {
      renderBanner();

      const link = screen.getByRole("link", { name: ctaLabel });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  describe("given an id", () => {
    it("applies the id to the root element", () => {
      const { container } = renderBanner({ id: "patronite-banner" });

      expect(container.firstElementChild).toHaveAttribute(
        "id",
        "patronite-banner",
      );
    });
  });
});
