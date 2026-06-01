import { render, screen } from "@testing-library/react";
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
      expect(screen.getByRole("img")).toHaveAttribute(
        "src",
        "checkmark-strong.svg",
      );
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
      expect(screen.getByRole("img")).toHaveAttribute("src", "checkmark.svg");
    });
  });

  describe("given type is disagree", () => {
    it("renders the X icon", () => {
      render(<SurveyAnswer title="Test" type="disagree" onClick={vi.fn()} />);
      expect(screen.getByRole("img")).toHaveAttribute("src", "x.svg");
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
      expect(screen.getByRole("img")).toHaveAttribute("src", "x-strong.svg");
    });
  });

  describe("given type is custom", () => {
    it("renders the dash icon", () => {
      render(<SurveyAnswer title="Test" type="custom" onClick={vi.fn()} />);
      expect(screen.getByRole("img")).toHaveAttribute("src", "dash.svg");
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
      expect(screen.getByRole("img")).toHaveAttribute(
        "src",
        "circle-empty.svg",
      );
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
      expect(screen.getByRole("img")).toHaveAttribute(
        "src",
        "circle-checked.svg",
      );
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
    it("calls onClick", async () => {
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
      expect(onClick).toHaveBeenCalledTimes(1);
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

    it("renders with opacity-50 and cursor-not-allowed classes", () => {
      const { container } = render(
        <SurveyAnswer
          title="Test"
          type="agree"
          onClick={vi.fn()}
          isDisabled={true}
        />,
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("opacity-50");
      expect(button).toHaveClass("cursor-not-allowed");
    });
  });
});
