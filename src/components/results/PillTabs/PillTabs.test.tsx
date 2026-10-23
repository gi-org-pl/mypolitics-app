import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PillTabs } from "./PillTabs";
import type { PillTabsProps } from "./PillTabs.types";

type Mode = "mode-friend" | "mode-orientation";

const renderTabs = (props: Partial<PillTabsProps<Mode>> = {}) => {
  const onChange = vi.fn();

  render(
    <PillTabs<Mode>
      label="Tryb porównania"
      tabs={[
        { value: "mode-friend", label: "Ze znajomym" },
        { value: "mode-orientation", label: "Z orientacją" },
      ]}
      value="mode-friend"
      onChange={onChange}
      {...props}
    />,
  );

  return { onChange };
};

const getTab = (name: string) => screen.getByRole("tab", { name });

describe("<PillTabs />", () => {
  describe("given tabs", () => {
    it("is a tab list with its name, and a tab for each of them in the order given", () => {
      renderTabs();

      expect(
        screen.getByRole("tablist", { name: "Tryb porównania" }),
      ).toBeInTheDocument();
      expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
        "Ze znajomym",
        "Z orientacją",
      ]);
    });

    it("marks the chosen tab as selected, and no other", () => {
      renderTabs({ value: "mode-orientation" });

      expect(getTab("Z orientacją")).toHaveAttribute("aria-selected", "true");
      expect(getTab("Ze znajomym")).toHaveAttribute("aria-selected", "false");
    });

    it("names each tab by its value and points it at the panel of that value", () => {
      renderTabs();

      expect(getTab("Ze znajomym")).toHaveAttribute("id", "tab-mode-friend");
      expect(getTab("Ze znajomym")).toHaveAttribute(
        "aria-controls",
        "panel-mode-friend",
      );
    });

    it("keeps each label on one line, and lets the pills stand under each other when the row is too narrow", () => {
      renderTabs();

      expect(screen.getByRole("tablist")).toHaveClass(
        "flex-wrap",
        "[&>[role=tab]]:whitespace-nowrap",
        "[&>[role=tab]]:basis-34",
      );
    });
  });

  describe("when another tab is pressed", () => {
    it("says which one was chosen", () => {
      const { onChange } = renderTabs();

      fireEvent.click(getTab("Z orientacją"));

      expect(onChange).toHaveBeenCalledExactlyOnceWith("mode-orientation");
    });
  });

  describe("when an arrow key is pressed on the chosen tab", () => {
    it("chooses the tab next to it", async () => {
      const user = userEvent.setup();
      const { onChange } = renderTabs();

      getTab("Ze znajomym").focus();
      await user.keyboard("{ArrowRight}");

      expect(onChange).toHaveBeenCalledWith("mode-orientation");
    });
  });

  describe("given the keyboard", () => {
    it("lets only the chosen tab be reached with Tab", () => {
      renderTabs();

      expect(getTab("Ze znajomym")).toHaveAttribute("tabindex", "0");
      expect(getTab("Z orientacją")).toHaveAttribute("tabindex", "-1");
    });
  });
});
