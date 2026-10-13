import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Agreement } from "@/types/comparison";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { Answer } from "./Answer";
import type { AnswerProps } from "./Answer.types";

const TEXT = "Budowa tanich mieszkań na wynajem z publicznych pieniędzy";

const renderAnswer = (props: AnswerProps = { text: TEXT }) =>
  renderWithI18n(<Answer {...props} />);

const getChip = () => screen.getByTestId("answer-chip");
const queryMark = () => screen.queryByRole("img");

describe("<Answer />", () => {
  describe("given an answer", () => {
    it("writes its text in a grey chip", () => {
      renderAnswer();

      expect(getChip()).toHaveTextContent(TEXT);
      expect(getChip()).toHaveClass("bg-gi-ash");
    });

    it("writes the text in full, on as many lines as it takes", () => {
      renderAnswer();

      expect(getChip()).toHaveClass("wrap-break-word");
      expect(getChip()).not.toHaveClass("truncate");
    });

    it("has no mark and no outline unless it is held up against another", () => {
      renderAnswer();

      expect(queryMark()).not.toBeInTheDocument();
      expect(getChip()).toHaveClass("border-transparent");
    });

    it("takes the width it is given", () => {
      const { container } = renderAnswer();

      expect(container.firstElementChild).toHaveClass("w-full", "min-w-0");
    });
  });

  describe("given an answer that is the answer of the taker", () => {
    it("marks it with a tick that says so in a word", () => {
      renderAnswer({ text: TEXT, agreement: Agreement.Agree });

      expect(screen.getByRole("img", { name: "Zgodność" })).toBeVisible();
    });

    it("outlines the chip in green", () => {
      renderAnswer({ text: TEXT, agreement: Agreement.Agree });

      expect(getChip()).toHaveClass("border-emerald-600/50", "bg-gi-ash");
    });
  });

  describe("given an answer that is not the answer of the taker", () => {
    it("marks it with a cross that says so in a word", () => {
      renderAnswer({ text: TEXT, agreement: Agreement.Disagree });

      expect(screen.getByRole("img", { name: "Niezgodność" })).toBeVisible();
    });

    it("outlines the chip in red", () => {
      renderAnswer({ text: TEXT, agreement: Agreement.Disagree });

      expect(getChip()).toHaveClass("border-gi-red/50", "bg-gi-ash");
    });

    it("draws another mark than for the answer of the taker", () => {
      const agreeing = renderAnswer({ text: TEXT, agreement: Agreement.Agree });
      const tick = queryMark()?.getAttribute("src");

      agreeing.unmount();
      renderAnswer({ text: TEXT, agreement: Agreement.Disagree });

      expect(queryMark()?.getAttribute("src")).not.toBe(tick);
    });
  });

  describe("given an answer that cannot be held up against the taker's", () => {
    it("has no mark", () => {
      renderAnswer({ text: TEXT, agreement: Agreement.Neither });

      expect(queryMark()).not.toBeInTheDocument();
    });
  });

  describe("given no answer", () => {
    it('says "no answer" in an empty chip', () => {
      renderAnswer({});

      expect(getChip()).toHaveTextContent("Brak odpowiedzi");
      expect(getChip()).toHaveClass("border-gi-ash");
      expect(getChip()).not.toHaveClass("bg-gi-ash");
    });

    it.each([
      Agreement.Agree,
      Agreement.Disagree,
      Agreement.Neither,
    ])("never has a mark: %s", (agreement) => {
      renderAnswer({ agreement });

      expect(queryMark()).not.toBeInTheDocument();
    });
  });

  describe("given an answer of the taker", () => {
    it("writes the text from the end of its line", () => {
      renderAnswer({ text: TEXT, isTaker: true });

      expect(getChip()).toHaveClass("text-right");
    });

    it('writes "no answer" from the end too', () => {
      renderAnswer({ isTaker: true });

      expect(getChip()).toHaveTextContent("Brak odpowiedzi");
      expect(getChip()).toHaveClass("text-right");
    });
  });

  describe("given an answer of the other side", () => {
    it("writes the text from the start of its line", () => {
      renderAnswer();

      expect(getChip()).not.toHaveClass("text-right");
    });
  });
});
