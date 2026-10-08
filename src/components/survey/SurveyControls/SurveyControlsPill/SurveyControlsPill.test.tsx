import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SurveyControlsPill } from "./SurveyControlsPill";

const LONG_TEXT = "Really Looong Quiz Name That Does Not Fit";
const DIVIDER = "survey-controls-pill-divider";

describe("<SurveyControlsPill />", () => {
  describe("given only a quiz name", () => {
    it("shows the quiz name without a divider or a number", () => {
      renderWithI18n(<SurveyControlsPill quizName="Quiz Name" />);

      expect(screen.getByText("Quiz Name")).toBeInTheDocument();
      expect(screen.queryByTestId(DIVIDER)).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Pozostałe pytania w kategorii/),
      ).not.toBeInTheDocument();
    });
  });

  describe("given a text longer than the pill", () => {
    it("cuts it on one line", () => {
      renderWithI18n(<SurveyControlsPill quizName={LONG_TEXT} />);

      expect(screen.getByText(LONG_TEXT)).toHaveClass("truncate", "min-w-0");
    });

    it("keeps the full text available to assistive technology", () => {
      renderWithI18n(<SurveyControlsPill quizName={LONG_TEXT} />);

      const text = screen.getByText(LONG_TEXT);

      expect(text).toHaveTextContent(LONG_TEXT);
      expect(text).not.toHaveAttribute("aria-hidden");
    });

    it("never shrinks the number", () => {
      renderWithI18n(
        <SurveyControlsPill
          quizName="Quiz Name"
          categoryName="Polityka zagraniczna i bezpieczeństwo międzynarodowe"
          questionsLeft={11}
        />,
      );

      expect(
        screen.getByText("Pozostałe pytania w kategorii: 11").parentElement,
      ).toHaveClass("shrink-0");
    });
  });

  describe("given a label together with a category", () => {
    it("shows the label", () => {
      renderWithI18n(
        <SurveyControlsPill
          quizName="Quiz Name"
          label="Prawie koniec!"
          categoryName="Światopogląd"
          questionsLeft={11}
        />,
      );

      expect(screen.getByText("Prawie koniec!")).toBeInTheDocument();
      expect(screen.queryByText("Światopogląd")).not.toBeInTheDocument();
      expect(screen.queryByText("Quiz Name")).not.toBeInTheDocument();
      expect(screen.queryByTestId(DIVIDER)).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Pozostałe pytania w kategorii/),
      ).not.toBeInTheDocument();
    });
  });

  describe("given a category name and questions left", () => {
    it("shows the name, the divider and the number", () => {
      renderWithI18n(
        <SurveyControlsPill
          quizName="Quiz Name"
          categoryName="Światopogląd"
          questionsLeft={11}
        />,
      );

      expect(screen.getByText("Światopogląd")).toBeInTheDocument();
      expect(screen.getByTestId(DIVIDER)).toHaveAttribute(
        "aria-hidden",
        "true",
      );
      expect(
        screen.getByText("Pozostałe pytania w kategorii: 11"),
      ).toBeInTheDocument();
      expect(screen.queryByText("Quiz Name")).not.toBeInTheDocument();
    });
  });

  describe("given a category name only", () => {
    it("shows the name without a divider", () => {
      renderWithI18n(
        <SurveyControlsPill quizName="Quiz Name" categoryName="Światopogląd" />,
      );

      expect(screen.getByText("Światopogląd")).toBeInTheDocument();
      expect(screen.queryByTestId(DIVIDER)).not.toBeInTheDocument();
    });
  });

  describe("given questions left only", () => {
    it("shows the number without a divider or the quiz name", () => {
      renderWithI18n(
        <SurveyControlsPill quizName="Quiz Name" questionsLeft={4} />,
      );

      expect(
        screen.getByText("Pozostałe pytania w kategorii: 4"),
      ).toBeInTheDocument();
      expect(screen.queryByTestId(DIVIDER)).not.toBeInTheDocument();
      expect(screen.queryByText("Quiz Name")).not.toBeInTheDocument();
    });
  });

  describe("given invalid questions left", () => {
    it("shows a negative number as 0", () => {
      renderWithI18n(
        <SurveyControlsPill quizName="Quiz Name" questionsLeft={-5} />,
      );

      expect(
        screen.getByText("Pozostałe pytania w kategorii: 0"),
      ).toBeInTheDocument();
    });

    it("rounds a fraction down", () => {
      renderWithI18n(
        <SurveyControlsPill quizName="Quiz Name" questionsLeft={7.9} />,
      );

      expect(
        screen.getByText("Pozostałe pytania w kategorii: 7"),
      ).toBeInTheDocument();
    });

    it("treats a value that is not a finite number as absent", () => {
      renderWithI18n(
        <SurveyControlsPill
          quizName="Quiz Name"
          questionsLeft={Number.POSITIVE_INFINITY}
        />,
      );

      expect(screen.getByText("Quiz Name")).toBeInTheDocument();
      expect(
        screen.queryByText(/Pozostałe pytania w kategorii/),
      ).not.toBeInTheDocument();
    });
  });

  describe("given a label and a category name that are only whitespace", () => {
    it("shows the quiz name", () => {
      renderWithI18n(
        <SurveyControlsPill quizName="Quiz Name" label="  " categoryName=" " />,
      );

      expect(screen.getByText("Quiz Name")).toBeInTheDocument();
    });
  });

  describe("given an empty quiz name and nothing else", () => {
    it("renders nothing", () => {
      const { container } = renderWithI18n(<SurveyControlsPill quizName="" />);

      expect(container).toBeEmptyDOMElement();
    });
  });
});
