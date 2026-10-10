import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import { SurveyCheckpointText } from "./SurveyCheckpointText";

const LEAD_IN = "Rzadki okaz";
const THESIS = "Podatki powinny być niższe";
const STATEMENT = `Należysz do 4% osób, które popierają tezę „${THESIS}”.`;

const getParagraph = () => screen.getByRole("paragraph");

describe("<SurveyCheckpointText />", () => {
  describe("given a lead-in and a statement", () => {
    it("is read as one sentence, lead-in first", () => {
      render(<SurveyCheckpointText leadIn={LEAD_IN} statement={STATEMENT} />);

      expect(screen.getAllByRole("paragraph")).toHaveLength(1);
      expect(getParagraph()).toHaveTextContent(`${LEAD_IN} — ${STATEMENT}`);
    });

    it("keeps the dash with the lead-in so it cannot start a line", () => {
      render(<SurveyCheckpointText leadIn={LEAD_IN} statement={STATEMENT} />);

      // A no-break space before the dash, an ordinary space after it.
      expect(getParagraph().textContent).toBe(`${LEAD_IN} — ${STATEMENT}`);
    });

    it("draws the lead-in and the dash in the quiet colour, and the statement in bold", () => {
      render(<SurveyCheckpointText leadIn={LEAD_IN} statement={STATEMENT} />);

      expect(screen.getByText(`${LEAD_IN} —`)).toHaveClass(
        "text-gi-primary/75",
      );
      expect(getParagraph()).toHaveClass("font-bold", "text-gi-primary");
    });
  });

  describe("given no lead-in, or a blank one", () => {
    it("shows the statement alone, with no dash", () => {
      const { rerender } = render(
        <SurveyCheckpointText statement={STATEMENT} />,
      );

      expect(getParagraph().textContent).toBe(STATEMENT);

      rerender(<SurveyCheckpointText leadIn={" \n "} statement={STATEMENT} />);

      expect(getParagraph().textContent).toBe(STATEMENT);
    });
  });

  describe("given text with line breaks or doubled spaces", () => {
    it("collapses it to one paragraph", () => {
      render(
        <SurveyCheckpointText
          leadIn={"  Rzadki\n\nokaz  "}
          statement={"Należysz  do 4%\nosób.\n"}
        />,
      );

      expect(getParagraph().textContent).toBe(
        "Rzadki okaz — Należysz do 4% osób.",
      );
    });
  });

  describe("given text with markup in it", () => {
    it("shows it as written", () => {
      const statement =
        'Bliżej Ci do <b>Lewicy</b> niż do <a href="https://example.com">Prawicy</a>.';

      render(<SurveyCheckpointText statement={statement} />);

      expect(getParagraph().textContent).toBe(statement);
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(getParagraph().querySelector("b")).toBeNull();
    });
  });

  describe("given a quote that is part of the statement", () => {
    it("marks that part as a quotation", () => {
      render(<SurveyCheckpointText statement={STATEMENT} quote={THESIS} />);

      const quotation = screen.getByText(THESIS);

      expect(quotation.tagName).toBe("Q");
      expect(quotation).toHaveClass("italic");
      expect(getParagraph().textContent).toBe(STATEMENT);
    });

    it("adds no quotation marks of its own", () => {
      render(<SurveyCheckpointText statement={STATEMENT} quote={THESIS} />);

      expect(screen.getByText(THESIS)).toHaveClass("[quotes:none]");
      expect(screen.getByText(THESIS).textContent).toBe(THESIS);
    });

    it("marks the first occurrence when the quote is there twice", () => {
      render(<SurveyCheckpointText statement="Tak, tak i tak." quote="tak" />);

      expect(screen.getAllByText("tak")).toHaveLength(1);
      expect(getParagraph().textContent).toBe("Tak, tak i tak.");
    });

    it("finds a quote written with other line breaks than the statement", () => {
      render(
        <SurveyCheckpointText
          statement={"Teza „Podatki\npowinny być niższe”."}
          quote={"Podatki powinny\nbyć niższe"}
        />,
      );

      expect(screen.getByText(THESIS).tagName).toBe("Q");
    });
  });

  describe("given a quote that is blank or not in the statement", () => {
    it("marks nothing", () => {
      const { rerender } = render(
        <SurveyCheckpointText statement={STATEMENT} quote="  " />,
      );

      expect(getParagraph().querySelector("q")).toBeNull();

      rerender(
        <SurveyCheckpointText statement={STATEMENT} quote="Inna teza" />,
      );

      expect(getParagraph().querySelector("q")).toBeNull();
      expect(getParagraph().textContent).toBe(STATEMENT);
    });
  });

  describe("focus", () => {
    it("can take the focus, and is not a stop for the Tab key", () => {
      const textRef = createRef<HTMLParagraphElement>();

      render(<SurveyCheckpointText statement={STATEMENT} textRef={textRef} />);

      textRef.current?.focus();

      expect(textRef.current).toBe(getParagraph());
      expect(getParagraph()).toHaveFocus();
      expect(getParagraph()).toHaveAttribute("tabindex", "-1");
    });

    it("is marked as the element of the card the screen puts the focus on", () => {
      render(<SurveyCheckpointText statement={STATEMENT} />);

      expect(getParagraph()).toHaveAttribute("data-phase-focus");
    });
  });
});
