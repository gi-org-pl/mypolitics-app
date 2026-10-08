import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SurveySaturatedProgressBar } from "./SurveySaturatedProgressBar";
import { BAR_ANIMATION_MS } from "./SurveySaturatedProgressBar.constants";
import type { SurveySaturatedProgressBarProps } from "./SurveySaturatedProgressBar.types";
import { getSaturatedPercentValue } from "./utils/getSaturatedPercentValue";

const FLASH_CLASS_NAME = "motion-safe:opacity-75";

const getBarElement = (props: SurveySaturatedProgressBarProps) => (
  <I18nProvider i18n={i18n}>
    <SurveySaturatedProgressBar {...props} />
  </I18nProvider>
);

const renderBar = (props: SurveySaturatedProgressBarProps) => {
  const view = render(getBarElement(props));

  return {
    ...view,
    rerenderBar: (nextProps: SurveySaturatedProgressBarProps) =>
      view.rerender(getBarElement(nextProps)),
  };
};

const getBar = () => screen.getByRole("progressbar", { name: "Postęp quizu" });

const getFill = () => getBar().firstElementChild as HTMLElement;

const getFlashingElement = (container: HTMLElement) =>
  container.firstElementChild as HTMLElement;

describe("<SurveySaturatedProgressBar />", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("given value and maxValue", () => {
    it("fills the bar to the saturated percent value", () => {
      renderBar({ value: 2, maxValue: 10 });

      expect(getFill().style.width).toBe(`${getSaturatedPercentValue(20)}%`);
    });

    it("fills the bar to the true value past the midpoint", () => {
      renderBar({ value: 8, maxValue: 10 });

      expect(getFill().style.width).toBe("80%");
    });

    it("takes the width of its parent", () => {
      const { container } = renderBar({ value: 2, maxValue: 10 });

      expect(getFlashingElement(container)).toHaveClass("w-full");
    });
  });

  describe("on first render", () => {
    it("does not flash", () => {
      const { container } = renderBar({ value: 3, maxValue: 10 });

      expect(getFlashingElement(container)).not.toHaveClass(FLASH_CLASS_NAME);
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe("when the shown value changes", () => {
    it("flashes once and settles", () => {
      const { container, rerenderBar } = renderBar({ value: 1, maxValue: 10 });

      rerenderBar({ value: 2, maxValue: 10 });

      expect(getFlashingElement(container)).toHaveClass(FLASH_CLASS_NAME);

      act(() => vi.advanceTimersByTime(BAR_ANIMATION_MS));

      expect(getFlashingElement(container)).not.toHaveClass(FLASH_CLASS_NAME);
      expect(vi.getTimerCount()).toBe(0);
    });

    it("flashes on a step back as well", () => {
      const { container, rerenderBar } = renderBar({ value: 2, maxValue: 10 });

      rerenderBar({ value: 1, maxValue: 10 });

      expect(getFlashingElement(container)).toHaveClass(FLASH_CLASS_NAME);
    });
  });

  describe("when the value changes again during a flash", () => {
    it("ends one flash after the last change", () => {
      const { container, rerenderBar } = renderBar({ value: 1, maxValue: 10 });

      rerenderBar({ value: 2, maxValue: 10 });
      act(() => vi.advanceTimersByTime(BAR_ANIMATION_MS - 100));
      rerenderBar({ value: 3, maxValue: 10 });
      act(() => vi.advanceTimersByTime(BAR_ANIMATION_MS - 1));

      expect(getFlashingElement(container)).toHaveClass(FLASH_CLASS_NAME);

      act(() => vi.advanceTimersByTime(1));

      expect(getFlashingElement(container)).not.toHaveClass(FLASH_CLASS_NAME);
    });
  });

  describe("when it is rendered again with the same value", () => {
    it("does not flash", () => {
      const { container, rerenderBar } = renderBar({ value: 2, maxValue: 10 });

      rerenderBar({ value: 2, maxValue: 10 });

      expect(getFlashingElement(container)).not.toHaveClass(FLASH_CLASS_NAME);
    });
  });

  describe("given a taker who asked for reduced motion", () => {
    it("lightens the bar only where motion is allowed, and moves the fill at once", () => {
      const { container } = renderBar({ value: 2, maxValue: 10 });

      expect(getFlashingElement(container)).toHaveClass(
        "motion-reduce:transition-none",
      );
      expect(getBar()).toHaveClass("motion-reduce:*:transition-none");
    });
  });

  describe("given forced colours", () => {
    it("keeps the track and the fill apart with system colours", () => {
      renderBar({ value: 2, maxValue: 10 });

      expect(getBar()).toHaveClass(
        "forced-colors:border",
        "forced-colors:*:bg-[Highlight]",
      );
    });
  });

  describe("accessibility", () => {
    it('is a progress bar named "Postęp quizu"', () => {
      renderBar({ value: 2, maxValue: 10 });

      expect(getBar()).toBeInTheDocument();
    });

    it("reports the shown value rounded to a whole percent", () => {
      renderBar({ value: 1, maxValue: 10 });

      expect(getSaturatedPercentValue(10)).toBeCloseTo(20.8);
      expect(getBar()).toHaveAttribute("aria-valuenow", "21");
      expect(getBar()).toHaveAttribute("aria-valuemin", "0");
      expect(getBar()).toHaveAttribute("aria-valuemax", "100");
    });

    it("announces no change as it happens and cannot be focused", () => {
      renderBar({ value: 1, maxValue: 10 });

      expect(getBar()).not.toHaveAttribute("aria-live");
      expect(getBar()).not.toHaveAttribute("tabindex");
    });
  });

  describe("invalid input", () => {
    it.each([0, -5, Number.NaN])("is empty when maxValue is %s", (maxValue) => {
      renderBar({ value: 5, maxValue });

      expect(getFill().style.width).toBe("0%");
      expect(getBar()).toHaveAttribute("aria-valuenow", "0");
    });

    it.each([-1, Number.NaN])("is empty when value is %s", (value) => {
      renderBar({ value, maxValue: 10 });

      expect(getFill().style.width).toBe("0%");
      expect(getBar()).toHaveAttribute("aria-valuenow", "0");
    });

    it("is full when value is above maxValue", () => {
      renderBar({ value: 11, maxValue: 10 });

      expect(getFill().style.width).toBe("100%");
      expect(getBar()).toHaveAttribute("aria-valuenow", "100");
    });

    it("uses fractions as given", () => {
      renderBar({ value: 7.5, maxValue: 10 });

      expect(getFill().style.width).toBe("75%");
    });
  });

  describe("given a quiz with one question", () => {
    it("is empty, then full", () => {
      const { rerenderBar } = renderBar({ value: 0, maxValue: 1 });

      expect(getFill().style.width).toBe("0%");

      rerenderBar({ value: 1, maxValue: 1 });

      expect(getFill().style.width).toBe("100%");
    });
  });
});
