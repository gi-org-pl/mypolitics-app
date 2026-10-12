import { fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { DemographicsValues, Survey } from "@/types/survey";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";
import { renderPhaseContent } from "@/utils/vitest/renderPhaseContent";

import { SurveyQuestionnaireDemographics } from "./SurveyQuestionnaireDemographics";

const REASON = "Wybierz wszystkie cztery pola albo pomiń";
const FIELD_NAMES = [
  "Wiek",
  "Płeć",
  "Wielkość miejsca zamieszkania",
  "Wykształcenie",
];
const COMPLETE: DemographicsValues = {
  age: "27",
  gender: "prefer_not_to_share",
  residenceAreaSize: "city_below_200k",
  education: "higher",
};

const renderPhase = (demographics: DemographicsValues = {}) => {
  // The stores live as long as the module does: a quiz of its own.
  const survey: Survey = createSurvey({ id: crypto.randomUUID() });

  return renderPhaseContent(SurveyQuestionnaireDemographics, survey, {
    ...createStartedSession(survey, survey.questions.length),
    demographics,
  });
};

const getField = (name: string) => screen.getByRole("button", { name });

const getResultsButton = () =>
  screen.getByRole("button", { name: "Zobacz wyniki" });

const getSkipButton = () => screen.getByRole("button", { name: "Pomiń" });

const choose = (fieldName: string, optionLabel: string) => {
  const field = getField(fieldName);

  field.focus();
  fireEvent.keyDown(field, { key: "Enter" });
  fireEvent.click(screen.getByRole("menuitem", { name: optionLabel }));
};

describe("<SurveyQuestionnaireDemographics />", () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  describe("when the phase opens in a new session", () => {
    it("shows four fields, nothing picked", () => {
      renderPhase();

      expect(
        screen.getByRole("heading", { name: "Twoja tożsamość" }),
      ).toBeInTheDocument();

      for (const name of FIELD_NAMES) {
        expect(getField(name)).toHaveTextContent(name);
        expect(getField(name)).not.toHaveAccessibleDescription();
      }
    });

    it("reaches the fields, the link and the buttons in reading order", () => {
      renderPhase();

      expect(
        screen.getAllByRole("button").map((button) => button.textContent),
      ).toEqual([...FIELD_NAMES, "To znaczy?", "Zobacz wyniki", "Pomiń"]);
    });

    it("offers the lists of the table", () => {
      renderPhase();

      const field = getField("Płeć");

      field.focus();
      fireEvent.keyDown(field, { key: "Enter" });

      expect(
        screen.getAllByRole("menuitem").map((option) => option.textContent),
      ).toEqual(["Kobieta", "Mężczyzna", "Inna", "Wolę nie podawać"]);
    });
  });

  describe("when the phase opens again", () => {
    it("shows the values the session holds", () => {
      renderPhase(COMPLETE);

      expect(getField("Wiek")).toHaveAccessibleDescription("27");
      expect(getField("Płeć")).toHaveAccessibleDescription("Wolę nie podawać");
      expect(
        getField("Wielkość miejsca zamieszkania"),
      ).toHaveAccessibleDescription("Miasto od 50 do 200 tys. mieszkańców");
      expect(getField("Wykształcenie")).toHaveAccessibleDescription("Wyższe");
    });
  });

  describe("when an option is picked", () => {
    it("passes a pick to setDemographics", () => {
      const { getSession } = renderPhase();

      choose("Wiek", "13");
      choose("Wykształcenie", "Zasadnicze zawodowe");

      expect(getSession().demographics).toEqual({
        age: "13",
        education: "basic_vocational",
      });
      expect(getSession().phase).toBe("demographics");
      expect(getField("Wiek")).toHaveAccessibleDescription("13");
    });
  });

  describe("given fewer than four fields picked", () => {
    it('turns "Zobacz wyniki" off, and says why to assistive technology', () => {
      const { getSession } = renderPhase({ ...COMPLETE, age: undefined });

      expect(getResultsButton()).toBeDisabled();
      expect(getResultsButton()).toHaveAccessibleDescription(REASON);
      expect(getSkipButton()).toBeEnabled();

      fireEvent.click(getResultsButton());

      expect(getSession().phase).toBe("demographics");
    });
  });

  describe("given all four fields picked", () => {
    it('turns "Zobacz wyniki" on, "Wolę nie podawać" included, and gives no reason', () => {
      renderPhase(COMPLETE);

      expect(getResultsButton()).toBeEnabled();
      expect(getResultsButton()).not.toHaveAccessibleDescription();
      expect(getSkipButton()).toBeEnabled();
    });

    it("turns it on at the fourth pick", () => {
      renderPhase({ ...COMPLETE, age: undefined });

      choose("Wiek", "99");

      expect(getResultsButton()).toBeEnabled();
    });
  });

  describe('when "Zobacz wyniki" is pressed', () => {
    it("leaves as given: the next phase comes", () => {
      const { getSession } = renderPhase(COMPLETE);

      fireEvent.click(getResultsButton());

      expect(getSession()).toMatchObject({
        phase: "results-calculation",
        areDemographicsGiven: true,
        demographics: COMPLETE,
      });
    });
  });

  describe('when "Pomiń" is pressed', () => {
    it.each([
      ["nothing", {}],
      ["some fields", { age: "40", gender: "male" }],
      ["all fields", COMPLETE],
    ] satisfies [
      string,
      DemographicsValues,
    ][])("leaves as not given with %s picked, and keeps the values", (_, demographics) => {
      const { getSession } = renderPhase(demographics);

      fireEvent.click(getSkipButton());

      expect(getSession()).toMatchObject({
        phase: "results-calculation",
        areDemographicsGiven: false,
        demographics,
      });
    });
  });
});
