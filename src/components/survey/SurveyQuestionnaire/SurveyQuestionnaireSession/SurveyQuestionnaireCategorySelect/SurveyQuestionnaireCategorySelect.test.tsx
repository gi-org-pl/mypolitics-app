import { fireEvent, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { Survey, SurveySession } from "@/types/survey";
import { getCategoryLimit } from "@/utils/survey/categories/getCategoryLimit";
import { createSession } from "@/utils/survey/session/createSession";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";
import { createSurveyCategory } from "@/utils/vitest/survey/createSurveyCategory";
import { renderPhaseContent } from "@/utils/vitest/survey/renderPhaseContent";

import { SurveyQuestionnaireCategorySelect } from "./SurveyQuestionnaireCategorySelect";

// Five visible categories and a hidden one: a limit of three.
const createQuiz = (overrides: Partial<Survey> = {}): Survey =>
  createSurvey({
    id: crypto.randomUUID(),
    categories: [
      createSurveyCategory("a", { name: "Światopogląd" }),
      createSurveyCategory("b", { name: "Ustrój" }),
      createSurveyCategory("hidden", { name: "Kontrolne", isHidden: true }),
      createSurveyCategory("c", { name: "Gospodarka" }),
      createSurveyCategory("d", { name: "Polityka zagraniczna" }),
      createSurveyCategory("e", { name: "Ekologia" }),
    ],
    ...overrides,
  });

const renderPhase = (
  survey = createQuiz(),
  overrides: Partial<SurveySession> = {},
) =>
  renderPhaseContent(SurveyQuestionnaireCategorySelect, survey, {
    ...createSession(survey),
    ...overrides,
  });

// A quiz with that many visible categories, named "Kategoria 1" and so on.
const createQuizOf = (visible: number): Survey =>
  createQuiz({
    categories: Array.from({ length: visible }, (_, index) =>
      createSurveyCategory(`category-${index + 1}`, {
        name: `Kategoria ${index + 1}`,
      }),
    ),
  });

const getRow = (name: string) => screen.getByRole("button", { name });

const getContinueButton = () =>
  screen.getByRole("button", { name: "Idziemy dalej" });

const getSkipButton = () => screen.getByRole("button", { name: "Pomiń" });

describe("<SurveyQuestionnaireCategorySelect />", () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  describe("when the phase opens", () => {
    it("lists the visible categories of the quiz with the limit of the quiz", () => {
      renderPhase();

      const group = screen.getByRole("group", {
        name: "Wybierz 3 najważniejsze dla Ciebie tematy.",
      });

      expect(
        within(group)
          .getAllByRole("button")
          .map((row) => row.textContent),
      ).toEqual([
        "Światopogląd",
        "Ustrój",
        "Gospodarka",
        "Polityka zagraniczna",
        "Ekologia",
      ]);

      for (const row of within(group).getAllByRole("button")) {
        expect(row).toHaveAttribute("aria-pressed", "false");
      }
    });

    it("names a limit of one for a quiz with two visible categories", () => {
      renderPhase(createSurvey({ id: crypto.randomUUID() }));

      expect(
        screen.getByRole("group", {
          name: "Wybierz 1 najważniejszy dla Ciebie temat.",
        }),
      ).toBeInTheDocument();
    });

    it("draws a row for each of two categories with the same name", () => {
      renderPhase(
        createQuiz({
          categories: [
            createSurveyCategory("a", { name: "Gospodarka" }),
            createSurveyCategory("b", { name: "Gospodarka" }),
            createSurveyCategory("c", { name: "Ekologia" }),
          ],
        }),
      );

      expect(
        screen.getAllByRole("button", { name: "Gospodarka" }),
      ).toHaveLength(2);
    });

    it("shows the categories the session holds as picked", () => {
      renderPhase(undefined, { prioritizedCategoryIds: ["b"] });

      expect(getRow("Ustrój")).toHaveAttribute("aria-pressed", "true");
      expect(getRow("Ekologia")).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("when a row is pressed", () => {
    it("passes a toggle to setCategories", () => {
      const { getSession } = renderPhase();

      fireEvent.click(getRow("Gospodarka"));
      fireEvent.click(getRow("Ustrój"));

      expect(getSession().prioritizedCategoryIds).toEqual(["c", "b"]);
      expect(getRow("Gospodarka")).toHaveAttribute("aria-pressed", "true");

      fireEvent.click(getRow("Gospodarka"));

      expect(getSession().prioritizedCategoryIds).toEqual(["b"]);
      expect(getSession().phase).toBe("category-select");
    });
  });

  describe("when the number of picked categories reaches the limit", () => {
    it("draws the other rows disabled and adds no line", () => {
      renderPhase(undefined, { prioritizedCategoryIds: ["a", "b", "c"] });

      expect(getRow("Polityka zagraniczna")).toBeDisabled();
      expect(getRow("Ekologia")).toBeDisabled();
      expect(getRow("Ustrój")).toBeEnabled();
      expect(screen.getAllByRole("button")).toHaveLength(7);
      expect(screen.getByRole("group").parentElement?.textContent).toBe(
        [
          "Wybierz 3 najważniejsze dla Ciebie tematy.",
          "Światopogląd",
          "Ustrój",
          "Gospodarka",
          "Polityka zagraniczna",
          "Ekologia",
          "Idziemy dalej",
          "Pomiń",
        ].join(""),
      );
    });
  });

  describe("given a quiz with another number of visible categories", () => {
    it.each([
      [2, 1],
      [4, 2],
      [6, 3],
      [7, 4],
      [9, 5],
    ])("lets %i categories be narrowed down to the limit of the quiz, %i", (visible, limit) => {
      const survey = createQuizOf(visible);
      const { getSession } = renderPhase(survey);
      const group = screen.getByRole("group");

      expect(getCategoryLimit(survey)).toBe(limit);
      expect(group).toHaveAccessibleName(
        expect.stringMatching(new RegExp(`^Wybierz ${limit} `)),
      );

      for (const row of within(group).getAllByRole("button")) {
        fireEvent.click(row);
      }

      expect(getSession().prioritizedCategoryIds).toEqual(
        survey.categories.slice(0, limit).map(({ id }) => id),
      );
      expect(
        within(group)
          .getAllByRole("button")
          .filter((row) => (row as HTMLButtonElement).disabled),
      ).toHaveLength(visible - limit);
    });
  });

  describe("given no category picked", () => {
    it('turns "Idziemy dalej" off, and keeps "Pomiń" working', () => {
      const { getSession } = renderPhase();

      expect(getContinueButton()).toBeDisabled();
      expect(getSkipButton()).toBeEnabled();

      fireEvent.click(getContinueButton());

      expect(getSession().phase).toBe("category-select");
    });
  });

  describe("given at least one category picked", () => {
    it('turns "Idziemy dalej" on with one category, below the limit and at it', () => {
      const { getSession } = renderPhase();

      fireEvent.click(getRow("Ustrój"));

      expect(getContinueButton()).toBeEnabled();

      fireEvent.click(getRow("Ekologia"));
      fireEvent.click(getRow("Gospodarka"));

      expect(getSession().prioritizedCategoryIds).toHaveLength(3);
      expect(getContinueButton()).toBeEnabled();
    });
  });

  describe('when "Idziemy dalej" is pressed', () => {
    it("confirms the categories: the first question comes", () => {
      const { getSession } = renderPhase(undefined, {
        prioritizedCategoryIds: ["b", "e"],
      });

      fireEvent.click(getContinueButton());

      expect(getSession()).toMatchObject({
        phase: "questions",
        prioritizedCategoryIds: ["b", "e"],
        areCategoriesConfirmed: true,
        entries: [],
      });
    });
  });

  describe('when "Pomiń" is pressed', () => {
    it("skips with no category picked", () => {
      const { getSession } = renderPhase();

      fireEvent.click(getSkipButton());

      expect(getSession()).toMatchObject({
        phase: "questions",
        prioritizedCategoryIds: [],
        entries: [],
      });
    });

    it("drops whatever was picked", () => {
      const { getSession } = renderPhase(undefined, {
        prioritizedCategoryIds: ["b", "e"],
      });

      fireEvent.click(getSkipButton());

      expect(getSession()).toMatchObject({
        phase: "questions",
        prioritizedCategoryIds: [],
        entries: [],
      });
    });
  });
});
