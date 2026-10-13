import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import {
  exampleOrientationSide,
  exampleQuiz,
  orientationQuestions,
} from "../ComparisonQuestions.fixtures";
import { QuestionList } from "./QuestionList";
import type { QuestionListProps } from "./QuestionList.types";

const renderList = (props: Partial<QuestionListProps> = {}) => {
  const onToggle = vi.fn();
  const view = renderWithI18n(
    <QuestionList
      questions={orientationQuestions}
      other={exampleOrientationSide.orientation}
      openIds={[]}
      onToggle={onToggle}
      {...props}
    />,
  );

  return { ...view, onToggle };
};

const queryList = () => screen.queryByRole("list", { name: "Pytania" });
const getRows = () => within(queryList() as HTMLElement).getAllByRole("button");
const getLine = () => screen.getByRole("status");

describe("<QuestionList />", () => {
  describe("given questions", () => {
    it("is a list, named, with one item per question", () => {
      renderList();

      const list = queryList() as HTMLElement;

      expect(list.tagName).toBe("UL");
      expect([...list.children].every((item) => item.tagName === "LI")).toBe(
        true,
      );
      expect(list.children).toHaveLength(exampleQuiz.questions.length);
    });

    it("lists them in the order given, each a row with its text", () => {
      renderList();

      expect(getRows().map((row) => row.textContent)).toEqual(
        orientationQuestions.map(({ question }) =>
          expect.stringContaining(question.text),
        ),
      );
    });

    it("draws every row closed when none is open", () => {
      renderList();

      expect(getRows().map((row) => row.getAttribute("aria-expanded"))).toEqual(
        orientationQuestions.map(() => "false"),
      );
      expect(screen.queryByRole("group")).not.toBeInTheDocument();
    });

    it("says nothing in the line for an empty list", () => {
      renderList();

      expect(getLine()).toBeEmptyDOMElement();
      expect(getLine()).toHaveClass("empty:hidden");
    });

    it("takes the width of what it is put in", () => {
      const { container } = renderList();

      expect(container.firstElementChild).toHaveClass("w-full", "min-w-0");
    });
  });

  describe("given open rows", () => {
    it("opens those and no other", () => {
      renderList({ openIds: ["housing", "prices"] });

      expect(getRows().map((row) => row.getAttribute("aria-expanded"))).toEqual(
        ["false", "false", "false", "true", "false", "true", "false", "false"],
      );
    });

    it("shows both sides in each, the other side by its name", () => {
      renderList({ openIds: ["housing", "prices"] });

      expect(
        screen.getAllByRole("group", { name: "Progresywizm" }),
      ).toHaveLength(2);
      expect(screen.getAllByRole("group", { name: "Ty" })).toHaveLength(2);
    });

    it("ignores an open row that is not listed", () => {
      renderList({
        questions: orientationQuestions.slice(0, 2),
        openIds: ["housing"],
      });

      expect(screen.queryByRole("group")).not.toBeInTheDocument();
    });
  });

  describe("when a row is pressed", () => {
    it("says which question it was", () => {
      const { onToggle } = renderList();

      fireEvent.click(getRows()[3]);

      expect(onToggle).toHaveBeenCalledExactlyOnceWith("housing");
    });
  });

  describe("given nothing to list", () => {
    it("says so in a line, in place of the list", () => {
      renderList({ questions: [] });

      expect(getLine()).toHaveTextContent("Brak pytań do pokazania.");
      expect(queryList()).not.toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("keeps the line a status that was already there, so it is read out", () => {
      const { rerender } = renderList();
      const line = getLine();

      rerender(
        <I18nProvider i18n={i18n}>
          <QuestionList
            questions={[]}
            other={exampleOrientationSide.orientation}
            openIds={[]}
            onToggle={vi.fn()}
          />
        </I18nProvider>,
      );

      expect(getLine()).toBe(line);
      expect(line).toHaveTextContent("Brak pytań do pokazania.");
    });
  });
});
