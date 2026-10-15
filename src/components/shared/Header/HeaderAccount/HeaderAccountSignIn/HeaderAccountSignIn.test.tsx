import { fireEvent, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { HeaderAccountSignIn } from "./HeaderAccountSignIn";

const renderSignIn = (path: string, onNavigate = vi.fn()) => {
  renderWithI18n(
    <MemoryRouter initialEntries={[path]}>
      <HeaderAccountSignIn onNavigate={onNavigate} />
    </MemoryRouter>,
  );

  return {
    link: screen.getByRole("link", { name: "Zaloguj się" }),
    onNavigate,
  };
};

describe("HeaderAccountSignIn", () => {
  describe("given a page of the app", () => {
    it("links to the sign-in page with the page as next", () => {
      const { link } = renderSignIn("/quizzes/mypolitics?tab=all");

      expect(link).toHaveAttribute(
        "href",
        "/login?next=%2Fquizzes%2Fmypolitics%3Ftab%3Dall",
      );
      expect(link).not.toHaveAttribute("aria-current");
    });

    it("tells the menu it navigated", () => {
      const { link, onNavigate } = renderSignIn("/");

      fireEvent.click(link);

      expect(onNavigate).toHaveBeenCalledOnce();
    });
  });

  describe("given the sign-in page is open", () => {
    it("is the current page, filled, and links to the page without next", () => {
      const { link } = renderSignIn("/login?next=%2F");

      expect(link).toHaveAttribute("aria-current", "page");
      expect(link).toHaveAttribute("href", "/login");
      expect(link.className).toContain("bg-gi-light-primary ");
    });
  });
});
