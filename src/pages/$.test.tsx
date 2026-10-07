import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { PATHS } from "@/constants/paths";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";
import NotFound from "./$";

const renderPage = () =>
  renderWithI18n(
    <MemoryRouter initialEntries={["/nie-ma-takiej-strony"]}>
      <NotFound />
    </MemoryRouter>,
  );

describe("<NotFound /> page", () => {
  describe("when a user lands on an unknown route", () => {
    it("renders the Error404 component", () => {
      renderPage();

      expect(
        screen.getByRole("heading", { level: 1, name: /to jest błąd 404/i }),
      ).toBeInTheDocument();
    });

    it("offers the way back to the home page", () => {
      renderPage();

      expect(
        screen.getByRole("link", { name: /strona główna/i }),
      ).toHaveAttribute("href", PATHS.home);
    });
  });
});
