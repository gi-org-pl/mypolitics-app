import { act, fireEvent, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { AuthDialogProvider } from "@/components/shared/AuthDialogProvider/AuthDialogProvider";
import { AuthSessionProvider } from "@/components/shared/AuthSessionProvider/AuthSessionProvider";

import {
  FEATURED_QUIZ,
  HOME_PARTNER_SECTIONS,
  HOME_PROMOTIONS,
  HOME_QUIZZES,
} from "@/constants/home";
import { PATHS } from "@/constants/paths";
import type { AuthAccount } from "@/types/auth";
import { createAuthAccount } from "@/utils/vitest/auth/createAuthAccount";
import { createFakeAuthClient } from "@/utils/vitest/auth/createFakeAuthClient";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import HomePage from "./_index";

const PROMOTION_NAME = "Dołącz na Discord Fundacji Generacja Innowacja";
const FEATURED_TITLE = "myPolitics";
const FEATURE_TITLES = [
  "+4 000 000 osób",
  "Nikt nas nie finansuje",
  "Algorytm jest jawny",
];
const TAB_NAMES = ["Wszystkie", "Wyborcze", "Społecznościowe"];
const ELECTORAL_TITLES = [
  "Wyborczy 2023",
  "Eurowyborczy 2024",
  "Warszawski Radar Wyborczy",
];
const SOCIAL_TITLES = [
  "Polskie Lata 90.",
  "600+ pytań",
  "Preferencje muzyczne",
  "Filozoficzny",
  "Kraje starożytne",
  "Orientacja seksualna",
];

const expectPanelQuizzes = (tabName: string, titles: string[]) => {
  const panel = within(screen.getByRole("tabpanel", { name: tabName }));

  expect(panel.getAllByRole("heading", { level: 2 })).toHaveLength(
    titles.length,
  );

  for (const title of titles) {
    expect(
      panel.getByRole("heading", { level: 2, name: title }),
    ).toBeInTheDocument();
  }
};

// The page starts a quiz by opening its address, so it is rendered inside a
// router, next to a stand-in for the page of a quiz. It asks for an account
// before creating a quiz, so it stands in the session and the dialog the
// root of the app gives every page.
const renderPage = (account: AuthAccount | null = null) => {
  const client = createFakeAuthClient({
    getSession: vi.fn().mockResolvedValue(account),
  });
  const router = createMemoryRouter(
    [
      {
        path: PATHS.home,
        element: (
          <AuthSessionProvider client={client}>
            <AuthDialogProvider>
              <HomePage />
            </AuthDialogProvider>
          </AuthSessionProvider>
        ),
      },
      { path: "/quizzes/:quizSlug", element: <p>Strona quizu</p> },
    ],
    { initialEntries: [PATHS.home] },
  );

  renderWithI18n(<RouterProvider router={router} />);

  return router;
};

const getQuizCard = (title: string) =>
  within(
    screen
      .getByRole("heading", { level: 2, name: title })
      .closest("article") as HTMLElement,
  );

const getFeaturedCard = () => {
  const [card] = screen.getAllByRole("article");

  return within(card);
};

describe("<HomePage />", () => {
  describe("when a user opens the home page", () => {
    it("renders the promotion banner with the promotion of the content", () => {
      renderPage();

      expect(
        screen.getByRole("link", { name: PROMOTION_NAME }),
      ).toHaveAttribute("href", HOME_PROMOTIONS[0].url);
    });

    it("renders the featured quiz with the start label, before every other card", () => {
      renderPage();

      const featured = getFeaturedCard();

      expect(
        featured.getByRole("heading", { level: 2, name: FEATURED_TITLE }),
      ).toBeInTheDocument();
      expect(
        featured.getByRole("button", { name: "Rozpocznij quiz" }),
      ).toHaveTextContent("Rozpocznij");
      expect(
        featured.getByText(
          "Najbardziej zaawansowany test poglądów politycznych.",
        ),
      ).toBeInTheDocument();
      expect(FEATURED_QUIZ.badge).toBeUndefined();
    });

    it("renders the banner of the featured quiz", () => {
      renderPage();

      expect(
        screen.getByRole("img", { name: "Podgląd wyników quizu myPolitics" }),
      ).toBeInTheDocument();
    });

    it("renders the three features, the last one with a link to the white paper", () => {
      renderPage();

      expect(
        screen
          .getAllByRole("heading", { level: 3 })
          .map((heading) => heading.textContent),
      ).toEqual(FEATURE_TITLES);
      expect(
        screen.getByRole("link", { name: "Sprawdź jak działa algorytm." }),
      ).toHaveAttribute("href", PATHS.whitepaperPDF);
    });

    it("renders the logo of every partner", () => {
      renderPage();

      for (const { title } of HOME_PARTNER_SECTIONS[0].partners) {
        expect(screen.getByRole("img", { name: title })).toBeInTheDocument();
      }
    });

    it("renders the quiz tabs with all quizzes selected", () => {
      renderPage();

      expect(
        within(screen.getByRole("tablist", { name: "Rodzaje quizów" }))
          .getAllByRole("tab")
          .map((tab) => tab.textContent),
      ).toEqual(TAB_NAMES);
      expect(screen.getByRole("tab", { name: "Wszystkie" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });

    it("lists every quiz of the content, the featured one excluded", () => {
      renderPage();

      expectPanelQuizzes("Wszystkie", [...ELECTORAL_TITLES, ...SOCIAL_TITLES]);
      expect(ELECTORAL_TITLES.length + SOCIAL_TITLES.length).toBe(
        HOME_QUIZZES.length,
      );
    });

    it("renders the two actions after the quizzes", () => {
      renderPage();

      expect(
        screen.getByRole("button", { name: "Zobacz więcej" }),
      ).toBeEnabled();
      expect(
        screen.getByRole("button", { name: "Stwórz własny" }),
      ).toBeEnabled();
    });
  });

  describe("when the user chooses the electoral tab", () => {
    it("lists the electoral quizzes only", () => {
      renderPage();

      fireEvent.click(screen.getByRole("tab", { name: "Wyborcze" }));

      expectPanelQuizzes("Wyborcze", ELECTORAL_TITLES);
    });
  });

  describe("when the user chooses the social tab", () => {
    it("lists the social quizzes only", () => {
      renderPage();

      fireEvent.click(screen.getByRole("tab", { name: "Społecznościowe" }));

      expectPanelQuizzes("Społecznościowe", SOCIAL_TITLES);
    });
  });

  describe("when the featured quiz is started", () => {
    it("opens the address of that quiz", () => {
      const router = renderPage();

      fireEvent.click(
        getFeaturedCard().getByRole("button", { name: "Rozpocznij quiz" }),
      );

      expect(router.state.location.pathname).toBe(PATHS.quiz(FEATURED_QUIZ.id));
      expect(router.state.location.pathname).toBe("/quizzes/mypolitics");
      expect(screen.getByText("Strona quizu")).toBeInTheDocument();
    });
  });

  describe("when a quiz of the list is started", () => {
    it("opens the address of that quiz", () => {
      const router = renderPage();

      fireEvent.click(
        getQuizCard("Eurowyborczy 2024").getByRole("button", {
          name: "Rozpocznij quiz",
        }),
      );

      expect(router.state.location.pathname).toBe(
        PATHS.quiz("eurowyborczy-2024"),
      );
      expect(router.state.historyAction).toBe("PUSH");
    });

    it("opens the address of the quiz that was pressed, also one the app has no survey for", () => {
      const router = renderPage();

      fireEvent.click(
        getQuizCard("Filozoficzny").getByRole("button", {
          name: "Rozpocznij quiz",
        }),
      );

      expect(router.state.location.pathname).toBe("/quizzes/filozoficzny");
    });
  });

  describe("when the user presses an action that has nothing behind it yet", () => {
    it("stays on the page as it was", () => {
      const router = renderPage();

      fireEvent.click(screen.getByRole("button", { name: "Zobacz więcej" }));

      expect(router.state.location.pathname).toBe(PATHS.home);
      expectPanelQuizzes("Wszystkie", [...ELECTORAL_TITLES, ...SOCIAL_TITLES]);
    });
  });

  describe("when a signed-out visitor presses the create button", () => {
    it("asks them to sign in, saying the quiz is kept on the account", async () => {
      renderPage();

      fireEvent.click(screen.getByRole("button", { name: "Stwórz własny" }));

      const dialog = await screen.findByRole("dialog", {
        name: "Najpierw zaloguj się",
      });

      expect(dialog).toHaveAccessibleDescription(
        "Quiz zapiszemy na Twoim koncie. Pierwsze logowanie je zakłada.",
      );
    });
  });

  describe("when a signed-in person presses the create button", () => {
    it("opens no dialog and stays on the page", async () => {
      const router = renderPage(createAuthAccount());
      // The session is read when the page opens; let that answer arrive.
      await act(async () => undefined);

      fireEvent.click(screen.getByRole("button", { name: "Stwórz własny" }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(router.state.location.pathname).toBe(PATHS.home);
    });
  });
});
