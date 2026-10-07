import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { HomeQuiz } from "@/types/home";
import { createMessage } from "@/utils/vitest/createMessage";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { QuizSectionList } from "./QuizSectionList";

const PANEL = { id: "panel-all", labelledBy: "tab-all" };
const EMPTY_TEXT = "Nie ma jeszcze quizów tego rodzaju.";

const QUIZZES: HomeQuiz[] = [
  {
    id: "polskie-lata-90",
    name: createMessage("Polskie Lata 90."),
    categories: ["social"],
    tags: [],
  },
  {
    id: "600-pytan",
    name: createMessage("600+ pytań"),
    categories: ["social"],
    tags: [],
  },
];

const renderList = (quizzes: HomeQuiz[] = QUIZZES) => {
  const onQuizStart = vi.fn();

  renderWithI18n(
    <>
      <span id={PANEL.labelledBy}>Wszystkie</span>
      <QuizSectionList
        panel={PANEL}
        quizzes={quizzes}
        onQuizStart={onQuizStart}
      />
    </>,
  );

  return { onQuizStart };
};

const getPanel = () => screen.getByRole("tabpanel", { name: "Wszystkie" });

describe("<QuizSectionList />", () => {
  describe("when it gets quizzes", () => {
    it("is the tab panel with the given id, named by its tab", () => {
      renderList();

      expect(getPanel()).toHaveAttribute("id", PANEL.id);
    });

    it("renders one card per quiz, in the given order", () => {
      renderList();

      expect(
        within(getPanel())
          .getAllByRole("heading")
          .map((heading) => heading.textContent),
      ).toEqual(["Polskie Lata 90.", "600+ pytań"]);
      expect(screen.queryByText(EMPTY_TEXT)).not.toBeInTheDocument();
    });
  });

  describe("when the play button of a card is pressed", () => {
    it("calls onQuizStart with the id of that quiz", () => {
      const { onQuizStart } = renderList();
      const [, secondCard] = within(getPanel()).getAllByRole("article");

      fireEvent.click(
        within(secondCard).getByRole("button", { name: "Rozpocznij quiz" }),
      );

      expect(onQuizStart).toHaveBeenCalledTimes(1);
      expect(onQuizStart).toHaveBeenCalledWith("600-pytan");
    });
  });

  describe("when the list of quizzes is empty", () => {
    it("says that there are no such quizzes yet, inside the panel", () => {
      renderList([]);

      expect(within(getPanel()).getByText(EMPTY_TEXT)).toBeInTheDocument();
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });
  });
});
