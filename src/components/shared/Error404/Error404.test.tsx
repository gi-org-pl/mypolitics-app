import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { PATHS } from "@/constants/paths";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { Error404 } from "./Error404";

const renderError = () =>
  renderWithI18n(
    <MemoryRouter initialEntries={["/nie-ma-takiej-strony"]}>
      <Error404 />
    </MemoryRouter>,
  );

describe("<Error404 />", () => {
  describe("given an address that does not exist", () => {
    it("renders the whole 404 sentence as the main heading", () => {
      renderError();

      expect(
        screen.getByRole("heading", {
          level: 1,
          name: "To jest błąd 404 na miarę naszych możliwości!",
        }),
      ).toBeInTheDocument();
    });

    it("renders the body text", () => {
      renderError();

      expect(
        screen.getByText(
          "My tym błędem otwieramy oczy niedowiarkom! Mówimy: to jest nasz błąd, przez nas zrobiony, i to nie jest nasze ostatnie słowo!",
        ),
      ).toBeInTheDocument();
    });

    it("renders the bear illustration with a text alternative", () => {
      renderError();

      expect(
        screen.getByRole("img", { name: "Ilustracja misia — błąd 404" }),
      ).toHaveAttribute("src");
    });

    it("offers a single link back to the home page", () => {
      renderError();

      expect(screen.getAllByRole("link")).toEqual([
        screen.getByRole("link", { name: "Strona główna" }),
      ]);
      expect(
        screen.getByRole("link", { name: "Strona główna" }),
      ).toHaveAttribute("href", PATHS.home);
    });

    it("does not nest a button inside the link", () => {
      renderError();

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("leaves the main landmark to the page shell", () => {
      renderError();

      expect(screen.queryByRole("main")).not.toBeInTheDocument();
    });
  });
});
