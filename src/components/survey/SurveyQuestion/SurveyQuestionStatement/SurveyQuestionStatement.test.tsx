import { i18n } from "@lingui/core";
import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DEFAULT_LANGUAGE } from "@/constants/common";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { EMPHASISED_PHRASES } from "../SurveyQuestion.constants";
import { SurveyQuestionStatement } from "./SurveyQuestionStatement";

const TEST_LOCALE = "en";

const renderStatement = (statement: string) =>
  renderWithI18n(<SurveyQuestionStatement statement={statement} />);

const activateLocaleWithPhrase = (phrase: string) => {
  i18n.load(TEST_LOCALE, { [EMPHASISED_PHRASES[0].id]: phrase });
  i18n.activate(TEST_LOCALE);
};

describe("<SurveyQuestionStatement />", () => {
  afterEach(() => {
    cleanup();
    i18n.activate(DEFAULT_LANGUAGE);
  });

  describe("given a statement", () => {
    it("renders it in full as one paragraph", () => {
      renderStatement("Obraza uczuć religijnych nie powinna być karalna.");

      expect(screen.getByRole("paragraph")).toHaveTextContent(
        "Obraza uczuć religijnych nie powinna być karalna.",
      );
    });
  });

  describe("given a statement with an emphasised phrase", () => {
    it("underlines every occurrence", () => {
      renderStatement("Państwo nie powinno karać i nie powinno zakazywać.");

      const occurrences = screen.getAllByText("nie");

      expect(occurrences).toHaveLength(2);
      expect(occurrences[0]).toHaveClass("underline");
      expect(occurrences[1]).toHaveClass("underline");
    });

    it("leaves the rest of the statement without an underline", () => {
      renderStatement("Obraza uczuć religijnych nie powinna być karalna.");

      expect(screen.getByText("Obraza uczuć religijnych")).not.toHaveClass(
        "underline",
      );
      expect(screen.getByText("powinna być karalna.")).not.toHaveClass(
        "underline",
      );
    });

    it("keeps the original spelling", () => {
      renderStatement("Nie każda obraza powinna być karalna.");

      expect(screen.getByText("Nie")).toHaveClass("underline");
      expect(screen.getByRole("paragraph")).toHaveTextContent(
        "Nie każda obraza powinna być karalna.",
      );
    });

    it("underlines the word without the punctuation next to it", () => {
      renderStatement("Karać (nie, raczej nie.)");

      expect(screen.getByRole("paragraph")).toHaveTextContent(
        "Karać (nie, raczej nie.)",
      );

      const occurrences = screen.getAllByText("nie");

      expect(occurrences).toHaveLength(2);
      expect(occurrences[0]).toHaveClass("underline");
      expect(occurrences[1]).toHaveClass("underline");
      expect(screen.getByText("Karać (")).not.toHaveClass("underline");
      expect(screen.getByText(", raczej")).not.toHaveClass("underline");
      expect(screen.getByText(".)")).not.toHaveClass("underline");
    });
  });

  describe("given a statement without one", () => {
    it("renders plain text", () => {
      renderStatement("Kościół katolicki powinien utrzymać konkordat.");

      expect(
        screen.getByText("Kościół katolicki powinien utrzymać konkordat."),
      ).not.toHaveClass("underline");
    });
  });

  describe("given the phrase only inside longer words", () => {
    it("underlines nothing", () => {
      renderStatement("Niektórzy cenią niepodległość.");

      expect(
        screen.getByText("Niektórzy cenią niepodległość."),
      ).not.toHaveClass("underline");
    });
  });

  describe("given a locale that translates the emphasised phrase", () => {
    it("underlines the phrase of that locale", () => {
      activateLocaleWithPhrase("not");
      renderStatement("Insulting religious feelings should not be punishable.");

      expect(screen.getByText("not")).toHaveClass("underline");
    });

    it("does not underline the phrase of the source locale", () => {
      activateLocaleWithPhrase("not");
      renderStatement("Powiedzieć nie.");

      expect(screen.getByText("Powiedzieć nie.")).not.toHaveClass("underline");
    });
  });

  describe("given a locale with a blank emphasised phrase", () => {
    it("underlines nothing", () => {
      activateLocaleWithPhrase(" ");
      renderStatement("Powiedzieć nie.");

      expect(screen.getByText("Powiedzieć nie.")).not.toHaveClass("underline");
    });
  });
});
