import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ResultsAxis } from "./ResultsAxis";

describe("<ResultsAxis />", () => {
  const defaultProps = {
    left: {
      name: "Left",
      iconUrl: "left.svg",
      value: 70,
      color: "gi-blue",
    },
    right: {
      name: "Right",
      iconUrl: "right.svg",
      value: 30,
      color: "gi-red",
    },
  };

  describe("given a left and right side", () => {
    it("renders both side names", () => {
      render(<ResultsAxis {...defaultProps} />);
      expect(screen.getByText("Left")).toBeInTheDocument();
      expect(screen.getByText("Right")).toBeInTheDocument();
    });

    it("renders both side icons with alt set to each name", () => {
      render(<ResultsAxis {...defaultProps} />);
      const leftIcon = screen.getByRole("img", { name: "Left" });
      const rightIcon = screen.getByRole("img", { name: "Right" });
      expect(leftIcon.querySelector("img")).toHaveAttribute("src", "left.svg");
      expect(rightIcon.querySelector("img")).toHaveAttribute(
        "src",
        "right.svg",
      );
    });
  });

  describe("given values that do not sum to 100", () => {
    it("normalizes segment widths to fill the bar", () => {
      const { container } = render(
        <ResultsAxis
          left={{ ...defaultProps.left, value: 30 }}
          right={{ ...defaultProps.right, value: 10 }}
        />,
      );
      const leftSide = container.querySelector(
        '[aria-label="Left"]',
      ) as HTMLElement;
      const rightSide = container.querySelector(
        '[aria-label="Right"]',
      ) as HTMLElement;
      expect(leftSide.style.width).toBe("75%");
      expect(rightSide.style.width).toBe("25%");
    });
  });

  describe("given both values are 0", () => {
    it("falls back to a 50/50 split", () => {
      const { container } = render(
        <ResultsAxis
          left={{ ...defaultProps.left, value: 0 }}
          right={{ ...defaultProps.right, value: 0 }}
        />,
      );
      const leftSide = container.querySelector(
        '[aria-label="Left"]',
      ) as HTMLElement;
      const rightSide = container.querySelector(
        '[aria-label="Right"]',
      ) as HTMLElement;
      expect(leftSide.style.width).toBe("50%");
      expect(rightSide.style.width).toBe("50%");
    });
  });

  describe("given a dominant side", () => {
    it("shows the dominant side rounded percentage label", () => {
      render(
        <ResultsAxis
          left={{ ...defaultProps.left, value: 90 }}
          right={{ ...defaultProps.right, value: 10 }}
        />,
      );
      expect(screen.getByText("90%")).toBeInTheDocument();
      expect(screen.queryByText("10%")).not.toBeInTheDocument();
    });

    it("rounds fractional percentages to whole numbers", () => {
      render(
        <ResultsAxis
          left={{ ...defaultProps.left, value: 66.6 }}
          right={{ ...defaultProps.right, value: 33.3 }}
        />,
      );
      expect(screen.getByText("67%")).toBeInTheDocument();
      expect(screen.getByText("33%")).toBeInTheDocument();
    });
  });

  describe("given an equal 50/50 split", () => {
    it("renders the balanced/equal state", () => {
      render(
        <ResultsAxis
          left={{ ...defaultProps.left, value: 50 }}
          right={{ ...defaultProps.right, value: 50 }}
        />,
      );
      const labels = screen.getAllByText("50%");
      expect(labels.length).toBe(2);
    });
  });

  describe("given isHighlighted is false", () => {
    it("renders the muted (non-colored) variant", () => {
      const { container } = render(
        <ResultsAxis {...defaultProps} isHighlighted={false} />,
      );
      const segments = container.querySelectorAll(".bg-gi-ash");
      expect(segments.length).toBeGreaterThan(0);
    });
  });

  describe("given onSideClick", () => {
    it('calls onSideClick("left") when the left side is clicked', () => {
      const onSideClick = vi.fn();
      render(<ResultsAxis {...defaultProps} onSideClick={onSideClick} />);
      fireEvent.click(screen.getByRole("button", { name: "Left" }));
      expect(onSideClick).toHaveBeenCalledWith("left");
    });

    it('calls onSideClick("right") when the right side is clicked', () => {
      const onSideClick = vi.fn();
      render(<ResultsAxis {...defaultProps} onSideClick={onSideClick} />);
      fireEvent.click(screen.getByRole("button", { name: "Right" }));
      expect(onSideClick).toHaveBeenCalledWith("right");
    });

    it("is operable via keyboard", () => {
      const onSideClick = vi.fn();
      render(<ResultsAxis {...defaultProps} onSideClick={onSideClick} />);
      const leftSide = screen.getByRole("button", { name: "Left" });

      leftSide.focus();
      expect(document.activeElement).toBe(leftSide);

      fireEvent.keyDown(leftSide, { key: "Enter", code: "Enter" });
      expect(leftSide.tagName).toBe("BUTTON");
    });
  });

  describe("given no onSideClick", () => {
    it("renders sides as non-interactive", () => {
      const { container } = render(<ResultsAxis {...defaultProps} />);
      const buttons = screen.queryAllByRole("button");
      expect(buttons.length).toBe(0);

      const leftSide = container.querySelector('[aria-label="Left"]');
      expect(leftSide?.tagName).toBe("DIV");
    });
  });

  describe("given an id", () => {
    it("applies the id to the root element", () => {
      render(<ResultsAxis {...defaultProps} id="custom-id" />);
      const root = screen.getByTestId("results-axis");
      expect(root).toHaveAttribute("id", "custom-id");
    });
  });
});
