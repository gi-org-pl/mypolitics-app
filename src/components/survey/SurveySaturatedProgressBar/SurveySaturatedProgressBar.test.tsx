import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SurveySaturatedProgressBar } from "./SurveySaturatedProgressBar";
import { BAR_ANIMATION_MS } from "./SurveySaturatedProgressBar.constants";
import { getSaturatedPercentValue } from "./utils/getSaturatedPercentValue";

vi.mock("@gi/athena", () => ({
  ProgressBar: ({ value }: { value: number }) => (
    <div data-testid="progress-bar" data-value={value} />
  ),
}));

describe("<SurveySaturatedProgressBar />", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("given value and maxValue", () => {
    it("renders Athena ProgressBar with the saturated percent value", () => {
      render(<SurveySaturatedProgressBar value={5} maxValue={10} />);

      const bar = screen.getByTestId("progress-bar");
      const expectedValue = getSaturatedPercentValue((5 / 10) * 100);

      expect(Number(bar.getAttribute("data-value"))).toBe(expectedValue);
    });
  });

  describe("given maxValue is 0", () => {
    it("renders ProgressBar with value 0 (no division by zero)", () => {
      render(<SurveySaturatedProgressBar value={5} maxValue={0} />);

      const bar = screen.getByTestId("progress-bar");

      expect(Number(bar.getAttribute("data-value"))).toBe(0);
    });
  });

  describe("when saturatedPercentValue changes", () => {
    it("sets flash to true immediately", () => {
      const { container, rerender } = render(
        <SurveySaturatedProgressBar value={1} maxValue={10} />,
      );

      rerender(<SurveySaturatedProgressBar value={2} maxValue={10} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("opacity-75");
    });

    it("clears flash after BAR_ANIMATION_MS", () => {
      const { container, rerender } = render(
        <SurveySaturatedProgressBar value={1} maxValue={10} />,
      );

      rerender(<SurveySaturatedProgressBar value={2} maxValue={10} />);

      act(() => {
        vi.advanceTimersByTime(BAR_ANIMATION_MS);
      });

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("opacity-100");
    });

    it("cancels the timeout on unmount", () => {
      const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

      const { unmount, rerender } = render(
        <SurveySaturatedProgressBar value={1} maxValue={10} />,
      );

      rerender(<SurveySaturatedProgressBar value={2} maxValue={10} />);
      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });
});
