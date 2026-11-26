import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { AuthCard } from "./AuthCard";

describe("AuthCard", () => {
  describe("given a heading, a line and content", () => {
    it("draws all three", () => {
      renderWithI18n(
        <AuthCard heading="Nagłówek" description="Linia">
          <p>Treść</p>
        </AuthCard>,
      );

      expect(
        screen.getByRole("heading", { level: 2, name: "Nagłówek" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Linia")).toBeInTheDocument();
      expect(screen.getByText("Treść")).toBeInTheDocument();
    });
  });

  describe("given ids for the heading and the line", () => {
    it("puts them on the heading and the line", () => {
      renderWithI18n(
        <AuthCard
          heading="Nagłówek"
          description="Linia"
          headingId="heading-id"
          descriptionId="line-id"
        >
          <p>Treść</p>
        </AuthCard>,
      );

      expect(screen.getByRole("heading")).toHaveAttribute("id", "heading-id");
      expect(screen.getByText("Linia")).toHaveAttribute("id", "line-id");
    });
  });

  describe("given no close handler", () => {
    it("has no close button", () => {
      renderWithI18n(
        <AuthCard heading="Nagłówek" description="Linia">
          <p>Treść</p>
        </AuthCard>,
      );

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("given a close handler", () => {
    it("calls it from the close button", () => {
      const onClose = vi.fn();
      renderWithI18n(
        <AuthCard heading="Nagłówek" description="Linia" onClose={onClose}>
          <p>Treść</p>
        </AuthCard>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Zamknij" }));

      expect(onClose).toHaveBeenCalledOnce();
    });

    it("disables the close button when told to", () => {
      const onClose = vi.fn();
      renderWithI18n(
        <AuthCard
          heading="Nagłówek"
          description="Linia"
          onClose={onClose}
          isCloseDisabled
        >
          <p>Treść</p>
        </AuthCard>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Zamknij" }));

      expect(screen.getByRole("button", { name: "Zamknij" })).toBeDisabled();
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
