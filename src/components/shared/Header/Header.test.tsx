import { act, fireEvent, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FOCUS_CLASS_NAME } from "@/constants/focus";
import { BUTTON_ICON_MASK_CLASS_NAME } from "@/constants/icon";
import { PATHS } from "@/constants/paths";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { Header } from "./Header";

const NAVIGATION_NAME = "Nawigacja główna";
const OPEN_MENU_NAME = "Otwórz menu nawigacji";
const CLOSE_MENU_NAME = "Zamknij menu nawigacji";

const HOME_ROUTE_ID = "routes/_index";

const renderHeader = (path: string = PATHS.home, routeId?: string) =>
  renderWithI18n(
    <MemoryRouter initialEntries={[path]}>
      <Header routeId={routeId} />
    </MemoryRouter>,
  );

const getLogo = () =>
  screen.getByRole("link", { name: "Strona główna" }).querySelector("svg");

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

    it("draws the menu button's icon in the shared way that survives forced colours", () => {
      renderHeader();

      expect(
        screen
          .getByRole("button", { name: OPEN_MENU_NAME })
          .querySelector("span"),
      ).toHaveClass(...BUTTON_ICON_MASK_CLASS_NAME.split(" "));
    });

    it("shows keyboard focus on the logo link and the menu button as the shared outline", () => {
      renderHeader();

      for (const control of [
        screen.getByRole("link", { name: "Strona główna" }),
        screen.getByRole("button", { name: OPEN_MENU_NAME }),
      ]) {
        expect(control).toHaveClass(...FOCUS_CLASS_NAME.split(" "));
      }
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

  describe("given the logo", () => {
    beforeEach(() => {
      sessionStorage.clear();
      vi.useFakeTimers({
        toFake: [
          "requestAnimationFrame",
          "cancelAnimationFrame",
          "performance",
        ],
      });
      vi.stubGlobal(
        "matchMedia",
        vi.fn(() => ({ matches: false })),
      );
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.unstubAllGlobals();
    });

    const playFrames = () => {
      act(() => {
        vi.advanceTimersByTime(500);
      });
    };

    it("draws it inside the link, hidden from assistive technology", () => {
      renderHeader(PATHS.home, HOME_ROUTE_ID);

      expect(getLogo()).toHaveAttribute("aria-hidden", "true");
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("plays the animation on the first visit of the view", () => {
      renderHeader(PATHS.home, HOME_ROUTE_ID);
      playFrames();

      expect(getLogo()).toHaveAttribute("data-playing", "true");
    });

    it("rests on a later visit of the view in the session", () => {
      renderHeader(PATHS.home, HOME_ROUTE_ID).unmount();
      renderHeader(PATHS.home, HOME_ROUTE_ID);
      playFrames();

      expect(getLogo()).not.toHaveAttribute("data-playing");
    });

    it("rests when it does not know the view", () => {
      renderHeader(PATHS.home);
      playFrames();

      expect(getLogo()).not.toHaveAttribute("data-playing");
    });
  });
});
