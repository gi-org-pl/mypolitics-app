import { screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { PATHS } from "@/constants/paths";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { Footer } from "./Footer";

const renderFooter = () =>
  renderWithI18n(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );

describe("<Footer />", () => {
  describe("given any page", () => {
    it("renders the content info landmark", () => {
      renderFooter();

      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });

    it("renders the brand row with the current year and both logos", () => {
      renderFooter();

      const footer = within(screen.getByRole("contentinfo"));

      expect(
        footer.getByText(`© ${new Date().getFullYear()}`),
      ).toBeInTheDocument();
      expect(footer.getByRole("img", { name: "myPolitics" })).toBeVisible();
      expect(
        footer.getByRole("link", { name: "Generacja Innowacja" }),
      ).toHaveAttribute("href", PATHS.generacjaInnowacja);
    });

    it("renders a link to every social profile", () => {
      renderFooter();

      const footer = within(screen.getByRole("contentinfo"));

      expect(
        footer.getAllByRole("link", { name: /^Odwiedź nasz/ }),
      ).toHaveLength(7);
    });

    it("renders the legal links inside the footer navigation", () => {
      renderFooter();

      const navigation = within(
        screen.getByRole("navigation", { name: "Nawigacja w stopce" }),
      );

      expect(
        navigation.getByRole("link", { name: "Regulamin" }),
      ).toHaveAttribute("href", PATHS.terms);
      expect(
        navigation.getByRole("link", { name: "Prywatność" }),
      ).toHaveAttribute("href", PATHS.privacy);
      expect(navigation.getByRole("link", { name: "O nas" })).toHaveAttribute(
        "href",
        PATHS.about,
      );
    });
  });
});
