import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SurveyQuestion } from "./SurveyQuestion";
import type { SurveyQuestionProps } from "./SurveyQuestion.types";

const QUESTION = "Obraza uczuć religijnych nie powinna być karalna.";
const EXPLANATION =
  "Obraza uczuć religijnych to działanie lub wypowiedź, które znieważają wiarę.";
const PREVIEW = "Obraza uczuć religijnych to...";
const NEXT_QUESTION = "Kościół katolicki powinien utrzymać konkordat.";
const NEXT_EXPLANATION = "Konkordat to umowa ze Stolicą Apostolską.";
const NEXT_PREVIEW = "Konkordat to...";
const CHANGE_LABEL = "Zmień pytanie";

interface QuestionChangerProps {
  next: SurveyQuestionProps;
}

const QuestionChanger = ({ next }: QuestionChangerProps) => {
  const [props, setProps] = useState<SurveyQuestionProps>({
    question: QUESTION,
    explanation: EXPLANATION,
  });

  return (
    <>
      <SurveyQuestion {...props} />
      <button type="button" onClick={() => setProps({ ...next })}>
        {CHANGE_LABEL}
      </button>
    </>
  );
};

const renderOpenQuestion = async (next: SurveyQuestionProps) => {
  const user = userEvent.setup();

  renderWithI18n(<QuestionChanger next={next} />);
  await user.click(screen.getByRole("button", { name: PREVIEW }));

  return user;
};

describe("<SurveyQuestion />", () => {
  describe("given a question", () => {
    it("renders the statement in full", () => {
      const longQuestion = `${QUESTION} ${"Bardzo długie zdanie. ".repeat(40)}`;

      renderWithI18n(<SurveyQuestion question={longQuestion} />);

      expect(screen.getByRole("paragraph")).toHaveTextContent(
        longQuestion.trim(),
      );
    });

    it("renders it without the surrounding whitespace", () => {
      renderWithI18n(<SurveyQuestion question={`  \n${NEXT_QUESTION}\t `} />);

      expect(screen.getByRole("paragraph").textContent).toBe(NEXT_QUESTION);
    });
  });

  describe("given no explanation", () => {
    it("renders no explanation bar", () => {
      renderWithI18n(<SurveyQuestion question={QUESTION} />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(screen.getAllByRole("paragraph", { hidden: true })).toHaveLength(
        1,
      );
    });
  });

  describe("given an explanation", () => {
    it("renders the bar collapsed", () => {
      renderWithI18n(
        <SurveyQuestion question={QUESTION} explanation={EXPLANATION} />,
      );

      expect(screen.getByRole("button", { name: PREVIEW })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      expect(screen.getByRole("paragraph")).toHaveTextContent(QUESTION);
    });

    it("renders the bar after the statement", () => {
      renderWithI18n(
        <SurveyQuestion question={QUESTION} explanation={EXPLANATION} />,
      );

      expect(
        screen
          .getByRole("paragraph")
          .compareDocumentPosition(screen.getByRole("button")),
      ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });
  });

  describe("given an explanation that is only whitespace", () => {
    it("renders no explanation bar", () => {
      renderWithI18n(
        <SurveyQuestion question={QUESTION} explanation={" \n "} />,
      );

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("given an empty explanation", () => {
    it("renders no explanation bar", () => {
      renderWithI18n(<SurveyQuestion question={QUESTION} explanation="" />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("given an empty question", () => {
    it("renders nothing", () => {
      const { container } = renderWithI18n(
        <SurveyQuestion question="" explanation={EXPLANATION} />,
      );

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("given a question that is only whitespace", () => {
    it("renders nothing", () => {
      const { container } = renderWithI18n(
        <SurveyQuestion question={" \n\t "} explanation={EXPLANATION} />,
      );

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("when the bar is activated", () => {
    it("opens the explanation and keeps the statement", async () => {
      const user = userEvent.setup();

      renderWithI18n(
        <SurveyQuestion question={QUESTION} explanation={EXPLANATION} />,
      );
      await user.click(screen.getByRole("button", { name: PREVIEW }));

      expect(
        screen
          .getAllByRole("paragraph")
          .map((paragraph) => paragraph.textContent),
      ).toEqual([QUESTION, EXPLANATION]);
    });
  });

  describe("when the question changes while the bar is open", () => {
    it("collapses the bar", async () => {
      const user = await renderOpenQuestion({
        question: NEXT_QUESTION,
        explanation: EXPLANATION,
      });

      await user.click(screen.getByRole("button", { name: CHANGE_LABEL }));

      expect(screen.getByRole("button", { name: PREVIEW })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      expect(screen.getByRole("paragraph")).toHaveTextContent(NEXT_QUESTION);
    });
  });

  describe("when the explanation changes while the bar is open", () => {
    it("collapses the bar", async () => {
      const user = await renderOpenQuestion({
        question: QUESTION,
        explanation: NEXT_EXPLANATION,
      });

      await user.click(screen.getByRole("button", { name: CHANGE_LABEL }));

      expect(
        screen.getByRole("button", { name: NEXT_PREVIEW }),
      ).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("when the explanation is removed while the bar is open", () => {
    it("removes the bar", async () => {
      const user = await renderOpenQuestion({ question: NEXT_QUESTION });

      await user.click(screen.getByRole("button", { name: CHANGE_LABEL }));

      expect(
        screen.queryByRole("button", { expanded: true }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { expanded: false }),
      ).not.toBeInTheDocument();
    });
  });

  describe("when it renders again with the same question and explanation", () => {
    it("keeps the bar open", async () => {
      const user = await renderOpenQuestion({
        question: QUESTION,
        explanation: EXPLANATION,
      });

      await user.click(screen.getByRole("button", { name: CHANGE_LABEL }));

      expect(screen.getByRole("button", { name: PREVIEW })).toHaveAttribute(
        "aria-expanded",
        "true",
      );
    });
  });
});
