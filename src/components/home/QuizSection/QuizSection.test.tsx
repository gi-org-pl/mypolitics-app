import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { HomeQuiz } from "@/types/home";
import { createMessage } from "@/utils/vitest/createMessage";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { QuizSection } from "./QuizSection";

const ELECTORAL_TITLE = "Wyborczy 2023";
const SOCIAL_TITLE = "Polskie Lata 90.";
const EMPTY_TEXT = "Nie ma jeszcze quizów tego rodzaju.";

const QUIZZES: HomeQuiz[] = [
  {
    id: "wyborczy-2023",
    name: createMessage("Wyborczy 2023"),
    categories: ["electoral"],
    tags: [],
  },
  {
    id: "polskie-lata-90",
    name: createMessage("Polskie Lata 90."),
    categories: ["social"],
    tags: [],
  },
];

const renderSection = (quizzes: HomeQuiz[] = QUIZZES) => {
  const onQuizStart = vi.fn();
  const onShowMore = vi.fn();
  const onCreate = vi.fn();

  renderWithI18n(
    <QuizSection
      quizzes={quizzes}
      onQuizStart={onQuizStart}
      onShowMore={onShowMore}
      onCreate={onCreate}
    />,
  );

  return { onQuizStart, onShowMore, onCreate };
};

const getTab = (name: string) => screen.getByRole("tab", { name });

const getCardTitles = (panelName: string) =>
  within(screen.getByRole("tabpanel", { name: panelName }))
    .queryAllByRole("heading")
    .map((heading) => heading.textContent);

describe("<QuizSection />", () => {
  describe("when it is rendered", () => {
    it("selects the tab of all quizzes", () => {
      renderSection();

      expect(getTab("Wszystkie")).toHaveAttribute("aria-selected", "true");
    });

    it("lists every quiz in the panel of that tab", () => {
      renderSection();

      expect(getCardTitles("Wszystkie")).toEqual([
        ELECTORAL_TITLE,
        SOCIAL_TITLE,
      ]);
    });

    it("gives the panel the id its tab controls", () => {
      renderSection();

      expect(screen.getByRole("tabpanel")).toHaveAttribute(
        "id",
        getTab("Wszystkie").getAttribute("aria-controls"),
      );
    });

    it("renders the actions below the list", () => {
      renderSection();

      expect(
        screen.getByRole("button", { name: "Zobacz więcej" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Stwórz własny" }),
      ).toBeInTheDocument();
    });
  });

  describe("when the electoral tab is chosen", () => {
    it("selects it and lists the electoral quizzes only", () => {
      renderSection();

      fireEvent.click(getTab("Wyborcze"));

      expect(getTab("Wyborcze")).toHaveAttribute("aria-selected", "true");
      expect(getTab("Wszystkie")).toHaveAttribute("aria-selected", "false");
      expect(getCardTitles("Wyborcze")).toEqual([ELECTORAL_TITLE]);
    });
  });

  describe("when the social tab is chosen", () => {
    it("lists the social quizzes only", () => {
      renderSection();

      fireEvent.click(getTab("Społecznościowe"));

      expect(getCardTitles("Społecznościowe")).toEqual([SOCIAL_TITLE]);
    });
  });

  describe("when the tab of all quizzes is chosen again", () => {
    it("lists every quiz again", () => {
      renderSection();

      fireEvent.click(getTab("Wyborcze"));
      fireEvent.click(getTab("Wszystkie"));

      expect(getCardTitles("Wszystkie")).toEqual([
        ELECTORAL_TITLE,
        SOCIAL_TITLE,
      ]);
    });
  });

  describe("when the right arrow is pressed on the selected tab", () => {
    it("selects the next tab and shows its quizzes", () => {
      renderSection();

      fireEvent.keyDown(getTab("Wszystkie"), { key: "ArrowRight" });

      expect(getTab("Wyborcze")).toHaveAttribute("aria-selected", "true");
      expect(getTab("Wyborcze")).toHaveFocus();
      expect(getCardTitles("Wyborcze")).toEqual([ELECTORAL_TITLE]);
    });
  });

  describe("when a tab has no quizzes", () => {
    it("says so in the panel of that tab", () => {
      renderSection([QUIZZES[0]]);

      fireEvent.click(getTab("Społecznościowe"));

      expect(
        within(
          screen.getByRole("tabpanel", { name: "Społecznościowe" }),
        ).getByText(EMPTY_TEXT),
      ).toBeInTheDocument();
    });
  });

  describe("when the play button of a quiz is pressed", () => {
    it("calls onQuizStart with the id of that quiz", () => {
      const { onQuizStart } = renderSection();
      const [, socialCard] = screen.getAllByRole("article");

      fireEvent.click(
        within(socialCard).getByRole("button", { name: "Rozpocznij quiz" }),
      );

      expect(onQuizStart).toHaveBeenCalledTimes(1);
      expect(onQuizStart).toHaveBeenCalledWith("polskie-lata-90");
    });
  });

  describe("when the actions are pressed", () => {
    it("calls onShowMore for more quizzes", () => {
      const { onShowMore } = renderSection();

      fireEvent.click(screen.getByRole("button", { name: "Zobacz więcej" }));

      expect(onShowMore).toHaveBeenCalledTimes(1);
    });

    it("calls onCreate for an own quiz", () => {
      const { onCreate } = renderSection();

      fireEvent.click(screen.getByRole("button", { name: "Stwórz własny" }));

      expect(onCreate).toHaveBeenCalledTimes(1);
    });
  });
});
