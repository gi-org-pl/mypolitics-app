import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FOCUS_CLASS_NAME } from "@/constants/focus";
import { PATHS } from "@/constants/paths";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { FooterLeft } from "./FooterLeft";

describe("<FooterLeft />", () => {
  describe("given any year", () => {
    it("renders the myPolitics logo with its name", () => {
      renderWithI18n(<FooterLeft />);

      expect(screen.getByRole("img", { name: "myPolitics" })).toHaveAttribute(
        "src",
      );
    });

    it("renders the Generacja Innowacja logo as a link named after it", () => {
      renderWithI18n(<FooterLeft />);

      expect(
        screen.getByRole("link", { name: "Generacja Innowacja" }),
      ).toHaveAttribute("href", PATHS.generacjaInnowacja);
    });

    it("opens the Generacja Innowacja site in a new tab without access to the opener", () => {
      renderWithI18n(<FooterLeft />);

      const link = screen.getByRole("link", { name: "Generacja Innowacja" });

      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("shows keyboard focus on the link as the shared outline", () => {
      renderWithI18n(<FooterLeft />);

      expect(
        screen.getByRole("link", { name: "Generacja Innowacja" }),
      ).toHaveClass(...FOCUS_CLASS_NAME.split(" "));
    });
  });

  describe("given the year 2031", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2031-06-15T12:00:00"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("renders the copyright sign with that year", () => {
      renderWithI18n(<FooterLeft />);

      expect(screen.getByText("© 2031")).toBeInTheDocument();
    });
  });
});
