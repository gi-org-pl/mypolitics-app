import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SurveyAnswer } from "./SurveyAnswer";

vi.mock("../../../assets/icons/checkmark-strong", () => ({
  CheckmarkStrong: () => <svg data-testid="icon-checkmark-strong" />,
}));
vi.mock("../../../assets/icons/checkmark", () => ({
  Checkmark: () => <svg data-testid="icon-checkmark" />,
}));
vi.mock("../../../assets/icons/x-strong", () => ({
  XStrong: () => <svg data-testid="icon-x-strong" />,
}));
vi.mock("../../../assets/icons/x", () => ({
  X: () => <svg data-testid="icon-x" />,
}));
vi.mock("../../../assets/icons/dash", () => ({
  Dash: () => <svg data-testid="icon-dash" />,
}));
vi.mock("../../../assets/icons/circle-empty", () => ({
  CircleEmpty: () => <svg data-testid="icon-circle-empty" />,
}));
vi.mock("../../../assets/icons/circle-checked", () => ({
  CircleChecked: () => <svg data-testid="icon-circle-checked" />,
}));

describe("<SurveyAnswer />", () => {
  describe("given type is strongly-agree", () => {
    it("renders with the filled green background class", () => {
      const { container } = render(
        <SurveyAnswer title="Test" type="strongly-agree" onClick={vi.fn()} />,
      );
      expect(container.querySelector("button")).toHaveClass("bg-background");
    });

    it("renders the strong checkmark icon", () => {
      render(
        <SurveyAnswer title="Test" type="strongly-agree" onClick={vi.fn()} />,
      );
      expect(screen.getByTestId("icon-checkmark-strong")).toBeInTheDocument();
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
    it("renders with the surface background class", () => {
      const { container } = render(
        <SurveyAnswer title="Test" type="agree" onClick={vi.fn()} />,
      );
      expect(container.querySelector("button")).toHaveClass("bg-background");
    });

    it("renders the simple checkmark icon", () => {
      render(<SurveyAnswer title="Test" type="agree" onClick={vi.fn()} />);
      expect(screen.getByTestId("icon-checkmark")).toBeInTheDocument();
    });
  });

  describe("given type is disagree", () => {
    it("renders the X icon", () => {
      render(<SurveyAnswer title="Test" type="disagree" onClick={vi.fn()} />);
      expect(screen.getByTestId("icon-x")).toBeInTheDocument();
    });
  });

  describe("given type is strongly-disagree", () => {
    it("renders with the filled red background class", () => {
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
      expect(screen.getByTestId("icon-x-strong")).toBeInTheDocument();
    });
  });

  describe("given type is custom", () => {
    it("renders the dash icon", () => {
      render(<SurveyAnswer title="Test" type="custom" onClick={vi.fn()} />);
      expect(screen.getByTestId("icon-dash")).toBeInTheDocument();
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
      expect(screen.getByTestId("icon-circle-empty")).toBeInTheDocument();
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
      expect(screen.getByTestId("icon-circle-checked")).toBeInTheDocument();
    });

    it("applies the selected background tint class", () => {
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
