import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FOCUS_CLASS_NAME } from "@/constants/focus";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import type { QuizTab } from "../QuizSection.types";
import { QuizSectionTabs } from "./QuizSectionTabs";

const TAB_LIST_NAME = "Rodzaje quizów";
// The shared outline is written for the tabs inside the list.
const TAB_FOCUS_PREFIX = "[&>[role=tab]:focus-visible]:";
const TAB_NAMES = ["Wszystkie", "Wyborcze", "Społecznościowe"];

const renderTabs = (activeTab: QuizTab = "all") => {
  const onTabChange = vi.fn();

  renderWithI18n(
    <QuizSectionTabs activeTab={activeTab} onTabChange={onTabChange} />,
  );

  return { onTabChange };
};

const getTab = (name: string) => screen.getByRole("tab", { name });

describe("<QuizSectionTabs />", () => {
  describe("when it is rendered", () => {
    it("renders a named tab list with the three tabs in order", () => {
      renderTabs();

      expect(
        screen.getByRole("tablist", { name: TAB_LIST_NAME }),
      ).toBeInTheDocument();
      expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual(
        TAB_NAMES,
      );
    });

    it("keeps the tabs together at the left, wrapped or not", () => {
      renderTabs();

      const tabList = screen.getByRole("tablist");

      expect(tabList).toHaveClass("flex-wrap", "justify-start", "gap-2");
      expect(tabList).not.toHaveClass("justify-between");
    });

    it("spreads the tabs only on a narrow screen and only when the row is wide enough for all three", () => {
      renderTabs();

      const tabList = screen.getByRole("tablist");

      expect(tabList).toHaveClass("max-md:@sm:justify-between");
      expect(tabList.parentElement).toHaveClass("@container", "w-full");
    });

    it("draws keyboard focus on the tabs as the shared outline", () => {
      renderTabs();

      expect(screen.getByRole("tablist")).toHaveClass(
        ...FOCUS_CLASS_NAME.split(" ").map((className) =>
          className.replace("focus-visible:", TAB_FOCUS_PREFIX),
        ),
      );
    });
  });

  describe("when a tab is active", () => {
    it("marks that tab alone as selected", () => {
      renderTabs("electoral");

      expect(getTab("Wyborcze")).toHaveAttribute("aria-selected", "true");
      expect(getTab("Wszystkie")).toHaveAttribute("aria-selected", "false");
      expect(getTab("Społecznościowe")).toHaveAttribute(
        "aria-selected",
        "false",
      );
    });

    it("keeps that tab alone in the tab order", () => {
      renderTabs("electoral");

      expect(getTab("Wyborcze")).toHaveAttribute("tabindex", "0");
      expect(getTab("Wszystkie")).toHaveAttribute("tabindex", "-1");
      expect(getTab("Społecznościowe")).toHaveAttribute("tabindex", "-1");
    });
  });

  describe("when another tab is pressed", () => {
    it("calls onTabChange with that tab", () => {
      const { onTabChange } = renderTabs();

      fireEvent.click(getTab("Społecznościowe"));

      expect(onTabChange).toHaveBeenCalledTimes(1);
      expect(onTabChange).toHaveBeenCalledWith("social");
    });
  });

  describe("when an arrow key is pressed on the tab list", () => {
    it("asks for the next tab and moves the focus to it on the right arrow", () => {
      const { onTabChange } = renderTabs("all");

      fireEvent.keyDown(getTab("Wszystkie"), { key: "ArrowRight" });

      expect(onTabChange).toHaveBeenCalledWith("electoral");
      expect(getTab("Wyborcze")).toHaveFocus();
    });

    it("wraps from the first tab to the last one on the left arrow", () => {
      const { onTabChange } = renderTabs("all");

      fireEvent.keyDown(getTab("Wszystkie"), { key: "ArrowLeft" });

      expect(onTabChange).toHaveBeenCalledWith("social");
      expect(getTab("Społecznościowe")).toHaveFocus();
    });
  });

  describe("when Home or End is pressed on the tab list", () => {
    it("asks for the first tab on Home", () => {
      const { onTabChange } = renderTabs("social");

      fireEvent.keyDown(getTab("Społecznościowe"), { key: "Home" });

      expect(onTabChange).toHaveBeenCalledWith("all");
    });

    it("asks for the last tab on End", () => {
      const { onTabChange } = renderTabs("all");

      fireEvent.keyDown(getTab("Wszystkie"), { key: "End" });

      expect(onTabChange).toHaveBeenCalledWith("social");
    });
  });
});
