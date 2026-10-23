import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { ModuleInfoDialog } from "./ModuleInfoDialog";
import type { ModuleInfoDialogProps } from "./ModuleInfoDialog.types";

const DESCRIPTION =
  "W quizie tożsamościowym nie dopasowujemy partii do Twoich wyników według odpowiedzi.";

const renderDialog = (props: Partial<ModuleInfoDialogProps> = {}) => {
  const onClose = vi.fn();

  renderWithI18n(
    <ModuleInfoDialog
      title="Partie"
      description={DESCRIPTION}
      isOpen
      onClose={onClose}
      {...props}
    />,
  );

  return { onClose };
};

describe("<ModuleInfoDialog />", () => {
  describe("given it is open", () => {
    it("renders a dialog named after the title of the module", () => {
      renderDialog();

      expect(
        screen.getByRole("dialog", { name: "Partie" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Partie" }),
      ).toBeInTheDocument();
    });

    it("shows the description, and is described by it", () => {
      renderDialog();

      expect(screen.getByText(DESCRIPTION)).toBeVisible();
      expect(screen.getByRole("dialog")).toHaveAccessibleDescription(
        DESCRIPTION,
      );
    });

    it("draws the title and the description as text, never as markup", () => {
      renderDialog({
        title: "<b>Partie</b>",
        description: '<img src="x" alt="obrazek"> opis',
      });

      expect(
        screen.getByRole("dialog", { name: "<b>Partie</b>" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText('<img src="x" alt="obrazek"> opis'),
      ).toBeInTheDocument();
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("keeps the line breaks of the description", () => {
      renderDialog({ description: "Pierwszy wiersz.\nDrugi wiersz." });

      expect(
        screen.getByText(/Pierwszy wiersz\.\s+Drugi wiersz\./),
      ).toHaveClass("whitespace-pre-line");
    });

    it("renders in the body, so no ancestor can cut it off", () => {
      renderDialog();

      expect(screen.getByRole("dialog").parentElement?.parentElement).toBe(
        document.body,
      );
    });

    it("moves focus into the dialog", () => {
      renderDialog();

      expect(screen.getByRole("dialog")).toContainElement(
        document.activeElement as HTMLElement,
      );
    });
  });

  describe("given a module with no title, or a blank one", () => {
    it.each([
      ["none", undefined],
      ["only spaces", "  "],
    ])('is named "Informacje": %s', (_, title) => {
      renderDialog({ title });

      expect(
        screen.getByRole("dialog", { name: "Informacje" }),
      ).toBeInTheDocument();
    });
  });

  describe("given it is closed", () => {
    it("renders nothing", () => {
      renderDialog({ isOpen: false });

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.queryByText(DESCRIPTION)).not.toBeInTheDocument();
    });
  });

  describe('when "Zamknij" is pressed', () => {
    it("calls onClose", () => {
      const { onClose } = renderDialog();

      fireEvent.click(screen.getByRole("button", { name: "Zamknij" }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("when Escape is pressed", () => {
    it("calls onClose", () => {
      const { onClose } = renderDialog();

      fireEvent.keyDown(document, { key: "Escape" });

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("when the overlay is pressed", () => {
    it("calls onClose", () => {
      const { onClose } = renderDialog();

      fireEvent.click(screen.getByRole("dialog").parentElement as HTMLElement);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("when the dialog itself is pressed", () => {
    it("does not call onClose", () => {
      const { onClose } = renderDialog();

      fireEvent.click(screen.getByRole("dialog"));

      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
