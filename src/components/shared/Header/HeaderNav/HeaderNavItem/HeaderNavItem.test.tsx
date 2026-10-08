import { fireEvent, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { FOCUS_CLASS_NAME } from "@/constants/focus";
import { LINK_ICON_MASK_CLASS_NAME } from "@/constants/icon";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import type { HeaderNavEntry } from "../HeaderNav.types";
import { HeaderNavItem } from "./HeaderNavItem";

const ENTRY: HeaderNavEntry = {
  key: "quizzes",
  label: { id: "test.quizzes", message: "Quizy" },
  path: "/quizzes",
  icon: "quizzes-icon.svg",
  iconClassName: "h-3.5 w-4.75",
};

const EXTERNAL_ENTRY: HeaderNavEntry = {
  ...ENTRY,
  key: "polls",
  label: { id: "test.polls", message: "Sondaże" },
  path: "https://polls.example.com",
  external: true,
};

const renderItem = (
  props: Partial<React.ComponentProps<typeof HeaderNavItem>> = {},
) => {
  const handleNavigate = vi.fn();

  renderWithI18n(
    <MemoryRouter>
      <HeaderNavItem
        entry={ENTRY}
        isActive={false}
        onNavigate={handleNavigate}
        {...props}
      />
    </MemoryRouter>,
  );

  return { handleNavigate };
};

describe("<HeaderNavItem />", () => {
  describe("given an entry of the app", () => {
    it("renders a link to its path, named by its label", () => {
      renderItem();

      expect(screen.getByRole("link", { name: "Quizy" })).toHaveAttribute(
        "href",
        "/quizzes",
      );
    });

    it("opens it in the same tab", () => {
      renderItem();

      const link = screen.getByRole("link", { name: "Quizy" });

      expect(link).not.toHaveAttribute("target");
      expect(link).not.toHaveAttribute("rel");
    });

    it("keeps the icon out of the name of the link", () => {
      renderItem();

      expect(screen.getByRole("link")).toHaveAccessibleName("Quizy");
    });

    it("draws the icon of the entry as a mask", () => {
      renderItem();

      const icon = screen.getByRole("link").querySelector("span");

      expect(icon?.style.maskImage).toBe('url("quizzes-icon.svg")');
    });

    it("draws the icon in the shared way that survives forced colours", () => {
      renderItem();

      expect(screen.getByRole("link").querySelector("span")).toHaveClass(
        ...LINK_ICON_MASK_CLASS_NAME.split(" "),
      );
    });

    it("shows keyboard focus as the shared outline", () => {
      renderItem();

      expect(screen.getByRole("link", { name: "Quizy" })).toHaveClass(
        ...FOCUS_CLASS_NAME.split(" "),
      );
    });
  });

  describe("given an entry that is not the current page", () => {
    it("does not mark the link as current", () => {
      renderItem({ isActive: false });

      expect(screen.getByRole("link", { name: "Quizy" })).not.toHaveAttribute(
        "aria-current",
      );
    });
  });

  describe("given the entry of the current page", () => {
    it("marks the link as the current page", () => {
      renderItem({ isActive: true });

      expect(
        screen.getByRole("link", { name: "Quizy", current: "page" }),
      ).toBeInTheDocument();
    });
  });

  describe("given an entry that leads outside the app", () => {
    it("opens it in a new tab without access to the opener", () => {
      renderItem({ entry: EXTERNAL_ENTRY });

      const link = screen.getByRole("link", { name: "Sondaże" });

      expect(link).toHaveAttribute("href", "https://polls.example.com");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  describe("when the link is clicked", () => {
    it("reports the navigation", () => {
      const { handleNavigate } = renderItem();

      fireEvent.click(screen.getByRole("link", { name: "Quizy" }));

      expect(handleNavigate).toHaveBeenCalledTimes(1);
    });
  });
});
