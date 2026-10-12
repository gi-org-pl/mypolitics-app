import { fireEvent, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SurveyCheckpoint } from "./SurveyCheckpoint";
import type { SurveyCheckpointProps } from "./SurveyCheckpoint.types";

const LEAD_IN = "Jesteś na półmetku";
const STATEMENT = "To już prawie koniec, pozostałe pytania zajmą ok. 4 min.";
const CONTINUE = "Dalej";
const OPT_OUT = "Wyłącz checkpointy";
const OPTIONS = [
  <button key="start" type="button">
    Interwencjonizm
  </button>,
  <button key="end" type="button">
    Wolny rynek
  </button>,
];

const renderCard = (props: Partial<SurveyCheckpointProps> = {}) => {
  const onContinue = vi.fn();
  const onOptOut = vi.fn();

  return {
    ...renderWithI18n(
      <SurveyCheckpoint
        visual={<span>50%</span>}
        leadIn={LEAD_IN}
        statement={STATEMENT}
        onContinue={onContinue}
        onOptOut={onOptOut}
        {...props}
      />,
    ),
    onContinue,
    onOptOut,
  };
};

// A card that changes in place, as a puzzle does on a guess: the visual, the
// text and the options are swapped, and "Dalej" comes back - or was there all
// along, for a puzzle whose guess can be passed over.
const Puzzle = ({ isContinueKept = false }: { isContinueKept?: boolean }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <SurveyCheckpoint
      visual={<span>{isRevealed ? "Wolny rynek 62%" : "?"}</span>}
      leadIn={isRevealed ? "Trafione!" : "Jak myślisz?"}
      statement={
        isRevealed
          ? "Wolny rynek jest Ci najbliższy."
          : "Do czego jest Tobie bliżej?"
      }
      options={
        isRevealed ? undefined : (
          <button type="button" onClick={() => setIsRevealed(true)}>
            Wolny rynek
          </button>
        )
      }
      isContinueAvailable={isContinueKept || isRevealed}
      onContinue={vi.fn()}
      onOptOut={vi.fn()}
    />
  );
};

const getRegion = () => screen.getByRole("region", { name: "Checkpoint" });

const getText = () => within(getRegion()).getByRole("paragraph");

const getButton = (name: string) => screen.getByRole("button", { name });

// What stands between the panel and "Wyłącz checkpointy": the second of the
// three parts of the frame.
const getBody = () => getRegion().children[1] as HTMLElement;

// The boxes that move their height, in the order of the body: the text, the
// options, "Dalej".
const getBoxes = () => [...getBody().children] as HTMLElement[];

const BOX_CLASS_NAME = "data-[animating=true]:overflow-y-clip";

const queryButton = (name: string) => screen.queryByRole("button", { name });

const getButtonNames = () =>
  screen.getAllByRole("button").map((button) => button.textContent);

const isBefore = (first: Element, second: Element): boolean =>
  Boolean(
    first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING,
  );

describe("<SurveyCheckpoint />", () => {
  describe("given a visual, a lead-in and a statement", () => {
    it('shows the visual, then the text, then "Dalej", then "Wyłącz checkpointy"', () => {
      renderCard();

      const parts = [
        screen.getByText("50%"),
        getText(),
        getButton(CONTINUE),
        getButton(OPT_OUT),
      ];

      expect(parts.every((part) => getRegion().contains(part))).toBe(true);
      expect(isBefore(parts[0], parts[1])).toBe(true);
      expect(isBefore(parts[1], parts[2])).toBe(true);
      expect(isBefore(parts[2], parts[3])).toBe(true);
    });

    it("shows the lead-in, the dash and the statement as one paragraph", () => {
      renderCard();

      expect(within(getRegion()).getAllByRole("paragraph")).toHaveLength(1);
      expect(getText()).toHaveTextContent(`${LEAD_IN} — ${STATEMENT}`);
    });

    it('is a region named "Checkpoint"', () => {
      renderCard();

      expect(getRegion()).toBeVisible();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("fills the width it is given", () => {
      renderCard();

      expect(getRegion()).toHaveClass("w-full");
      expect(getButton(CONTINUE)).toHaveClass("w-full");
      expect(getButton(OPT_OUT)).toHaveClass("w-full");
    });
  });

  describe("given no lead-in, or a blank one", () => {
    it("shows the statement alone, with no dash", () => {
      renderCard({ leadIn: undefined });

      expect(getText().textContent).toBe(STATEMENT);
    });

    it("shows the statement alone for a lead-in of whitespace", () => {
      renderCard({ leadIn: " \n " });

      expect(getText().textContent).toBe(STATEMENT);
    });
  });

  describe("given a quote", () => {
    it("marks that part of the statement as a quotation", () => {
      renderCard({
        statement: "Tylko 4% osób jest za tezą „Podatki powinny być niższe”.",
        quote: "Podatki powinny być niższe",
      });

      expect(screen.getByText("Podatki powinny być niższe").tagName).toBe("Q");
    });
  });

  describe("given options", () => {
    it("shows them between the text and the buttons", () => {
      renderCard({ options: OPTIONS });

      expect(isBefore(getText(), getButton("Interwencjonizm"))).toBe(true);
      expect(getButtonNames()).toEqual([
        "Interwencjonizm",
        "Wolny rynek",
        CONTINUE,
        OPT_OUT,
      ]);
    });
  });

  describe("given isContinueAvailable is false and options", () => {
    it('does not render "Dalej"', () => {
      renderCard({ options: OPTIONS, isContinueAvailable: false });

      expect(queryButton(CONTINUE)).not.toBeInTheDocument();
    });

    it('still renders "Wyłącz checkpointy"', () => {
      const { onOptOut } = renderCard({
        options: OPTIONS,
        isContinueAvailable: false,
      });

      fireEvent.click(getButton(OPT_OUT));

      expect(onOptOut).toHaveBeenCalledTimes(1);
    });
  });

  describe("given isContinueAvailable is false and no options", () => {
    it('renders "Dalej"', () => {
      const { onContinue } = renderCard({ isContinueAvailable: false });

      fireEvent.click(getButton(CONTINUE));

      expect(onContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe("given options with nothing to draw", () => {
    it("treats them as no options", () => {
      renderCard({ options: [null, false, ""], isContinueAvailable: false });

      expect(getButtonNames()).toEqual([CONTINUE, OPT_OUT]);
    });
  });

  describe("given a blank statement", () => {
    it("renders nothing", () => {
      const { container } = renderCard({ statement: " \n " });

      expect(container).toBeEmptyDOMElement();
    });

    it("calls onContinue once", () => {
      const { onContinue, onOptOut } = renderCard({ statement: "" });

      expect(onContinue).toHaveBeenCalledTimes(1);
      expect(onOptOut).not.toHaveBeenCalled();
    });

    it("does the same for a statement that is missing", () => {
      const { container, onContinue } = renderCard({
        statement: undefined as unknown as string,
      });

      expect(container).toBeEmptyDOMElement();
      expect(onContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe("given a visual with nothing to draw", () => {
    it("renders nothing", () => {
      const { container } = renderCard({ visual: null });

      expect(container).toBeEmptyDOMElement();
    });

    it("calls onContinue once", () => {
      const { onContinue } = renderCard({ visual: [false, ""] });

      expect(onContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe('when "Dalej" is activated', () => {
    it("calls onContinue once", () => {
      const { onContinue, onOptOut } = renderCard();

      fireEvent.click(getButton(CONTINUE));

      expect(onContinue).toHaveBeenCalledTimes(1);
      expect(onOptOut).not.toHaveBeenCalled();
    });
  });

  describe('when "Wyłącz checkpointy" is activated', () => {
    it("calls onOptOut once, with no confirmation", () => {
      const { onContinue, onOptOut } = renderCard();

      fireEvent.click(getButton(OPT_OUT));

      expect(onOptOut).toHaveBeenCalledTimes(1);
      expect(onContinue).not.toHaveBeenCalled();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });

  describe("when a button is activated after one of the two was", () => {
    it("calls nothing", () => {
      const { onContinue, onOptOut } = renderCard();

      fireEvent.click(getButton(CONTINUE));
      fireEvent.click(getButton(CONTINUE));
      fireEvent.click(getButton(OPT_OUT));

      expect(onContinue).toHaveBeenCalledTimes(1);
      expect(onOptOut).not.toHaveBeenCalled();
    });

    it("calls nothing after the opt-out either", () => {
      const { onContinue, onOptOut } = renderCard();

      fireEvent.click(getButton(OPT_OUT));
      fireEvent.click(getButton(OPT_OUT));
      fireEvent.click(getButton(CONTINUE));

      expect(onOptOut).toHaveBeenCalledTimes(1);
      expect(onContinue).not.toHaveBeenCalled();
    });
  });

  describe("when the visual or the text is pressed", () => {
    it("calls nothing", () => {
      const { onContinue, onOptOut } = renderCard();

      fireEvent.click(screen.getByText("50%"));
      fireEvent.click(getText());
      fireEvent.click(getRegion());

      expect(onContinue).not.toHaveBeenCalled();
      expect(onOptOut).not.toHaveBeenCalled();
    });
  });

  describe("when the Escape key is pressed", () => {
    it("calls nothing", () => {
      const { onContinue, onOptOut } = renderCard();

      fireEvent.keyDown(getButton(CONTINUE), { key: "Escape" });
      fireEvent.keyDown(getRegion(), { key: "Escape" });

      expect(getRegion()).toBeVisible();
      expect(onContinue).not.toHaveBeenCalled();
      expect(onOptOut).not.toHaveBeenCalled();
    });
  });

  describe("when the card changes in place", () => {
    it("redraws the visual, the text and the buttons in the same region", () => {
      renderWithI18n(<Puzzle />);

      const region = getRegion();

      expect(getButtonNames()).toEqual(["Wolny rynek", OPT_OUT]);

      fireEvent.click(getButton("Wolny rynek"));

      expect(getRegion()).toBe(region);
      expect(screen.getByText("Wolny rynek 62%")).toBeVisible();
      expect(getText()).toHaveTextContent(
        "Trafione! — Wolny rynek jest Ci najbliższy.",
      );
      expect(getButtonNames()).toEqual([CONTINUE, OPT_OUT]);
    });

    it('keeps the text, the options and "Dalej" each in a box of its own that moves its height', () => {
      renderWithI18n(<Puzzle />);

      const boxes = getBoxes();
      const [textBox, optionsBox, continueBox] = boxes;

      expect(boxes).toHaveLength(3);

      for (const box of boxes) expect(box).toHaveClass(BOX_CLASS_NAME);

      expect(textBox).toContainElement(getText());
      expect(optionsBox).toContainElement(getButton("Wolny rynek"));
      expect(continueBox.firstElementChild).toBeEmptyDOMElement();

      fireEvent.click(getButton("Wolny rynek"));

      expect(getBoxes()).toEqual(boxes);
      expect(textBox).toContainElement(getText());
      expect(optionsBox.firstElementChild).toBeEmptyDOMElement();
      expect(continueBox).toContainElement(getButton(CONTINUE));
    });

    it('leaves "Dalej" in its own box when the options above it go, so it moves up with their box', () => {
      renderWithI18n(<Puzzle isContinueKept />);

      const [, optionsBox, continueBox] = getBoxes();
      const next = getButton(CONTINUE);

      expect(optionsBox).toContainElement(getButton("Wolny rynek"));
      expect(optionsBox).not.toContainElement(next);
      expect(continueBox).toContainElement(next);

      fireEvent.click(getButton("Wolny rynek"));

      expect(getButton(CONTINUE)).toBe(next);
      expect(getBoxes()[2]).toBe(continueBox);
      expect(continueBox).toContainElement(next);
      expect(optionsBox.firstElementChild).toBeEmptyDOMElement();
    });

    it('leaves the visual above the boxes and "Wyłącz checkpointy" under them', () => {
      renderWithI18n(<Puzzle />);

      expect(getRegion().children).toHaveLength(3);
      expect(getRegion().firstElementChild).toContainElement(
        screen.getByText("?"),
      );
      expect(getRegion().firstElementChild).not.toHaveClass(BOX_CLASS_NAME);
      expect(getRegion().lastElementChild).toBe(getButton(OPT_OUT));
      expect(getBody()).not.toContainElement(screen.getByText("?"));
      expect(getBody()).not.toContainElement(getButton(OPT_OUT));
    });

    it('keeps the gap of the frame above the options and above "Dalej" inside their boxes', () => {
      renderCard({ options: OPTIONS });

      const [, optionsBox, continueBox] = getBoxes();
      const optionsStack = optionsBox.firstElementChild?.firstElementChild;
      const continueRow = continueBox.firstElementChild?.firstElementChild;

      expect(getBody()).toHaveClass("flex", "w-full", "min-w-0", "flex-col");
      expect(getBody()).not.toHaveClass("gap-4");
      expect(optionsStack).toHaveClass(
        "flex",
        "w-full",
        "min-w-0",
        "flex-col",
        "gap-2",
        "pt-4",
      );
      expect(optionsStack).toContainElement(getButton("Interwencjonizm"));
      expect(continueRow).toHaveClass("w-full", "pt-4");
      expect(continueRow).toContainElement(getButton(CONTINUE));
      expect(getRegion()).toHaveClass("flex", "flex-col", "gap-4");
    });

    it("gives a part that is not there no room", () => {
      renderCard();

      const [textBox, optionsBox, continueBox] = getBoxes();

      expect(textBox).toContainElement(getText());
      expect(optionsBox.firstElementChild).toBeEmptyDOMElement();
      expect(continueBox).toContainElement(getButton(CONTINUE));
    });
  });

  describe("focus", () => {
    it("leaves the focus alone when the card appears", () => {
      renderCard();

      expect(document.body).toHaveFocus();
    });

    it("moves to the text when the statement changes", () => {
      renderWithI18n(<Puzzle />);

      getButton("Wolny rynek").focus();
      fireEvent.click(getButton("Wolny rynek"));

      expect(getText()).toHaveFocus();
    });

    it("does not make the text a stop for the Tab key", () => {
      renderCard();

      expect(getText()).toHaveAttribute("tabindex", "-1");
    });

    it('follows the order options, "Dalej", "Wyłącz checkpointy"', () => {
      renderCard({ options: OPTIONS });

      const stops = within(getRegion()).getAllByRole("button");

      expect(stops.map((stop) => stop.textContent)).toEqual([
        "Interwencjonizm",
        "Wolny rynek",
        CONTINUE,
        OPT_OUT,
      ]);
      expect(stops.every((stop) => stop.tabIndex === 0)).toBe(true);
    });
  });
});
