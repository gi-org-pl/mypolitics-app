import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NUMBER_ANIMATION_MS } from "../../SurveyControls.constants";
import { SurveyControlsCount } from "./SurveyControlsCount";

const withI18n = (count: number) => (
  <I18nProvider i18n={i18n}>
    <SurveyControlsCount count={count} />
  </I18nProvider>
);

const DURATION = `${NUMBER_ANIMATION_MS}ms`;

const getIcon = () =>
  screen.getByText(/Pozostałe pytania w kategorii/).previousElementSibling;

describe("<SurveyControlsCount />", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("on first render", () => {
    it("shows the value without animating", () => {
      render(withI18n(30));

      const number = screen.getByText("30");

      expect(number).not.toHaveClass("starting:opacity-0");
      expect(number).not.toHaveClass("opacity-0");
      expect(vi.getTimerCount()).toBe(0);
    });

    it("announces the number with its meaning", () => {
      render(withI18n(30));

      expect(
        screen.getByText("Pozostałe pytania w kategorii: 30"),
      ).toBeInTheDocument();
      expect(screen.getByText("30").parentElement).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });

    it("renders the icon as decoration", () => {
      render(withI18n(30));

      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(getIcon()).toHaveAttribute("aria-hidden", "true");
    });

    it("keeps the icon visible when colours are forced", () => {
      render(withI18n(30));

      expect(getIcon()).toHaveClass(
        "bg-current",
        "forced-colors:bg-[color:CanvasText]",
      );
    });
  });

  describe("when the value changes", () => {
    it("animates from the old value to the new one", () => {
      const { rerender } = render(withI18n(30));

      rerender(withI18n(29));

      expect(screen.getByText("30")).toHaveClass(
        "-translate-y-2",
        "opacity-0",
        "blur-[2px]",
      );
      expect(screen.getByText("29")).toHaveClass(
        "starting:translate-y-2",
        "starting:opacity-0",
        "starting:blur-[2px]",
      );
    });

    it("rolls the other way when the value goes up", () => {
      const { rerender } = render(withI18n(29));

      rerender(withI18n(30));

      expect(screen.getByText("29")).toHaveClass("translate-y-2", "opacity-0");
      expect(screen.getByText("30")).toHaveClass(
        "starting:-translate-y-2",
        "starting:opacity-0",
      );
    });

    it("animates for the duration of the constant", () => {
      const { rerender } = render(withI18n(30));

      rerender(withI18n(29));

      expect(screen.getByText("30")).toHaveStyle({
        transitionDuration: DURATION,
      });
      expect(screen.getByText("29")).toHaveStyle({
        transitionDuration: DURATION,
      });
    });

    it("does not animate under reduced motion", () => {
      const { rerender } = render(withI18n(30));

      rerender(withI18n(29));

      expect(screen.getByText("30")).toHaveClass(
        "motion-reduce:transition-none",
      );
      expect(screen.getByText("29")).toHaveClass(
        "motion-reduce:transition-none",
      );
    });

    it("announces the new value at once", () => {
      const { rerender } = render(withI18n(30));

      rerender(withI18n(29));

      expect(
        screen.getByText("Pozostałe pytania w kategorii: 29"),
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Pozostałe pytania w kategorii: 30"),
      ).not.toBeInTheDocument();
    });

    it("shows only the new value once the animation ends", () => {
      const { rerender } = render(withI18n(30));

      rerender(withI18n(29));
      act(() => {
        vi.advanceTimersByTime(NUMBER_ANIMATION_MS);
      });

      expect(screen.queryByText("30")).not.toBeInTheDocument();
      expect(screen.getByText("29")).not.toHaveClass("starting:opacity-0");
    });
  });

  describe("when the value changes again mid-animation", () => {
    it("ends on the latest value", () => {
      const { rerender } = render(withI18n(30));

      rerender(withI18n(29));
      act(() => {
        vi.advanceTimersByTime(NUMBER_ANIMATION_MS / 2);
      });
      rerender(withI18n(28));

      expect(screen.queryByText("30")).not.toBeInTheDocument();
      expect(screen.getByText("29")).toHaveClass("opacity-0");

      act(() => {
        vi.advanceTimersByTime(NUMBER_ANIMATION_MS);
      });

      expect(screen.queryByText("29")).not.toBeInTheDocument();
      expect(screen.getByText("28")).toBeInTheDocument();
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe("when unmounted mid-animation", () => {
    it("leaves no timer running", () => {
      const { rerender, unmount } = render(withI18n(30));

      rerender(withI18n(29));
      expect(vi.getTimerCount()).toBe(1);

      unmount();

      expect(vi.getTimerCount()).toBe(0);
    });
  });
});
