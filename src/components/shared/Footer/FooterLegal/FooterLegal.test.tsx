import { screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { FOCUS_CLASS_NAME } from "@/constants/focus";
import { PATHS } from "@/constants/paths";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { FooterLegal } from "./FooterLegal";

const renderLegal = () =>
  renderWithI18n(
    <MemoryRouter>
      <FooterLegal />
    </MemoryRouter>,
  );

describe("<FooterLegal />", () => {
  describe("given any page", () => {
    it("renders a navigation landmark named as the footer navigation", () => {
      renderLegal();

      expect(
        screen.getByRole("navigation", { name: "Nawigacja w stopce" }),
      ).toBeInTheDocument();
    });

    it("lists the terms, privacy and about links in that order", () => {
      renderLegal();

      expect(
        within(screen.getByRole("navigation"))
          .getAllByRole("link")
          .map((link) => link.textContent),
      ).toEqual(["Regulamin", "Prywatność", "O nas"]);
    });

    it("links each of them to its page", () => {
      renderLegal();

      expect(screen.getByRole("link", { name: "Regulamin" })).toHaveAttribute(
        "href",
        PATHS.terms,
      );
      expect(screen.getByRole("link", { name: "Prywatność" })).toHaveAttribute(
        "href",
        PATHS.privacy,
      );
      expect(screen.getByRole("link", { name: "O nas" })).toHaveAttribute(
        "href",
        PATHS.about,
      );
    });

    it("shows keyboard focus on every link as the shared outline", () => {
      renderLegal();

      for (const link of screen.getAllByRole("link")) {
        expect(link).toHaveClass(...FOCUS_CLASS_NAME.split(" "));
      }
    });
  });
});
