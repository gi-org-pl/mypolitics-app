import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import type { ComparisonViewProps } from "../../ResultsComparison.types";
import { ComparisonQuestions } from "./ComparisonQuestions";
import {
  exampleFriendView,
  exampleOrientationView,
  exampleQuiz,
  longFriendView,
} from "./ComparisonQuestions.fixtures";

// Every row of the table "Questions" of the spec, for both kinds of other
// side. The quiz of the example has a question for each case - see its
// fixture.

const HOUSING = "Jaki jest najlepszy sposób na walkę z kryzysem mieszkaniowym?";
const EVERY_TEXT = exampleQuiz.questions.map(({ text }) => text);

const renderView = (props: ComparisonViewProps = exampleOrientationView) =>
  renderWithI18n(<ComparisonQuestions {...props} />);

const getSearch = () => screen.getByRole("searchbox", { name: "Szukaj" });
const getFilter = () =>
  screen.getByRole("switch", { name: "Tylko niezgodność" });
const queryList = () => screen.queryByRole("list", { name: "Pytania" });

const getRows = () =>
  queryList() ? within(queryList() as HTMLElement).getAllByRole("button") : [];

const getRow = (text: string) =>
  screen.getByRole("button", { name: (name) => name.startsWith(text) });

// The texts of the listed questions, without the word for their agreement.
const getTexts = () =>
  getRows().map((row) => row.firstElementChild?.firstChild?.textContent);

const search = (text: string) =>
  fireEvent.change(getSearch(), { target: { value: text } });

const open = (text: string) => fireEvent.click(getRow(text));
const getSide = (name: string) => screen.getByRole("group", { name });

const getAnswers = (side: string) =>
  within(getSide(side))
    .getAllByRole("listitem")
    .map((answer) => answer.textContent);

const getMarks = (side: string) =>
  within(getSide(side))
    .queryAllByRole("img")
    .map((mark) => mark.getAttribute("alt"));

describe("<ComparisonQuestions />", () => {
  describe("the list", () => {
    it.each([
      ["an orientation", exampleOrientationView],
      ["a friend", exampleFriendView],
    ])("lists every question of the quiz, in the order of the quiz, each a collapsed row with its text: %s", (_, view) => {
      renderView(view);

      expect(getTexts()).toEqual(EVERY_TEXT);
      expect(
        getRows().every((row) => row.getAttribute("aria-expanded") === "false"),
      ).toBe(true);
      expect(screen.queryByRole("group")).not.toBeInTheDocument();
    });

    it("is a list for a screen reader, with an item per question", () => {
      renderView();

      expect(
        within(queryList() as HTMLElement).getAllByRole("listitem"),
      ).toHaveLength(exampleQuiz.questions.length);
    });

    it("stands under a search field with a label and a switch, with nothing searched for and the switch off", () => {
      renderView();

      expect(getSearch()).toHaveValue("");
      expect(getFilter()).toHaveAttribute("aria-checked", "false");
    });

    it("lists every question of a long quiz", () => {
      renderView(longFriendView);

      expect(getRows()).toHaveLength(102);
    });
  });

  describe("a row", () => {
    it("is tinted by its agreement with an orientation, and says it in a word: agree, disagree, or neither", () => {
      renderView();

      expect(
        getRows().map((row) => row.querySelector(".sr-only")?.textContent),
      ).toEqual([
        "Zgodność",
        "Zgodność",
        "Niezgodność",
        "Niezgodność",
        "Brak porównania",
        "Zgodność",
        "Zgodność",
        "Brak porównania",
      ]);
      expect(getRows()[0]).toHaveClass("bg-emerald-600/5");
      expect(getRows()[2]).toHaveClass("bg-gi-red/5");
      expect(getRows()[4].className).not.toContain("bg-");
    });

    it("is tinted by its agreement with a friend, and says it in a word", () => {
      renderView(exampleFriendView);

      expect(
        getRows().map((row) => row.querySelector(".sr-only")?.textContent),
      ).toEqual([
        "Zgodność",
        "Niezgodność",
        "Zgodność",
        "Niezgodność",
        "Brak porównania",
        "Niezgodność",
        "Zgodność",
        "Brak porównania",
      ]);
    });
  });

  describe("when a row is opened", () => {
    it("shows both sides, each named", () => {
      renderView();

      open(HOUSING);

      expect(getRow(HOUSING)).toHaveAttribute("aria-expanded", "true");
      expect(
        screen
          .getAllByRole("group")
          .map((side) => side.getAttribute("aria-label")),
      ).toEqual(["Progresywizm", "Ty"]);
    });

    it("shows the chosen answer of the taker and of a friend", () => {
      renderView(exampleFriendView);

      open("Jaka powinna być przyszłość");

      expect(getAnswers("Ty")).toEqual(["Dalsza integracja z Unią Europejską"]);
      expect(getAnswers("Znajomy")).toEqual(["Wyjście z Unii Europejskiej"]);
    });

    it("shows every answer of an orientation to the question", () => {
      renderView();

      open("Co najszybciej");

      expect(getAnswers("Progresywizm")).toEqual([
        "Rząd nie powinien interweniować na rynku mieszkaniowym",
        "Uproszczenie prawa budowlanego",
      ]);
      expect(getAnswers("Ty")).toEqual([
        "Rząd nie powinien interweniować na rynku mieszkaniowym",
      ]);
    });

    it("marks each answer of the other side with a tick when it is the taker's answer and a cross when it is not", () => {
      renderView();

      open("Co najszybciej");

      expect(getMarks("Progresywizm")).toEqual(["Zgodność", "Niezgodność"]);
      expect(getMarks("Ty")).toEqual([]);
    });

    it("closes when it is pressed again", () => {
      renderView();

      open(HOUSING);
      open(HOUSING);

      expect(getRow(HOUSING)).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByRole("group")).not.toBeInTheDocument();
    });

    it("leaves the other rows as they are", () => {
      renderView();

      open(HOUSING);
      open("Co najszybciej");

      expect(
        getRows().filter((row) => row.getAttribute("aria-expanded") === "true"),
      ).toHaveLength(2);
      expect(screen.getAllByRole("group", { name: "Ty" })).toHaveLength(2);
    });
  });

  describe("a side with nothing to show", () => {
    it('says "no answer" for an orientation no answer of the question lists', () => {
      renderView();

      open("Kto powinien ustalać");

      expect(getAnswers("Progresywizm")).toEqual(["Brak odpowiedzi"]);
      expect(getAnswers("Ty")).toEqual([
        "Rząd nie powinien interweniować na rynku mieszkaniowym",
      ]);
    });

    it('says "no answer" for a friend who did not answer the question', () => {
      renderView(exampleFriendView);

      open("Kto powinien ustalać");

      expect(getAnswers("Znajomy")).toEqual(["Brak odpowiedzi"]);
    });

    it.each([
      ["an orientation", exampleOrientationView, "Progresywizm"],
      ["a friend", exampleFriendView, "Znajomy"],
    ])('says "no answer" for a taker who skipped the question, and marks nothing: %s', (_, view, other) => {
      renderView(view);

      open("Służba wojskowa");

      expect(getAnswers("Ty")).toEqual(["Brak odpowiedzi"]);
      expect(getAnswers(other)).not.toContain("Brak odpowiedzi");
      expect(getMarks(other)).toEqual([]);
    });
  });

  describe("the search", () => {
    it("narrows the list by the text of the question, ignoring case", () => {
      renderView();

      search("UNI");

      expect(getTexts()).toEqual([
        "Unia Europejska dba o demokrację w Polsce.",
        "Jaka powinna być przyszłość Polski w Unii Europejskiej?",
      ]);
      expect(getSearch()).toHaveValue("UNI");
    });

    it("lists every question again when it is cleared", () => {
      renderView();

      search("unia");
      search("");

      expect(getTexts()).toEqual(EVERY_TEXT);
    });

    it("keeps an opened row open when the search takes it off the list and back", () => {
      renderView();

      open(HOUSING);
      search("unia");

      expect(screen.queryByRole("group")).not.toBeInTheDocument();

      search("");

      expect(getRow(HOUSING)).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe('when "only disagreements" is on', () => {
    it("lists only the rows that disagree with an orientation", () => {
      renderView();

      fireEvent.click(getFilter());

      expect(getFilter()).toHaveAttribute("aria-checked", "true");
      expect(getTexts()).toEqual([
        "W większości przypadków mężczyzna powinien być głównym żywicielem rodziny.",
        HOUSING,
      ]);
    });

    it("lists only the rows that disagree with a friend", () => {
      renderView(exampleFriendView);

      fireEvent.click(getFilter());

      expect(getTexts()).toEqual([
        "Jaka powinna być przyszłość Polski w Unii Europejskiej?",
        HOUSING,
        "Co najszybciej obniży ceny mieszkań?",
      ]);
    });

    it("lists every question again when it is turned off", () => {
      renderView();

      fireEvent.click(getFilter());
      fireEvent.click(getFilter());

      expect(getTexts()).toEqual(EVERY_TEXT);
    });
  });

  describe("when the search and the switch are both on", () => {
    it("lists only the rows that pass both", () => {
      renderView();

      search("mieszka");
      fireEvent.click(getFilter());

      expect(getTexts()).toEqual([HOUSING]);
    });
  });

  describe("when nothing is left to list", () => {
    it("says so in a line, in place of the list: nothing is found", () => {
      renderView();

      search("podatki");

      expect(screen.getByRole("status")).toHaveTextContent(
        "Brak pytań do pokazania.",
      );
      expect(queryList()).not.toBeInTheDocument();
    });

    it("says so when no row passes both the search and the switch", () => {
      renderView();

      search("unia");
      fireEvent.click(getFilter());

      expect(screen.getByRole("status")).toHaveTextContent(
        "Brak pytań do pokazania.",
      );
    });

    it("says so for a quiz with no questions", () => {
      renderView({
        ...exampleOrientationView,
        survey: { ...exampleQuiz, questions: [] },
      });

      expect(screen.getByRole("status")).toHaveTextContent(
        "Brak pytań do pokazania.",
      );
    });

    it("says nothing while there is something to list", () => {
      renderView();

      expect(screen.getByRole("status")).toBeEmptyDOMElement();
    });
  });

  describe("given any comparison", () => {
    it("takes the width of what it is put in, and is a container", () => {
      const { container } = renderView();

      expect(container.firstElementChild).toHaveClass(
        "@container",
        "w-full",
        "min-w-0",
      );
    });
  });
});
