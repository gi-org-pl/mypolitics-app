import { fireEvent, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { PATHS } from "@/constants/paths";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { HeaderNav } from "./HeaderNav";

const renderNav = (
  props: Partial<React.ComponentProps<typeof HeaderNav>> = {},
  path: string = PATHS.home,
) => {
  const handleNavigate = vi.fn();

  renderWithI18n(
    <MemoryRouter initialEntries={[path]}>
      <HeaderNav variant="bar" onNavigate={handleNavigate} {...props} />
    </MemoryRouter>,
  );

  return { handleNavigate };
};

const getLinkNames = () =>
  within(screen.getByRole("navigation"))
    .getAllByRole("link")
    .map((link) => link.textContent);

describe("<HeaderNav />", () => {
  describe("given any variant", () => {
    it("renders a navigation landmark named as the main navigation", () => {
      renderNav();

      expect(
        screen.getByRole("navigation", { name: "Nawigacja główna" }),
      ).toBeInTheDocument();
    });

    it("links to debates, polls and quizzes", () => {
      renderNav();

      const navigation = screen.getByRole("navigation");

      expect(
        within(navigation).getByRole("link", { name: "Debaty" }),
      ).toHaveAttribute("href", PATHS.debates);
      expect(
        within(navigation).getByRole("link", { name: "Sondaże" }),
      ).toHaveAttribute("href", PATHS.polls);
      expect(
        within(navigation).getByRole("link", { name: "Quizy" }),
      ).toHaveAttribute("href", PATHS.quizzes);
    });
  });

  describe("given the polls link, which leads outside the app", () => {
    it("opens it in a new tab without access to the opener", () => {
      renderNav();

      const link = screen.getByRole("link", { name: "Sondaże" });

      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("opens the links of the app in the same tab", () => {
      renderNav();

      for (const name of ["Debaty", "Quizy"]) {
        expect(screen.getByRole("link", { name })).not.toHaveAttribute(
          "target",
        );
      }
    });
  });

  describe("given the bar variant", () => {
    it("lists debates first and quizzes last", () => {
      renderNav({ variant: "bar" });

      expect(getLinkNames()).toEqual(["Debaty", "Sondaże", "Quizy"]);
    });
  });

  describe("given the menu variant", () => {
    it("lists quizzes first and debates last", () => {
      renderNav({ variant: "menu" });

      expect(getLinkNames()).toEqual(["Quizy", "Sondaże", "Debaty"]);
    });
  });

  describe("given an id and a ref", () => {
    it("puts both on the navigation landmark", () => {
      const ref = createRef<HTMLElement>();
      renderNav({ variant: "menu", id: "menu-id", ref });

      const navigation = screen.getByRole("navigation");

      expect(navigation).toHaveAttribute("id", "menu-id");
      expect(ref.current).toBe(navigation);
    });
  });

  describe("given a page that none of the links leads to", () => {
    it("marks no link as current", () => {
      renderNav({}, PATHS.home);

      expect(
        screen.queryByRole("link", { current: "page" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("given the page one of the links leads to", () => {
    it("marks only that link as the current page", () => {
      renderNav({}, PATHS.quizzes);

      expect(screen.getAllByRole("link", { current: "page" })).toEqual([
        screen.getByRole("link", { name: "Quizy" }),
      ]);
    });
  });

  describe("when a link is clicked", () => {
    it("reports the navigation", () => {
      const { handleNavigate } = renderNav();

      fireEvent.click(screen.getByRole("link", { name: "Quizy" }));

      expect(handleNavigate).toHaveBeenCalledTimes(1);
    });
  });
});
