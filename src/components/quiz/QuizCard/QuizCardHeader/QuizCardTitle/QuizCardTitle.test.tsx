import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FOCUS_CLASS_NAME } from "@/constants/focus";

import { QuizCardTitle } from "./QuizCardTitle";

const TITLE = "Polskie Lata 90.";

describe("<QuizCardTitle />", () => {
  describe("given a title as text", () => {
    it("renders it as the heading of the card", () => {
      render(<QuizCardTitle>{TITLE}</QuizCardTitle>);

      expect(screen.getByRole("heading", { name: TITLE })).toBeInTheDocument();
    });

    it("renders a long title in full", () => {
      const longTitle =
        "Najdłuższy quiz o poglądach politycznych, gospodarczych i światopoglądowych w całej Polsce";

      render(<QuizCardTitle>{longTitle}</QuizCardTitle>);

      expect(screen.getByRole("heading")).toHaveTextContent(longTitle);
    });
  });

  describe("given a logo", () => {
    it("names the heading after the logo's alternative text", () => {
      render(
        <QuizCardTitle>
          <img src="/assets/logo.svg" alt={TITLE} />
        </QuizCardTitle>,
      );

      expect(screen.getByRole("heading", { name: TITLE })).toBeInTheDocument();
    });
  });

  describe("given no click handler", () => {
    it("renders no button", () => {
      render(<QuizCardTitle>{TITLE}</QuizCardTitle>);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("given a click handler", () => {
    it("renders the title as a button named after it, inside the heading", () => {
      render(<QuizCardTitle onClick={vi.fn()}>{TITLE}</QuizCardTitle>);

      expect(screen.getByRole("heading", { name: TITLE })).toContainElement(
        screen.getByRole("button", { name: TITLE }),
      );
    });

    it("names the button of a logo after the logo's alternative text", () => {
      render(
        <QuizCardTitle onClick={vi.fn()}>
          <img src="/assets/logo.svg" alt={TITLE} />
        </QuizCardTitle>,
      );

      expect(screen.getByRole("button", { name: TITLE })).toContainElement(
        screen.getByRole("img", { name: TITLE }),
      );
    });

    it("renders a button that does not submit a form around the card", () => {
      render(<QuizCardTitle onClick={vi.fn()}>{TITLE}</QuizCardTitle>);

      expect(screen.getByRole("button", { name: TITLE })).toHaveAttribute(
        "type",
        "button",
      );
    });

    it("shows keyboard focus on the button as an outline", () => {
      render(<QuizCardTitle onClick={vi.fn()}>{TITLE}</QuizCardTitle>);

      expect(screen.getByRole("button", { name: TITLE })).toHaveClass(
        ...FOCUS_CLASS_NAME.split(" "),
      );
    });
  });

  describe("when the button is activated", () => {
    it("calls the handler once", () => {
      const handleClick = vi.fn();
      render(<QuizCardTitle onClick={handleClick}>{TITLE}</QuizCardTitle>);

      fireEvent.click(screen.getByRole("button", { name: TITLE }));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("does not let the click reach the card around it", () => {
      const handleCardClick = vi.fn();
      render(
        <article onClick={handleCardClick}>
          <QuizCardTitle onClick={vi.fn()}>{TITLE}</QuizCardTitle>
        </article>,
      );

      fireEvent.click(screen.getByRole("button", { name: TITLE }));

      expect(handleCardClick).not.toHaveBeenCalled();
    });
  });
});
