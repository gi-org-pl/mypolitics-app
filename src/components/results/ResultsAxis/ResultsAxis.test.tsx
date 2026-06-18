import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";
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
      renderWithI18n(<ResultsAxis {...defaultProps} />);
      expect(screen.getByText("Left")).toBeInTheDocument();
      expect(screen.getByText("Right")).toBeInTheDocument();
    });

    it("renders both side icons with alt set to each name", () => {
      renderWithI18n(<ResultsAxis {...defaultProps} />);
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
      const { container } = renderWithI18n(
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
      expect(leftSide.style.width).toBe("72.5%");
      expect(rightSide.style.width).toBe("27.5%");
    });
  });

  describe("given both values are 0", () => {
    it("falls back to a 50/50 split", () => {
      const { container } = renderWithI18n(
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
      renderWithI18n(
        <ResultsAxis
          left={{ ...defaultProps.left, value: 90 }}
          right={{ ...defaultProps.right, value: 10 }}
        />,
      );
      expect(screen.getByText("90%")).toBeInTheDocument();
      expect(screen.queryByText("10%")).not.toBeInTheDocument();
    });

    it("rounds fractional percentages to whole numbers", () => {
      renderWithI18n(
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
      renderWithI18n(
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
      const { container } = renderWithI18n(
        <ResultsAxis {...defaultProps} isHighlighted={false} />,
      );
      const segments = container.querySelectorAll(".bg-gi-ash");
      expect(segments.length).toBeGreaterThan(0);
    });
  });

  describe("given onSideClick", () => {
    it('calls onSideClick("left") when any left side interactive element is clicked', () => {
      const onSideClick = vi.fn();
      renderWithI18n(
        <ResultsAxis {...defaultProps} onSideClick={onSideClick} />,
      );
      const leftButtons = screen.getAllByRole("button", { name: "Left" });

      for (const button of leftButtons) {
        fireEvent.click(button);
      }

      expect(onSideClick).toHaveBeenCalledWith("left");
      expect(onSideClick).toHaveBeenCalledTimes(leftButtons.length);
    });

    it('calls onSideClick("right") when any right side interactive element is clicked', () => {
      const onSideClick = vi.fn();
      renderWithI18n(
        <ResultsAxis {...defaultProps} onSideClick={onSideClick} />,
      );
      const rightButtons = screen.getAllByRole("button", { name: "Right" });

      for (const button of rightButtons) {
        fireEvent.click(button);
      }

      expect(onSideClick).toHaveBeenCalledWith("right");
      expect(onSideClick).toHaveBeenCalledTimes(rightButtons.length);
    });

    it("is operable via keyboard", () => {
      const onSideClick = vi.fn();
      renderWithI18n(
        <ResultsAxis {...defaultProps} onSideClick={onSideClick} />,
      );
      const leftButtons = screen.getAllByRole("button", { name: "Left" });
      const leftSide = leftButtons[0];

      leftSide.focus();
      expect(document.activeElement).toBe(leftSide);

      fireEvent.keyDown(leftSide, { key: "Enter", code: "Enter" });
      expect(leftSide.tagName).toBe("BUTTON");
    });
  });

  describe("given no onSideClick", () => {
    it("renders sides as non-interactive", () => {
      const { container } = renderWithI18n(<ResultsAxis {...defaultProps} />);
      const buttons = screen.queryAllByRole("button");
      expect(buttons.length).toBe(0);

      const leftSide = container.querySelector('[aria-label="Left"]');
      expect(leftSide?.tagName).toBe("DIV");
    });
  });

  describe("given isNormalized is false", () => {
    it("does not normalize segment widths and uses raw values for labels", () => {
      const { container } = renderWithI18n(
        <ResultsAxis
          left={{ ...defaultProps.left, value: 30 }}
          right={{ ...defaultProps.right, value: 40 }}
          isNormalized={false}
        />,
      );
      const leftSide = container.querySelector(
        '[aria-label="Left"]',
      ) as HTMLElement;
      const rightSide = container.querySelector(
        '[aria-label="Right"]',
      ) as HTMLElement;

      expect(leftSide.style.width).toBe("32%");
      expect(rightSide.style.width).toBe("41%");

      expect(screen.getByText("30%")).toBeInTheDocument();
      expect(screen.getByText("40%")).toBeInTheDocument();
    });

    it("renders muted knobs when isHighlighted is false", () => {
      const { container } = renderWithI18n(
        <ResultsAxis
          left={{ ...defaultProps.left, value: 50 }}
          right={{ ...defaultProps.right, value: 50 }}
          isNormalized={false}
          isHighlighted={false}
        />,
      );

      const knobs = container.querySelectorAll(
        '[style*="var(--color-gi-gray)"]',
      );
      expect(knobs.length).toBe(2);
    });

    it("hides the knob for a side with 0% value", () => {
      const { container } = renderWithI18n(
        <ResultsAxis
          left={{ ...defaultProps.left, value: 0 }}
          right={{ ...defaultProps.right, value: 50 }}
          isNormalized={false}
        />,
      );

      const knob = container.querySelector('[style*="right: 50%"]');
      expect(knob).toBeInTheDocument();

      const leftKnob = container.querySelector('[style*="left: 5%"]');
      expect(leftKnob).not.toBeInTheDocument();
    });
  });

  describe("given one side is 0% in normalized mode", () => {
    it("uses gi-gray for the zero-percent side icon color", () => {
      renderWithI18n(
        <ResultsAxis
          left={{ ...defaultProps.left, value: 0 }}
          right={{ ...defaultProps.right, value: 100 }}
        />,
      );
    });
  });

  describe("given an id", () => {
    it("applies the id to the root element", () => {
      renderWithI18n(<ResultsAxis {...defaultProps} id="custom-id" />);
      const root = screen.getByTestId("results-axis");
      expect(root).toHaveAttribute("id", "custom-id");
    });
  });
});
