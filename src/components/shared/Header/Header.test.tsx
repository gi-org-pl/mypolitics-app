import { fireEvent, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { PATHS } from "@/constants/paths";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { Header } from "./Header";

const NAVIGATION_NAME = "Nawigacja główna";
const OPEN_MENU_NAME = "Otwórz menu nawigacji";
const CLOSE_MENU_NAME = "Zamknij menu nawigacji";
const FOCUS_CLASSES = [
  "focus-visible:outline-2",
  "focus-visible:outline-offset-2",
  "focus-visible:outline-solid",
  "focus-visible:outline-gi-primary",
];

const renderHeader = (path: string = PATHS.home) =>
  renderWithI18n(
    <MemoryRouter initialEntries={[path]}>
      <Header />
    </MemoryRouter>,
  );

const getNavigations = () =>
  screen.getAllByRole("navigation", { name: NAVIGATION_NAME });

const openMenu = () => {
  fireEvent.click(screen.getByRole("button", { name: OPEN_MENU_NAME }));

  return getNavigations()[1];
};

describe("<Header />", () => {
  describe("given any page", () => {
    it("renders the banner landmark", () => {
      renderHeader();

      expect(screen.getByRole("banner")).toBeInTheDocument();
    });

    it("renders the logo as a link to the home page", () => {
      renderHeader();

      expect(
        screen.getByRole("link", { name: "Strona główna" }),
      ).toHaveAttribute("href", PATHS.home);
    });

    it("renders the navigation bar with debates, polls and quizzes in that order", () => {
      renderHeader();

      const [bar] = getNavigations();

      expect(
        within(bar)
          .getAllByRole("link")
          .map((link) => link.textContent),
      ).toEqual(["Debaty", "Sondaże", "Quizy"]);
    });

    it("renders the menu button collapsed, with the menu closed", () => {
      renderHeader();

      expect(
        screen.getByRole("button", { name: OPEN_MENU_NAME, expanded: false }),
      ).toBeInTheDocument();
      expect(getNavigations()).toHaveLength(1);
    });

    it("draws the menu button's icon as a mask", () => {
      renderHeader();

      const icon = screen
        .getByRole("button", { name: OPEN_MENU_NAME })
        .querySelector("span");

      expect(icon?.style.maskImage).toMatch(/^url\(".+"\)$/);
    });

    it("keeps the menu button's icon visible in forced colours, in the colour of button text", () => {
      renderHeader();

      expect(
        screen
          .getByRole("button", { name: OPEN_MENU_NAME })
          .querySelector("span"),
      ).toHaveClass("bg-current", "forced-colors:bg-[color:ButtonText]");
    });

    it("shows keyboard focus on the logo link as an outline", () => {
      renderHeader();

      expect(screen.getByRole("link", { name: "Strona główna" })).toHaveClass(
        ...FOCUS_CLASSES,
      );
    });

    it("shows keyboard focus on the menu button as an outline instead of Athena's ring", () => {
      renderHeader();

      const button = screen.getByRole("button", { name: OPEN_MENU_NAME });

      expect(button).toHaveClass(...FOCUS_CLASSES);
      expect(button).not.toHaveClass("focus-visible:ring-[3px]");
    });
  });

  describe("given the page a navigation link leads to", () => {
    it("marks that link as the current page", () => {
      renderHeader(PATHS.quizzes);

      expect(
        screen.getByRole("link", { name: "Quizy", current: "page" }),
      ).toBeInTheDocument();
    });
  });

  describe("when the menu button is clicked", () => {
    it("opens the menu with quizzes first and debates last", () => {
      renderHeader();

      const menu = openMenu();

      expect(
        within(menu)
          .getAllByRole("link")
          .map((link) => link.textContent),
      ).toEqual(["Quizy", "Sondaże", "Debaty"]);
    });

    it("marks the button as expanded and offers to close the menu", () => {
      renderHeader();

      openMenu();

      expect(
        screen.getByRole("button", { name: CLOSE_MENU_NAME, expanded: true }),
      ).toBeInTheDocument();
    });

    it("points the button at the menu it controls", () => {
      renderHeader();

      const menu = openMenu();

      expect(
        screen.getByRole("button", { name: CLOSE_MENU_NAME }),
      ).toHaveAttribute("aria-controls", menu.id);
    });
  });

  describe("when the menu button is clicked again", () => {
    it("closes the menu", () => {
      renderHeader();

      openMenu();
      fireEvent.click(screen.getByRole("button", { name: CLOSE_MENU_NAME }));

      expect(getNavigations()).toHaveLength(1);
      expect(
        screen.getByRole("button", { name: OPEN_MENU_NAME, expanded: false }),
      ).toBeInTheDocument();
    });
  });

  describe("when a link of the open menu is clicked", () => {
    it("closes the menu", () => {
      renderHeader();

      const menu = openMenu();
      fireEvent.click(within(menu).getByRole("link", { name: "Quizy" }));

      expect(getNavigations()).toHaveLength(1);
    });
  });

  describe("when the user presses outside the open menu", () => {
    it("closes the menu", () => {
      renderHeader();

      openMenu();
      fireEvent.mouseDown(document.body);

      expect(getNavigations()).toHaveLength(1);
    });
  });

  describe("when the user presses inside the open menu", () => {
    it("keeps the menu open", () => {
      renderHeader();

      const menu = openMenu();
      fireEvent.mouseDown(menu);

      expect(getNavigations()).toHaveLength(2);
    });
  });
});
