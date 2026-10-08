import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  FEATURED_QUIZ,
  HOME_PARTNER_SECTIONS,
  HOME_PROMOTIONS,
  HOME_QUIZZES,
} from "@/constants/home";
import { PATHS } from "@/constants/paths";
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

const getFeaturedCard = () => {
  const [card] = screen.getAllByRole("article");

  return within(card);
};

describe("<HomePage />", () => {
  describe("when a user opens the home page", () => {
    it("renders the promotion banner with the promotion of the content", () => {
      renderWithI18n(<HomePage />);

      expect(
        screen.getByRole("link", { name: PROMOTION_NAME }),
      ).toHaveAttribute("href", HOME_PROMOTIONS[0].url);
    });

    it("renders the featured quiz with the start label, before every other card", () => {
      renderWithI18n(<HomePage />);

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
      renderWithI18n(<HomePage />);

      expect(
        screen.getByRole("img", { name: "Podgląd wyników quizu myPolitics" }),
      ).toBeInTheDocument();
    });

    it("renders the three features, the last one with a link to the white paper", () => {
      renderWithI18n(<HomePage />);

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
      renderWithI18n(<HomePage />);

      for (const { title } of HOME_PARTNER_SECTIONS[0].partners) {
        expect(screen.getByRole("img", { name: title })).toBeInTheDocument();
      }
    });

    it("renders the quiz tabs with all quizzes selected", () => {
      renderWithI18n(<HomePage />);

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
      renderWithI18n(<HomePage />);

      expectPanelQuizzes("Wszystkie", [...ELECTORAL_TITLES, ...SOCIAL_TITLES]);
      expect(ELECTORAL_TITLES.length + SOCIAL_TITLES.length).toBe(
        HOME_QUIZZES.length,
      );
    });

    it("renders the two actions after the quizzes", () => {
      renderWithI18n(<HomePage />);

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
      renderWithI18n(<HomePage />);

      fireEvent.click(screen.getByRole("tab", { name: "Wyborcze" }));

      expectPanelQuizzes("Wyborcze", ELECTORAL_TITLES);
    });
  });

  describe("when the user chooses the social tab", () => {
    it("lists the social quizzes only", () => {
      renderWithI18n(<HomePage />);

      fireEvent.click(screen.getByRole("tab", { name: "Społecznościowe" }));

      expectPanelQuizzes("Społecznościowe", SOCIAL_TITLES);
    });
  });

  describe("when the user presses an action that has nothing behind it yet", () => {
    it("stays on the page as it was", () => {
      renderWithI18n(<HomePage />);

      fireEvent.click(getFeaturedCard().getByRole("button"));
      fireEvent.click(screen.getByRole("button", { name: "Zobacz więcej" }));
      fireEvent.click(screen.getByRole("button", { name: "Stwórz własny" }));

      expectPanelQuizzes("Wszystkie", [...ELECTORAL_TITLES, ...SOCIAL_TITLES]);
    });
  });
});
