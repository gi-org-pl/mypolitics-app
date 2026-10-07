import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SurveyAnswer } from "./SurveyAnswer";

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

const getIcon = () => screen.getByRole("presentation");

describe("<SurveyAnswer />", () => {
  describe("given type is strongly-agree", () => {
    it("renders with the bg-background class", () => {
      const { container } = render(
        <SurveyAnswer title="Test" type="strongly-agree" onClick={vi.fn()} />,
      );
      expect(container.querySelector("button")).toHaveClass("bg-background");
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
      const { container } = render(
        <SurveyAnswer title="Test" type="agree" onClick={vi.fn()} />,
      );
      expect(container.querySelector("button")).toHaveClass("bg-background");
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
      const { container } = render(
        <SurveyAnswer
          title="Test"
          type="strongly-disagree"
          onClick={vi.fn()}
        />,
      );
      expect(container.querySelector("button")).toHaveClass("bg-background");
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
      const { container } = render(
        <SurveyAnswer
          title="Test"
          type="custom-selectable"
          isSelected={true}
          onClick={vi.fn()}
        />,
      );
      expect(container.querySelector("button")).toHaveClass("bg-background");
    });
  });

  describe("when the button is clicked and isDisabled is false", () => {
    it("calls onClick after animation delay for ripple types", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <SurveyAnswer
          title="Test"
          type="agree"
          onClick={onClick}
          isDisabled={false}
        />,
      );
      await user.click(screen.getByRole("button"));
      await waitFor(() => expect(onClick).toHaveBeenCalledTimes(1), {
        timeout: 1000,
      });
    });

    it("calls onClick immediately for custom-selectable type", async () => {
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
      await user.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalledTimes(1);
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
      await user.click(screen.getByRole("button", { name: "Test" }));
      expect(screen.getByRole("button", { name: "Test" })).toBeEnabled();
    });
  });

  describe("when the button is clicked again while the click animation runs", () => {
    it("ignores the second click", async () => {
      const onClick = vi.fn();
      render(<SurveyAnswer title="Test" type="agree" onClick={onClick} />);
      const button = screen.getByRole("button", { name: "Test" });

      fireEvent.click(button);
      await waitFor(() => expect(button).toHaveClass("pointer-events-none"));
      fireEvent.click(button);

      await waitFor(() => expect(onClick).toHaveBeenCalledTimes(1), {
        timeout: 1000,
      });
      await new Promise((resolve) => setTimeout(resolve, 400));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("when the ripple has finished expanding", () => {
    it("shrinks it back and lets the answer be clicked again", async () => {
      render(<SurveyAnswer title="Test" type="agree" onClick={vi.fn()} />);
      const button = screen.getByRole("button", { name: "Test" });
      const ripple = button.firstElementChild as HTMLElement;

      fireEvent.click(button);
      await waitFor(() =>
        expect(ripple.style.transition).toContain("ease-out"),
      );
      fireEvent.transitionEnd(ripple);

      await waitFor(
        () => expect(ripple.style.transition).toContain("ease-in"),
        {
          timeout: 1000,
        },
      );
      await waitFor(
        () => expect(button).not.toHaveClass("pointer-events-none"),
        { timeout: 1000 },
      );
    });
  });

  describe("when the button is clicked and isDisabled is true", () => {
    it("does not call onClick", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <SurveyAnswer
          title="Test"
          type="agree"
          onClick={onClick}
          isDisabled={true}
        />,
      );
      await user.click(screen.getByRole("button"));
      expect(onClick).not.toHaveBeenCalled();
    });

    it("is disabled for assistive technology and not clickable", () => {
      render(<SurveyAnswer title="Test" type="agree" isDisabled={true} />);
      const button = screen.getByRole("button", { name: "Test" });
      expect(button).toBeDisabled();
      expect(button).toHaveClass("cursor-not-allowed", "pointer-events-none");
    });

    it("fades the icon and the title, not the border and background", () => {
      render(<SurveyAnswer title="Test" type="agree" isDisabled={true} />);
      const button = screen.getByRole("button", { name: "Test" });
      expect(getIcon().parentElement).toHaveClass("opacity-50", "saturate-0");
      expect(screen.getByText("Test")).toHaveClass("opacity-50");
      expect(screen.getByText("Test")).not.toHaveClass("saturate-0");
      expect(button).not.toHaveClass("opacity-50");
      expect(button).toHaveClass("border-gi-dark-ash", "bg-background");
    });
  });

  describe("given an enabled answer", () => {
    it("does not fade the icon or the title", () => {
      render(<SurveyAnswer title="Test" type="agree" />);
      expect(getIcon().parentElement).not.toHaveClass("opacity-50");
      expect(screen.getByText("Test")).not.toHaveClass("opacity-50");
    });

    it("draws the light border when it is not selected", () => {
      render(<SurveyAnswer title="Test" type="custom-selectable" />);
      expect(screen.getByRole("button", { name: "Test" })).toHaveClass(
        "border-gi-dark-ash",
      );
    });

    it("draws the dark border when it is selected", () => {
      render(<SurveyAnswer title="Test" type="custom-selectable" isSelected />);
      const button = screen.getByRole("button", { name: "Test" });
      expect(button).toHaveClass("border-gi-dark-gray");
      expect(button).not.toHaveClass("border-gi-dark-ash");
    });
  });

  describe("given a title longer than the row", () => {
    const LONG_TITLE =
      "Bardzo długa odpowiedź, która nie mieści się w jednej linii wąskiego ekranu";

    it("renders the whole title", () => {
      render(<SurveyAnswer title={LONG_TITLE} type="custom-selectable" />);
      expect(
        screen.getByRole("button", { name: LONG_TITLE }),
      ).toBeInTheDocument();
    });

    it("keeps 56px as the minimum height instead of a fixed height", () => {
      render(<SurveyAnswer title={LONG_TITLE} type="custom-selectable" />);
      const button = screen.getByRole("button", { name: LONG_TITLE });
      expect(button).toHaveClass("min-h-14");
      expect(button).not.toHaveClass("h-14");
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
      expect(
        screen.getByRole("button", { name: "Zgadzam się" }),
      ).toBeInTheDocument();
    });

    it("hides the decorative icon from assistive technology", () => {
      render(<SurveyAnswer title="Zgadzam się" type="agree" />);
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(getIcon()).toHaveAttribute("alt", "");
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
      expect(
        screen.getByRole("button", { name: "Zgadzam się" }),
      ).not.toHaveAttribute("aria-pressed");
    });
  });
});
