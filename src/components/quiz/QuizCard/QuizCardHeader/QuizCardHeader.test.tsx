import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";
import {
  LOGO_HEIGHT_CLASS_NAMES,
  TOGGLE_HIDDEN_ON_WIDE_SCREEN_CLASS_NAME,
} from "../QuizCard.constants";
import { QuizCardHeader } from "./QuizCardHeader";
import type { QuizCardHeaderProps } from "./QuizCardHeader.types";

const TITLE = "Polskie Lata 90.";
const LOGO_URL = "/assets/quiz-logo-mypolitics.svg";
const BODY_ID = "quiz-card-body";
const PLAY_NAME = "Rozpocznij quiz";
const EXPAND_NAME = "Rozwiń";
const COLLAPSE_NAME = "Zwiń";

const renderHeader = (props: Partial<QuizCardHeaderProps> = {}) =>
  renderWithI18n(
    <QuizCardHeader
      title={TITLE}
      logoHeight={24}
      bodyId={BODY_ID}
      isOpen={false}
      isCollapsible
      isOpenOnWideScreen={false}
      isShowStartText={false}
      isButtonLoading={false}
      isButtonDisabled={false}
      onToggle={vi.fn()}
      onButtonClick={vi.fn()}
      {...props}
    />,
  );

describe("<QuizCardHeader />", () => {
  describe("given a logoUrl", () => {
    it("renders the logo image named after the title, inside the heading", () => {
      renderHeader({ logoUrl: LOGO_URL });

      expect(screen.getByRole("heading", { name: TITLE })).toContainElement(
        screen.getByRole("img", { name: TITLE }),
      );
    });

    it("does not repeat the title as text", () => {
      renderHeader({ logoUrl: LOGO_URL });

      expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
    });

    it("passes the logo height on", () => {
      renderHeader({ logoUrl: LOGO_URL, logoHeight: 32 });

      expect(screen.getByRole("img", { name: TITLE })).toHaveClass(
        LOGO_HEIGHT_CLASS_NAMES[32],
      );
    });
  });

  describe("given no logoUrl but a title", () => {
    it("renders the title as the text of the heading", () => {
      renderHeader();

      expect(screen.getByRole("heading")).toHaveTextContent(TITLE);
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });
  });

  describe("given neither a logoUrl nor a title", () => {
    it("renders the buttons alone", () => {
      renderHeader({ title: undefined });

      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
      expect(
        screen
          .getAllByRole("button")
          .map((button) => button.getAttribute("aria-label")),
      ).toEqual([EXPAND_NAME, PLAY_NAME]);
    });
  });

  describe("given a collapsible card", () => {
    it("renders the toggle before the play button", () => {
      renderHeader();

      expect(
        screen
          .getAllByRole("button")
          .map((button) => button.getAttribute("aria-label")),
      ).toEqual([EXPAND_NAME, PLAY_NAME]);
    });

    it("points the toggle at the body", () => {
      renderHeader();

      expect(screen.getByRole("button", { name: EXPAND_NAME })).toHaveAttribute(
        "aria-controls",
        BODY_ID,
      );
    });

    it("tells the toggle that the card is open", () => {
      renderHeader({ isOpen: true });

      expect(
        screen.getByRole("button", { name: COLLAPSE_NAME, expanded: true }),
      ).toBeInTheDocument();
    });

    it("keeps the toggle at every width when the card is not open on a wide screen", () => {
      renderHeader({ isOpenOnWideScreen: false });

      expect(screen.getByRole("button", { name: EXPAND_NAME })).not.toHaveClass(
        TOGGLE_HIDDEN_ON_WIDE_SCREEN_CLASS_NAME,
      );
    });

    it("hides the toggle on a wide screen when the card is open there", () => {
      renderHeader({ isOpenOnWideScreen: true });

      expect(screen.getByRole("button", { name: EXPAND_NAME })).toHaveClass(
        TOGGLE_HIDDEN_ON_WIDE_SCREEN_CLASS_NAME,
      );
    });
  });

  describe("given a card that does not collapse", () => {
    it("renders no toggle", () => {
      renderHeader({ isCollapsible: false, isOpen: true });

      expect(
        screen.queryByRole("button", { name: EXPAND_NAME }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: COLLAPSE_NAME }),
      ).not.toBeInTheDocument();
    });
  });

  describe("given isButtonDisabled", () => {
    it("renders no play button", () => {
      renderHeader({ isButtonDisabled: true });

      expect(
        screen.queryByRole("button", { name: PLAY_NAME }),
      ).not.toBeInTheDocument();
    });

    it("keeps the toggle", () => {
      renderHeader({ isButtonDisabled: true });

      expect(
        screen.getByRole("button", { name: EXPAND_NAME }),
      ).toBeInTheDocument();
    });
  });

  describe("given isButtonLoading", () => {
    it("shows the play button as loading", () => {
      renderHeader({ isButtonLoading: true });

      expect(screen.getByRole("button", { name: PLAY_NAME })).toHaveAttribute(
        "aria-busy",
        "true",
      );
    });
  });

  describe("given isShowStartText", () => {
    it('renders the "Rozpocznij" label in the play button', () => {
      renderHeader({ isShowStartText: true });

      expect(screen.getByRole("button", { name: PLAY_NAME })).toHaveTextContent(
        "Rozpocznij",
      );
    });
  });

  describe("given no onCardClick", () => {
    it("renders no button for the card", () => {
      renderHeader();

      expect(
        screen.queryByRole("button", { name: TITLE }),
      ).not.toBeInTheDocument();
    });
  });

  describe("given onCardClick", () => {
    it("renders the title as a button named after it", () => {
      renderHeader({ onCardClick: vi.fn() });

      expect(screen.getByRole("button", { name: TITLE })).toBeInTheDocument();
    });

    it("names the button of a logo after the title", () => {
      renderHeader({ logoUrl: LOGO_URL, onCardClick: vi.fn() });

      expect(screen.getByRole("button", { name: TITLE })).toContainElement(
        screen.getByRole("img", { name: TITLE }),
      );
    });
  });

  describe("when the title button is activated", () => {
    it("calls onCardClick, and neither of the other handlers", () => {
      const handlers = {
        onCardClick: vi.fn(),
        onButtonClick: vi.fn(),
        onToggle: vi.fn(),
      };
      renderHeader(handlers);

      fireEvent.click(screen.getByRole("button", { name: TITLE }));

      expect(handlers.onCardClick).toHaveBeenCalledTimes(1);
      expect(handlers.onButtonClick).not.toHaveBeenCalled();
      expect(handlers.onToggle).not.toHaveBeenCalled();
    });
  });

  describe("when the play button is activated", () => {
    it("calls onButtonClick, and neither of the other handlers", () => {
      const handlers = {
        onCardClick: vi.fn(),
        onButtonClick: vi.fn(),
        onToggle: vi.fn(),
      };
      renderHeader(handlers);

      fireEvent.click(screen.getByRole("button", { name: PLAY_NAME }));

      expect(handlers.onButtonClick).toHaveBeenCalledTimes(1);
      expect(handlers.onCardClick).not.toHaveBeenCalled();
      expect(handlers.onToggle).not.toHaveBeenCalled();
    });
  });

  describe("when the toggle is activated", () => {
    it("calls onToggle, and neither of the other handlers", () => {
      const handlers = {
        onCardClick: vi.fn(),
        onButtonClick: vi.fn(),
        onToggle: vi.fn(),
      };
      renderHeader(handlers);

      fireEvent.click(screen.getByRole("button", { name: EXPAND_NAME }));

      expect(handlers.onToggle).toHaveBeenCalledTimes(1);
      expect(handlers.onCardClick).not.toHaveBeenCalled();
      expect(handlers.onButtonClick).not.toHaveBeenCalled();
    });
  });
});
