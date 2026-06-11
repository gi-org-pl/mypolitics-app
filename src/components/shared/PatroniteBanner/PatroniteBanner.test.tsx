import { screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import { PATHS } from "@/constants/paths";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";
import { PatroniteBanner } from "./PatroniteBanner";

describe("<PatroniteBanner />", () => {
  const href = PATHS.patronite;
  const ctaLabel = "5 zł na kawę";

  const renderBanner = (
    props?: Partial<ComponentProps<typeof PatroniteBanner>>,
  ) =>
    renderWithI18n(
      <PatroniteBanner href={href} ctaLabel={ctaLabel} {...props} />,
    );

  it("renders the first brand copy line", () => {
    renderBanner();

    expect(
      screen.getByText("Nikt nas nie finansuje… poza Wami!"),
    ).toBeInTheDocument();
  });

  it("renders the second brand copy line", () => {
    renderBanner();

    expect(screen.getByText("Wesprzyj naszą działalność:")).toBeInTheDocument();
  });

  it("renders the CTA link with ctaLabel", () => {
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

  it('opens the link in a new tab with target="_blank"', () => {
    renderBanner();

    const link = screen.getByRole("link", { name: ctaLabel });
    expect(link).toHaveAttribute("target", "_blank");
  });

  it('opens the link in a new tab with rel="noopener noreferrer"', () => {
    renderBanner();

    const link = screen.getByRole("link", { name: ctaLabel });
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
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
