import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SurveyDemographicsModal } from "./SurveyDemographicsModal";

const renderModal = (isOpen = true) => {
  const onClose = vi.fn();
  renderWithI18n(<SurveyDemographicsModal isOpen={isOpen} onClose={onClose} />);

  return { onClose };
};

const ANCESTOR = "transformed-ancestor";

const renderInTransformedAncestor = () => {
  const onClose = vi.fn();
  renderWithI18n(
    <div data-testid={ANCESTOR} style={{ transform: "scale(1)" }}>
      <button type="button">Outside</button>
      <SurveyDemographicsModal isOpen onClose={onClose} />
    </div>,
  );

  return { onClose };
};

describe("<SurveyDemographicsModal />", () => {
  describe("given it is open", () => {
    it("renders a dialog named after its title", () => {
      renderModal();

      expect(
        screen.getByRole("dialog", { name: "Zakres wykorzystania danych" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Zakres wykorzystania danych" }),
      ).toBeInTheDocument();
    });

    it("renders both paragraphs", () => {
      renderModal();

      expect(
        screen.getByText(
          "Dzięki Twoim odpowiedziom w tej sekcji będziemy mogli przeanalizować Twoje wyniki w przyszłości w celu poprawienia działania quizu, a także przygotowania analiz na data.mypolitics.pl.",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Twoje dane pozostaną całkowicie anonimowe."),
      ).toBeInTheDocument();
    });

    it("is described by both paragraphs", () => {
      renderModal();

      const dialog = screen.getByRole("dialog");

      expect(dialog).toHaveAccessibleDescription(
        expect.stringContaining(
          "Dzięki Twoim odpowiedziom w tej sekcji będziemy mogli przeanalizować",
        ),
      );
      expect(dialog).toHaveAccessibleDescription(
        expect.stringContaining("Twoje dane pozostaną całkowicie anonimowe."),
      );
    });

    it("moves focus into the dialog", () => {
      renderModal();

      expect(screen.getByRole("dialog")).toContainElement(
        document.activeElement as HTMLElement,
      );
    });
  });

  describe("given it is closed", () => {
    it("renders nothing", () => {
      renderModal(false);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("when the close button is pressed", () => {
    it("calls onClose", () => {
      const { onClose } = renderModal();

      fireEvent.click(screen.getByRole("button", { name: "Close modal" }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("when Escape is pressed", () => {
    it("calls onClose", () => {
      const { onClose } = renderModal();

      fireEvent.keyDown(document, { key: "Escape" });

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("when the overlay is pressed", () => {
    it("calls onClose", () => {
      const { onClose } = renderModal();

      fireEvent.click(screen.getByRole("dialog").parentElement as HTMLElement);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("when the dialog itself is pressed", () => {
    it("does not call onClose", () => {
      const { onClose } = renderModal();

      fireEvent.click(screen.getByRole("dialog"));

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("given a transformed ancestor", () => {
    it("renders the overlay in the body, outside that ancestor", () => {
      renderInTransformedAncestor();

      const dialog = screen.getByRole("dialog", {
        name: "Zakres wykorzystania danych",
      });

      expect(dialog.parentElement?.parentElement).toBe(document.body);
      expect(screen.getByTestId(ANCESTOR)).not.toContainElement(dialog);
    });

    it("moves focus into the dialog", () => {
      renderInTransformedAncestor();

      expect(screen.getByRole("button", { name: "Close modal" })).toHaveFocus();
    });

    it("keeps focus in the dialog on Tab and Shift+Tab", async () => {
      const user = userEvent.setup();
      renderInTransformedAncestor();

      await user.tab();
      expect(screen.getByRole("button", { name: "Close modal" })).toHaveFocus();

      await user.tab({ shift: true });
      expect(screen.getByRole("button", { name: "Close modal" })).toHaveFocus();
    });

    it("calls onClose on Escape", async () => {
      const user = userEvent.setup();
      const { onClose } = renderInTransformedAncestor();

      await user.keyboard("{Escape}");

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
