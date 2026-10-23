import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Agreement, type ComparedQuestion } from "@/types/comparison";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import {
  exampleFriendSide,
  exampleOrientationSide,
  findCompared,
  friendQuestions,
  orientationQuestions,
} from "../../ComparisonQuestions.fixtures";
import { QuestionRow } from "./QuestionRow";
import { ROW_TINT_CLASS_NAMES } from "./QuestionRow.constants";
import type { QuestionRowProps } from "./QuestionRow.types";

const HOUSING = "Jaki jest najlepszy sposób na walkę z kryzysem mieszkaniowym?";

const withOrientation = (questionId: string): Partial<QuestionRowProps> => ({
  compared: findCompared(orientationQuestions, questionId),
  other: exampleOrientationSide.orientation,
});

const withFriend = (questionId: string): Partial<QuestionRowProps> => ({
  compared: findCompared(friendQuestions, questionId),
  other: exampleFriendSide.orientation,
});

const renderRow = (props: Partial<QuestionRowProps> = {}) => {
  const onToggle = vi.fn();
  const view = renderWithI18n(
    <QuestionRow
      compared={findCompared(orientationQuestions, "housing")}
      other={exampleOrientationSide.orientation}
      isOpen={false}
      onToggle={onToggle}
      {...props}
    />,
  );

  return { ...view, onToggle };
};

const renderOpen = (props: Partial<QuestionRowProps>) =>
  renderRow({ ...props, isOpen: true });

const getControl = () => screen.getByRole("button");
const getSide = (name: string) => screen.getByRole("group", { name });

const getAnswers = (side: string) =>
  within(getSide(side))
    .getAllByRole("listitem")
    .map((answer) => answer.textContent);

const getMarks = (side: string) =>
  within(getSide(side))
    .queryAllByRole("img")
    .map((mark) => mark.getAttribute("alt"));

describe("<QuestionRow />", () => {
  describe("given a question", () => {
    it("is one control with the text of the question", () => {
      renderRow();

      expect(screen.getAllByRole("button")).toHaveLength(1);
      expect(getControl()).toHaveTextContent(HOUSING);
    });

    it("writes the text in full, on as many lines as it takes", () => {
      renderRow();

      expect(screen.getByText(HOUSING)).toHaveClass("wrap-break-word");
      expect(screen.getByText(HOUSING)).not.toHaveClass("truncate");
    });

    it("takes the width of what it is put in", () => {
      const { container } = renderRow();

      expect(container.firstElementChild).toHaveClass("w-full", "min-w-0");
    });
  });

  describe("given how the two sides stand on the question", () => {
    it.each([
      ["democracy", Agreement.Agree, "Zgodność", "bg-emerald-600/5"],
      ["housing", Agreement.Disagree, "Niezgodność", "bg-gi-red/5"],
      ["rents", Agreement.Neither, "Brak porównania", ""],
    ] as [
      string,
      Agreement,
      string,
      string,
    ][])("says it in a word and tints the row: %s is %s", (questionId, agreement, word, tint) => {
      const { compared } = withOrientation(questionId) as {
        compared: ComparedQuestion;
      };

      renderRow({ compared });

      expect(compared.agreement).toBe(agreement);
      expect(getControl()).toHaveAccessibleName(
        `${compared.question.text} ${word}`,
      );
      expect(ROW_TINT_CLASS_NAMES[agreement]).toBe(tint);
      expect(getControl().className).toContain(tint);
      expect(getControl().className.includes("bg-")).toBe(tint !== "");
    });

    it("tints an agreeing row green and a disagreeing one red", () => {
      const agreeing = renderRow(withOrientation("democracy"));

      expect(getControl()).toHaveClass("bg-emerald-600/5");
      agreeing.unmount();
      renderRow(withOrientation("housing"));

      expect(getControl()).toHaveClass("bg-gi-red/5");
    });

    it("keeps the word out of sight where the tint is drawn, and writes it out where colours are forced", () => {
      renderRow();

      expect(screen.getByText("Niezgodność")).toHaveClass(
        "sr-only",
        "forced-colors:not-sr-only",
      );
    });
  });

  describe("given a closed row", () => {
    it("says it is closed, and shows no side", () => {
      renderRow();

      expect(getControl()).toHaveAttribute("aria-expanded", "false");
      expect(getControl()).not.toHaveAttribute("aria-controls");
      expect(screen.queryByRole("group")).not.toBeInTheDocument();
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });
  });

  describe("when the row is pressed", () => {
    it("says which question was pressed, and opens nothing by itself", () => {
      const { onToggle } = renderRow();

      fireEvent.click(getControl());

      expect(onToggle).toHaveBeenCalledExactlyOnceWith("housing");
      expect(getControl()).toHaveAttribute("aria-expanded", "false");
    });

    it("says so when an open row is pressed too", () => {
      const { onToggle } = renderOpen({});

      fireEvent.click(getControl());

      expect(onToggle).toHaveBeenCalledExactlyOnceWith("housing");
    });
  });

  describe("given an open row", () => {
    it("says it is open, and names what it opened", () => {
      renderOpen({});

      const controlled = getControl().getAttribute("aria-controls") as string;

      expect(getControl()).toHaveAttribute("aria-expanded", "true");
      expect(document.getElementById(controlled)).toContainElement(
        getSide("Ty"),
      );
    });

    it("shows both sides, each named: the other side first, then the taker", () => {
      renderOpen({});

      expect(
        screen
          .getAllByRole("group")
          .map((side) => side.getAttribute("aria-label")),
      ).toEqual(["Progresywizm", "Ty"]);
    });

    it("keeps the tint on the question, not on the answers", () => {
      renderOpen({});

      expect(getControl()).toHaveClass("bg-gi-red/5");
      expect(getSide("Ty").closest("[id]")?.className.includes("bg-")).toBe(
        false,
      );
    });

    it("draws the sides next to each other from the narrow width of the design, and one under the other below it", () => {
      const { container } = renderOpen({});

      expect(container.firstElementChild).toHaveClass("@container");
      expect(getSide("Ty").parentElement).toHaveClass(
        "grid",
        "grid-cols-1",
        "@[19.875rem]:grid-cols-2",
      );
    });

    it("says how much room the name of the other side has: its own half under each other, and up to the name of the taker next to each other", () => {
      renderOpen({});

      expect(getSide("Ty").parentElement).toHaveClass(
        "[--side-name-room:100%]",
        "@[19.875rem]:[--side-name-room:calc(200%+0.5rem-5rem)]",
      );
    });
  });

  describe("given an open row of a comparison with an orientation", () => {
    it("shows the answer of the taker, and the one answer of the orientation with a cross when the taker chose another", () => {
      renderOpen(withOrientation("housing"));

      expect(getAnswers("Progresywizm")).toEqual([
        "Budowa tanich mieszkań na wynajem z publicznych pieniędzy",
      ]);
      expect(getMarks("Progresywizm")).toEqual(["Niezgodność"]);
      expect(getAnswers("Ty")).toEqual([
        "Rząd nie powinien interweniować na rynku mieszkaniowym",
      ]);
    });

    it("shows every answer of the orientation: a tick on the one of the taker, a cross on the rest", () => {
      renderOpen(withOrientation("prices"));

      expect(getAnswers("Progresywizm")).toEqual([
        "Rząd nie powinien interweniować na rynku mieszkaniowym",
        "Uproszczenie prawa budowlanego",
      ]);
      expect(getMarks("Progresywizm")).toEqual(["Zgodność", "Niezgodność"]);
    });

    it('says "no answer" for an orientation no answer of the question lists', () => {
      renderOpen(withOrientation("rents"));

      expect(getAnswers("Progresywizm")).toEqual(["Brak odpowiedzi"]);
      expect(getMarks("Progresywizm")).toEqual([]);
      expect(getAnswers("Ty")).toEqual([
        "Rząd nie powinien interweniować na rynku mieszkaniowym",
      ]);
    });

    it('says "no answer" for a taker who skipped the question, and marks no answer of the orientation', () => {
      renderOpen(withOrientation("army"));

      expect(getAnswers("Ty")).toEqual(["Brak odpowiedzi"]);
      expect(getAnswers("Progresywizm")).toEqual([
        "Częściowo przeciw",
        "Zdecydowanie przeciw",
      ]);
      expect(getMarks("Progresywizm")).toEqual([]);
    });

    it("never marks the answer of the taker", () => {
      renderOpen(withOrientation("prices"));

      expect(getMarks("Ty")).toEqual([]);
    });
  });

  describe("given an open row of a comparison with a friend", () => {
    it("shows the answer each chose, with a tick on the friend's when both chose the same", () => {
      renderOpen(withFriend("democracy"));

      expect(getAnswers("Znajomy")).toEqual(["Zdecydowanie za"]);
      expect(getMarks("Znajomy")).toEqual(["Zgodność"]);
      expect(getAnswers("Ty")).toEqual(["Zdecydowanie za"]);
    });

    it("shows a cross on the answer of the friend when the two chose differently", () => {
      renderOpen(withFriend("future"));

      expect(getAnswers("Znajomy")).toEqual(["Wyjście z Unii Europejskiej"]);
      expect(getMarks("Znajomy")).toEqual(["Niezgodność"]);
      expect(getAnswers("Ty")).toEqual(["Dalsza integracja z Unią Europejską"]);
    });

    it('says "no answer" for a friend who skipped the question', () => {
      renderOpen(withFriend("rents"));

      expect(getAnswers("Znajomy")).toEqual(["Brak odpowiedzi"]);
      expect(getMarks("Znajomy")).toEqual([]);
    });

    it('says "no answer" for a taker who skipped the question, and leaves the answer of the friend unmarked', () => {
      renderOpen(withFriend("army"));

      expect(getAnswers("Ty")).toEqual(["Brak odpowiedzi"]);
      expect(getAnswers("Znajomy")).toEqual(["Zdecydowanie przeciw"]);
      expect(getMarks("Znajomy")).toEqual([]);
    });
  });
});
