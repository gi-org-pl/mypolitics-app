import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SurveyAnswer } from "./SurveyAnswer";
import { CLICK_ANIMATION_MS } from "./SurveyAnswer.constants";
import type { SurveyAnswerType } from "./SurveyAnswer.types";

vi.mock("../../../assets/icons/checkmark.svg", () => ({
  default: "checkmark.svg",
}));
vi.mock("../../../assets/icons/checkmark-strong.svg", () => ({
  default: "checkmark-strong.svg",
}));
vi.mock("../../../assets/icons/circle-checked.svg", () => ({
  default: "circle-checked.svg",
}));
vi.mock("../../../assets/icons/circle-empty.svg", () => ({
  default: "circle-empty.svg",
}));
vi.mock("../../../assets/icons/dash.svg", () => ({ default: "dash.svg" }));
vi.mock("../../../assets/icons/x.svg", () => ({ default: "x.svg" }));
vi.mock("../../../assets/icons/x-strong.svg", () => ({
  default: "x-strong.svg",
}));

const ANSWER_TYPES: SurveyAnswerType[] = [
  "strongly-agree",
  "agree",
  "disagree",
  "strongly-disagree",
  "custom",
  "custom-selectable",
];

const FRAME_MS = 16;

const getButton = (name = "Test") => screen.getByRole("button", { name });

const getIcon = () => screen.getByRole("presentation");

const getRipple = () => screen.getByTestId("survey-answer-ripple");

const advance = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

describe("<SurveyAnswer />", () => {
  describe("given type is strongly-agree", () => {
    it("renders with the bg-background class", () => {
      render(
        <SurveyAnswer title="Test" type="strongly-agree" onClick={vi.fn()} />,
      );
      expect(getButton()).toHaveClass("bg-background");
    });

    it("renders the strong checkmark icon", () => {
      render(
        <SurveyAnswer title="Test" type="strongly-agree" onClick={vi.fn()} />,
      );
      expect(getIcon()).toHaveAttribute("src", "checkmark-strong.svg");
    });

    it("renders the title text", () => {
      render(
        <SurveyAnswer
          title="Zdecydowanie się zgadzam"
          type="strongly-agree"
          onClick={vi.fn()}
        />,
      );
      expect(screen.getByText("Zdecydowanie się zgadzam")).toBeInTheDocument();
    });
  });

  describe("given type is agree", () => {
    it("renders with the bg-background class", () => {
      render(<SurveyAnswer title="Test" type="agree" onClick={vi.fn()} />);
      expect(getButton()).toHaveClass("bg-background");
    });

    it("renders the simple checkmark icon", () => {
      render(<SurveyAnswer title="Test" type="agree" onClick={vi.fn()} />);
      expect(getIcon()).toHaveAttribute("src", "checkmark.svg");
    });
  });

  describe("given type is disagree", () => {
    it("renders the X icon", () => {
      render(<SurveyAnswer title="Test" type="disagree" onClick={vi.fn()} />);
      expect(getIcon()).toHaveAttribute("src", "x.svg");
    });
  });

  describe("given type is strongly-disagree", () => {
    it("renders with the bg-background class", () => {
      render(
        <SurveyAnswer
          title="Test"
          type="strongly-disagree"
          onClick={vi.fn()}
        />,
      );
      expect(getButton()).toHaveClass("bg-background");
    });

    it("renders the strong X icon", () => {
      render(
        <SurveyAnswer
          title="Test"
          type="strongly-disagree"
          onClick={vi.fn()}
        />,
      );
      expect(getIcon()).toHaveAttribute("src", "x-strong.svg");
    });
  });

  describe("given type is custom", () => {
    it("renders the dash icon", () => {
      render(<SurveyAnswer title="Test" type="custom" onClick={vi.fn()} />);
      expect(getIcon()).toHaveAttribute("src", "dash.svg");
    });
  });

  describe("given type is custom-selectable and isSelected is false", () => {
    it("renders the empty circle icon", () => {
      render(
        <SurveyAnswer
          title="Test"
          type="custom-selectable"
          isSelected={false}
          onClick={vi.fn()}
        />,
      );
      expect(getIcon()).toHaveAttribute("src", "circle-empty.svg");
    });
  });

  describe("given type is custom-selectable and isSelected is true", () => {
    it("renders the checked circle icon", () => {
      render(
        <SurveyAnswer
          title="Test"
          type="custom-selectable"
          isSelected={true}
          onClick={vi.fn()}
        />,
      );
      expect(getIcon()).toHaveAttribute("src", "circle-checked.svg");
    });

    it("applies the bg-background class", () => {
      render(
        <SurveyAnswer
          title="Test"
          type="custom-selectable"
          isSelected={true}
          onClick={vi.fn()}
        />,
      );
      expect(getButton()).toHaveClass("bg-background");
    });
  });

  describe("when a custom-selectable answer is clicked", () => {
    it("calls onClick immediately", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <SurveyAnswer
          title="Test"
          type="custom-selectable"
          onClick={onClick}
          isDisabled={false}
        />,
      );
      await user.click(getButton());
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("has no ripple", () => {
      render(<SurveyAnswer title="Test" type="custom-selectable" />);
      expect(
        screen.queryByTestId("survey-answer-ripple"),
      ).not.toBeInTheDocument();
    });
  });

  describe("when onClick is not provided", () => {
    it("renders without throwing", () => {
      expect(() =>
        render(<SurveyAnswer title="Test" type="agree" />),
      ).not.toThrow();
    });

    it("does not throw when a custom-selectable answer is clicked", async () => {
      const user = userEvent.setup();
      render(<SurveyAnswer title="Test" type="custom-selectable" />);
      await user.click(getButton());
      expect(getButton()).toBeEnabled();
    });
  });

  describe("click animation of an answer with a ripple", () => {
    beforeEach(() => {
      vi.useFakeTimers({
        toFake: [
          "setTimeout",
          "clearTimeout",
          "requestAnimationFrame",
          "cancelAnimationFrame",
        ],
      });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    describe("when the button is clicked", () => {
      it("calls onClick once the animation delay has passed", () => {
        const onClick = vi.fn();
        render(<SurveyAnswer title="Test" type="agree" onClick={onClick} />);

        fireEvent.click(getButton());
        advance(CLICK_ANIMATION_MS - 1);
        expect(onClick).not.toHaveBeenCalled();

        advance(1);
        expect(onClick).toHaveBeenCalledTimes(1);
      });

      it("does not throw after the delay when onClick is not provided", () => {
        render(<SurveyAnswer title="Test" type="agree" />);

        fireEvent.click(getButton());
        advance(CLICK_ANIMATION_MS);

        expect(getButton()).toBeInTheDocument();
      });

      it("expands the ripple and blocks further clicks", () => {
        render(<SurveyAnswer title="Test" type="agree" onClick={vi.fn()} />);

        fireEvent.click(getButton());
        advance(FRAME_MS);

        expect(getRipple().style.transition).toContain("ease-out");
        expect(getButton()).toHaveClass(
          "pointer-events-none",
          "cursor-not-allowed",
        );
      });
    });

    describe("when the button is clicked again while the animation runs", () => {
      it("ignores the second click", () => {
        const onClick = vi.fn();
        render(<SurveyAnswer title="Test" type="agree" onClick={onClick} />);

        fireEvent.click(getButton());
        advance(FRAME_MS);
        fireEvent.click(getButton());
        advance(CLICK_ANIMATION_MS * 3);

        expect(onClick).toHaveBeenCalledTimes(1);
      });
    });

    describe("when the ripple has finished expanding", () => {
      it("shrinks it back and lets the answer be clicked again", () => {
        render(<SurveyAnswer title="Test" type="agree" onClick={vi.fn()} />);

        fireEvent.click(getButton());
        advance(FRAME_MS);
        fireEvent.transitionEnd(getRipple());

        advance(CLICK_ANIMATION_MS);
        expect(getRipple().style.transition).toContain("ease-in");

        advance(CLICK_ANIMATION_MS);
        expect(getRipple().style.transition).toBe("none");
        expect(getButton()).not.toHaveClass("pointer-events-none");
      });
    });
  });

  describe("when the button is clicked and isDisabled is true", () => {
    it("does not call onClick", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <SurveyAnswer
          title="Test"
          type="custom-selectable"
          onClick={onClick}
          isDisabled={true}
        />,
      );
      await user.click(getButton());
      expect(onClick).not.toHaveBeenCalled();
    });

    it("is disabled for assistive technology and not clickable", () => {
      render(<SurveyAnswer title="Test" type="agree" isDisabled={true} />);
      expect(getButton()).toBeDisabled();
      expect(getButton()).toHaveClass(
        "cursor-not-allowed",
        "pointer-events-none",
      );
    });

    it("fades the icon and the title, not the border and background", () => {
      render(<SurveyAnswer title="Test" type="agree" isDisabled={true} />);
      expect(getIcon()).toHaveClass("opacity-50", "saturate-0");
      expect(screen.getByText("Test")).toHaveClass("opacity-50");
      expect(screen.getByText("Test")).not.toHaveClass("saturate-0");
      expect(getButton()).not.toHaveClass("opacity-50");
      expect(getButton()).toHaveClass("border-gi-dark-ash", "bg-background");
    });
  });

  describe("given an enabled answer", () => {
    it("does not fade the icon or the title", () => {
      render(<SurveyAnswer title="Test" type="agree" />);
      expect(getIcon()).not.toHaveClass("opacity-50");
      expect(screen.getByText("Test")).not.toHaveClass("opacity-50");
    });

    it("draws the light border when it is not selected", () => {
      render(<SurveyAnswer title="Test" type="custom-selectable" />);
      expect(getButton()).toHaveClass("border-gi-dark-ash");
    });

    it("draws the dark border when it is selected", () => {
      render(<SurveyAnswer title="Test" type="custom-selectable" isSelected />);
      expect(getButton()).toHaveClass("border-gi-dark-gray");
      expect(getButton()).not.toHaveClass("border-gi-dark-ash");
    });
  });

  describe("given any answer", () => {
    it("keeps the frame's 16px inset as 15px of padding next to the 1px border", () => {
      render(<SurveyAnswer title="Test" type="custom-selectable" />);
      expect(getButton()).toHaveClass("border", "p-[15px]");
      expect(getButton()).not.toHaveClass("p-4", "px-4");
    });

    it("sets the title in the design's 19px line", () => {
      render(<SurveyAnswer title="Test" type="custom-selectable" />);
      expect(screen.getByText("Test")).toHaveClass("leading-[19px]");
    });
  });

  describe("given a title longer than the row", () => {
    const LONG_TITLE =
      "Bardzo długa odpowiedź, która nie mieści się w jednej linii wąskiego ekranu";

    it("renders the whole title", () => {
      render(<SurveyAnswer title={LONG_TITLE} type="custom-selectable" />);
      expect(getButton(LONG_TITLE)).toBeInTheDocument();
    });

    it("keeps 56px as the minimum height instead of a fixed height", () => {
      render(<SurveyAnswer title={LONG_TITLE} type="custom-selectable" />);
      expect(getButton(LONG_TITLE)).toHaveClass("min-h-14");
      expect(getButton(LONG_TITLE)).not.toHaveClass("h-14");
    });

    it("lets the title wrap, also inside a single long word", () => {
      render(<SurveyAnswer title={LONG_TITLE} type="custom-selectable" />);
      const label = screen.getByText(LONG_TITLE);
      expect(label).toHaveClass("min-w-0", "wrap-break-word");
      expect(label).not.toHaveClass("truncate");
    });
  });

  describe("accessibility", () => {
    it("names the button after its title alone", () => {
      render(<SurveyAnswer title="Zgadzam się" type="agree" />);
      expect(getButton("Zgadzam się")).toBeInTheDocument();
    });

    it("hides the decorative icon from assistive technology", () => {
      render(<SurveyAnswer title="Zgadzam się" type="agree" />);
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(getIcon()).toHaveAttribute("alt", "");
    });

    it("hides the ripple from assistive technology", () => {
      render(<SurveyAnswer title="Zgadzam się" type="agree" />);
      expect(getRipple()).toHaveAttribute("aria-hidden", "true");
    });

    it("exposes an unselected custom-selectable answer as not pressed", () => {
      render(
        <SurveyAnswer
          title="Ekologia"
          type="custom-selectable"
          isSelected={false}
        />,
      );
      expect(
        screen.getByRole("button", { name: "Ekologia", pressed: false }),
      ).toBeInTheDocument();
    });

    it("exposes a selected custom-selectable answer as pressed", () => {
      render(
        <SurveyAnswer title="Ekologia" type="custom-selectable" isSelected />,
      );
      expect(
        screen.getByRole("button", { name: "Ekologia", pressed: true }),
      ).toBeInTheDocument();
    });

    it("gives the other answer types no pressed state", () => {
      render(<SurveyAnswer title="Zgadzam się" type="agree" isSelected />);
      expect(getButton("Zgadzam się")).not.toHaveAttribute("aria-pressed");
    });

    it.each(
      ANSWER_TYPES,
    )("shows a 2px gi-primary focus outline outside the border for %s", (type) => {
      render(<SurveyAnswer title="Test" type={type} />);
      expect(getButton()).toHaveClass(
        "focus-visible:outline-2",
        "focus-visible:outline-offset-2",
        "focus-visible:outline-gi-primary",
      );
    });

    it("can be focused from the keyboard", async () => {
      const user = userEvent.setup();
      render(<SurveyAnswer title="Test" type="custom-selectable" />);
      await user.tab();
      expect(getButton()).toHaveFocus();
    });
  });
});
