import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { QuizCard } from "./QuizCard";
import {
  BODY_COLLAPSED_CLASS_NAME,
  BODY_OPEN_CLASS_NAME,
  BODY_OPEN_ON_WIDE_SCREEN_CLASS_NAME,
  IMAGE_SHORT_CLASS_NAME,
  IMAGE_TALL_CLASS_NAME,
  LOGO_HEIGHT_CLASS_NAMES,
  TOGGLE_HIDDEN_ON_WIDE_SCREEN_CLASS_NAME,
} from "./QuizCard.constants";
import type { QuizCardProps } from "./QuizCard.types";

const TITLE = "Polskie Lata 90.";
const LOGO_URL = "/assets/quiz-logo-mypolitics.svg";
const BACKGROUND_URL = "/assets/quiz-card-lata-90.png";
const CTA = "Kiedyś to było... no właśnie, jak?";
const DESCRIPTION = "Poznaj najbliższych sobie warszawskich polityków!";
const TAGS = ["+40K osób", "9 min"];
const PLAY_NAME = "Rozpocznij quiz";
const EXPAND_NAME = "Rozwiń";
const COLLAPSE_NAME = "Zwiń";

const renderCard = (props: Partial<QuizCardProps> = {}) =>
  renderWithI18n(
    <QuizCard
      description={DESCRIPTION}
      tags={TAGS}
      onButtonClick={vi.fn()}
      {...props}
    />,
  );

const getCard = () => screen.getByRole("article");

// The body is the element the toggle controls; on a card without a toggle it
// is found through its description.
const getBody = () => {
  const bodyId = screen
    .getByRole("button", { expanded: false })
    .getAttribute("aria-controls");
  const body = bodyId ? document.getElementById(bodyId) : null;

  if (!body) {
    throw new Error("The toggle does not point at a rendered body");
  }

  return body;
};

const getChipTexts = () =>
  screen.getAllByRole("listitem").map((chip) => chip.textContent);

describe("<QuizCard />", () => {
  describe("given a logoUrl", () => {
    it("renders the logo image named after the title", () => {
      renderCard({ title: TITLE, logoUrl: LOGO_URL });

      expect(screen.getByRole("img", { name: TITLE })).toHaveAttribute(
        "src",
        LOGO_URL,
      );
    });

    it("renders the logo 24 px high unless told otherwise, as in every frame of the design", () => {
      renderCard({ title: TITLE, logoUrl: LOGO_URL });

      expect(screen.getByRole("img", { name: TITLE })).toHaveClass(
        LOGO_HEIGHT_CLASS_NAMES[24],
      );
    });

    it("renders the logo 32 px high when asked to", () => {
      renderCard({ title: TITLE, logoUrl: LOGO_URL, logoHeight: 32 });

      expect(screen.getByRole("img", { name: TITLE })).toHaveClass(
        LOGO_HEIGHT_CLASS_NAMES[32],
      );
    });

    it("does not repeat the title as text", () => {
      renderCard({ title: TITLE, logoUrl: LOGO_URL });

      expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
    });
  });

  describe("given no logoUrl but a title", () => {
    it("renders the title as text", () => {
      renderCard({ title: TITLE });

      expect(screen.getByRole("heading", { name: TITLE })).toHaveTextContent(
        TITLE,
      );
    });
  });

  describe("given neither a logoUrl nor a title", () => {
    it("renders the buttons alone", () => {
      renderCard();

      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
      expect(
        screen
          .getAllByRole("button")
          .map((button) => button.getAttribute("aria-label")),
      ).toEqual([EXPAND_NAME, PLAY_NAME]);
    });
  });

  describe("given a title of whitespace only", () => {
    it("treats it as absent", () => {
      renderCard({ title: "   " });

      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    });
  });

  describe("given a backgroundUrl", () => {
    it("renders the image as decorative", () => {
      renderCard({ title: TITLE, backgroundUrl: BACKGROUND_URL });

      const image = within(getCard()).getByRole("presentation");

      expect(image).toHaveAttribute("src", BACKGROUND_URL);
      expect(image).toHaveAttribute("alt", "");
      expect(image).not.toHaveAttribute("aria-hidden");
    });

    it("renders the image at the top of the card, above the content", () => {
      renderCard({ title: TITLE, backgroundUrl: BACKGROUND_URL, cta: CTA });

      const image = within(getCard()).getByRole("presentation");

      expect(
        image.compareDocumentPosition(screen.getByText(CTA)) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(
        image.compareDocumentPosition(screen.getByRole("heading")) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it("renders the short image while the card is collapsed", () => {
      renderCard({ backgroundUrl: BACKGROUND_URL });

      expect(within(getCard()).getByRole("presentation")).toHaveClass(
        IMAGE_SHORT_CLASS_NAME,
      );
    });

    it("renders the tall image once the card is open", () => {
      renderCard({ backgroundUrl: BACKGROUND_URL });

      fireEvent.click(screen.getByRole("button", { name: EXPAND_NAME }));

      expect(within(getCard()).getByRole("presentation")).toHaveClass(
        IMAGE_TALL_CLASS_NAME,
      );
    });

    it("renders the tall image on a card that is always open", () => {
      renderCard({ backgroundUrl: BACKGROUND_URL, isAlwaysExpanded: true });

      expect(within(getCard()).getByRole("presentation")).toHaveClass(
        IMAGE_TALL_CLASS_NAME,
      );
    });

    it("keeps the toggle and the collapsed body on a wide screen too", () => {
      renderCard({ backgroundUrl: BACKGROUND_URL });

      const body = getBody();

      expect(screen.getByRole("button", { name: EXPAND_NAME })).not.toHaveClass(
        TOGGLE_HIDDEN_ON_WIDE_SCREEN_CLASS_NAME,
      );
      for (const className of BODY_OPEN_ON_WIDE_SCREEN_CLASS_NAME.split(" ")) {
        expect(body).not.toHaveClass(className);
      }
    });
  });

  describe("given no backgroundUrl", () => {
    it("renders no image", () => {
      renderCard({ title: TITLE });

      expect(
        within(getCard()).queryByRole("presentation"),
      ).not.toBeInTheDocument();
    });
  });

  describe("given a cta", () => {
    it("renders the badge", () => {
      renderCard({ title: TITLE, cta: CTA });

      expect(screen.getByText(CTA)).toBeInTheDocument();
    });

    it("renders the badge above the header row", () => {
      renderCard({ title: TITLE, cta: CTA });

      expect(
        screen
          .getByText(CTA)
          .compareDocumentPosition(screen.getByRole("heading")) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });
  });

  describe("given an empty cta", () => {
    it("renders no badge", () => {
      renderCard({ title: TITLE, cta: "  " });

      expect(screen.getAllByRole("paragraph")).toHaveLength(1);
      expect(screen.getByRole("paragraph")).toHaveTextContent(DESCRIPTION);
    });
  });

  describe("given a description as text", () => {
    it("renders it as a paragraph", () => {
      renderCard();

      expect(screen.getByRole("paragraph")).toHaveTextContent(DESCRIPTION);
    });
  });

  describe("given a description as a node", () => {
    it("renders it as given, so a bold lead stays bold", () => {
      renderCard({
        description: (
          <>
            <strong>Najbardziej zaawansowany test.</strong> Poznaj ideologię!
          </>
        ),
      });

      expect(screen.getByRole("strong")).toHaveTextContent(
        "Najbardziej zaawansowany test.",
      );
      expect(screen.getByText(/Poznaj ideologię!/)).toHaveTextContent(
        "Najbardziej zaawansowany test. Poznaj ideologię!",
      );
    });
  });

  describe("given an empty description", () => {
    it("renders no paragraph, and the tags still show", () => {
      renderCard({ description: "  " });

      expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
      expect(getChipTexts()).toEqual(TAGS);
    });
  });

  describe("given tags", () => {
    it("renders every chip", () => {
      renderCard({ tags: ["+1.5M osób", "15 min", "600 pytań"] });

      expect(getChipTexts()).toEqual(["+1.5M osób", "15 min", "600 pytań"]);
    });

    it("renders two equal tags", () => {
      renderCard({ tags: ["15 min", "15 min"] });

      expect(getChipTexts()).toEqual(["15 min", "15 min"]);
    });
  });

  describe("given no tags", () => {
    it("renders no chip row", () => {
      renderCard({ tags: [] });

      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });
  });

  describe("given neither a description nor tags", () => {
    it("renders no toggle, as there is nothing to expand", () => {
      renderCard({ title: TITLE, description: "", tags: [] });

      expect(
        screen
          .getAllByRole("button")
          .map((button) => button.getAttribute("aria-label")),
      ).toEqual([PLAY_NAME]);
    });
  });

  describe("expand / collapse", () => {
    describe("given a plain card", () => {
      it("renders the chevron collapsed", () => {
        renderCard({ title: TITLE });

        expect(
          screen.getByRole("button", { name: EXPAND_NAME, expanded: false }),
        ).toBeInTheDocument();
      });

      it("points the chevron at the body, which holds the description and the tags", () => {
        renderCard({ title: TITLE });

        const body = within(getBody());

        expect(body.getByRole("paragraph")).toHaveTextContent(DESCRIPTION);
        expect(body.getByRole("list")).toBeInTheDocument();
      });

      it("hides the body from assistive technology and from the keyboard", () => {
        renderCard({ title: TITLE });

        expect(getBody()).toHaveClass(...BODY_COLLAPSED_CLASS_NAME.split(" "));
      });

      it("is open without a chevron on a wide screen, in CSS alone", () => {
        renderCard({ title: TITLE });

        expect(getBody()).toHaveClass(
          ...BODY_OPEN_ON_WIDE_SCREEN_CLASS_NAME.split(" "),
        );
        expect(screen.getByRole("button", { name: EXPAND_NAME })).toHaveClass(
          TOGGLE_HIDDEN_ON_WIDE_SCREEN_CLASS_NAME,
        );
      });

      describe("when the chevron is activated", () => {
        it("reports itself as expanded", () => {
          renderCard({ title: TITLE });

          fireEvent.click(screen.getByRole("button", { name: EXPAND_NAME }));

          expect(
            screen.getByRole("button", { name: COLLAPSE_NAME, expanded: true }),
          ).toBeInTheDocument();
        });

        it("exposes the body", () => {
          renderCard({ title: TITLE });
          const body = getBody();

          fireEvent.click(screen.getByRole("button", { name: EXPAND_NAME }));

          expect(body).toHaveClass(...BODY_OPEN_CLASS_NAME.split(" "));
          for (const className of BODY_COLLAPSED_CLASS_NAME.split(" ")) {
            expect(body).not.toHaveClass(className);
          }
        });

        it("does not call onCardClick", () => {
          const handleCardClick = vi.fn();
          renderCard({ title: TITLE, onCardClick: handleCardClick });

          fireEvent.click(screen.getByRole("button", { name: EXPAND_NAME }));

          expect(handleCardClick).not.toHaveBeenCalled();
        });
      });

      describe("when the chevron is activated twice", () => {
        it("collapses again", () => {
          renderCard({ title: TITLE });
          const body = getBody();

          fireEvent.click(screen.getByRole("button", { name: EXPAND_NAME }));
          fireEvent.click(screen.getByRole("button", { name: COLLAPSE_NAME }));

          expect(
            screen.getByRole("button", { name: EXPAND_NAME, expanded: false }),
          ).toBeInTheDocument();
          expect(body).toHaveClass(...BODY_COLLAPSED_CLASS_NAME.split(" "));
        });
      });
    });

    describe("given isAlwaysExpanded", () => {
      it("renders no chevron", () => {
        renderCard({ title: TITLE, isAlwaysExpanded: true });

        expect(
          screen
            .getAllByRole("button")
            .map((button) => button.getAttribute("aria-label")),
        ).toEqual([PLAY_NAME]);
      });

      it("exposes the body", () => {
        renderCard({ title: TITLE, isAlwaysExpanded: true });

        expect(screen.getByRole("paragraph")).toHaveTextContent(DESCRIPTION);
        expect(getChipTexts()).toEqual(TAGS);
      });
    });

    describe("given isHighlighted", () => {
      it("renders no chevron", () => {
        renderCard({ title: TITLE, isHighlighted: true });

        expect(
          screen
            .getAllByRole("button")
            .map((button) => button.getAttribute("aria-label")),
        ).toEqual([PLAY_NAME]);
      });

      it("exposes the body", () => {
        renderCard({ title: TITLE, isHighlighted: true });

        expect(screen.getByRole("paragraph")).toHaveTextContent(DESCRIPTION);
        expect(getChipTexts()).toEqual(TAGS);
      });
    });
  });

  describe("play button", () => {
    describe("given isButtonLoading", () => {
      it("shows the loading state", () => {
        renderCard({ isButtonLoading: true });

        expect(screen.getByRole("button", { name: PLAY_NAME })).toHaveAttribute(
          "aria-busy",
          "true",
        );
      });

      it("cannot be activated a second time", () => {
        const handleButtonClick = vi.fn();
        renderCard({ isButtonLoading: true, onButtonClick: handleButtonClick });

        fireEvent.click(screen.getByRole("button", { name: PLAY_NAME }));

        expect(handleButtonClick).not.toHaveBeenCalled();
      });
    });

    describe("given isButtonDisabled", () => {
      it("renders no play button", () => {
        renderCard({ isButtonDisabled: true });

        expect(
          screen.queryByRole("button", { name: PLAY_NAME }),
        ).not.toBeInTheDocument();
      });
    });

    describe("given isShowStartText", () => {
      it('renders the "Rozpocznij" label', () => {
        renderCard({ isShowStartText: true });

        expect(
          screen.getByRole("button", { name: PLAY_NAME }),
        ).toHaveTextContent("Rozpocznij");
      });
    });

    describe("given no isShowStartText", () => {
      it("renders the icon alone", () => {
        renderCard();

        expect(
          screen.getByRole("button", { name: PLAY_NAME }),
        ).toHaveTextContent("");
      });
    });

    describe("when activated", () => {
      it("calls onButtonClick", () => {
        const handleButtonClick = vi.fn();
        renderCard({ onButtonClick: handleButtonClick });

        fireEvent.click(screen.getByRole("button", { name: PLAY_NAME }));

        expect(handleButtonClick).toHaveBeenCalledTimes(1);
      });

      it("does not call onCardClick", () => {
        const handleCardClick = vi.fn();
        renderCard({ title: TITLE, onCardClick: handleCardClick });

        fireEvent.click(screen.getByRole("button", { name: PLAY_NAME }));

        expect(handleCardClick).not.toHaveBeenCalled();
      });
    });
  });

  describe("card click", () => {
    describe("given onCardClick and a title", () => {
      it("calls it when the card is clicked", () => {
        const handleCardClick = vi.fn();
        renderCard({ title: TITLE, onCardClick: handleCardClick });

        fireEvent.click(getCard());

        expect(handleCardClick).toHaveBeenCalledTimes(1);
      });

      it("calls it when the description is clicked", () => {
        const handleCardClick = vi.fn();
        renderCard({ title: TITLE, onCardClick: handleCardClick });

        fireEvent.click(screen.getByRole("paragraph"));

        expect(handleCardClick).toHaveBeenCalledTimes(1);
      });

      it("calls it once when the title button is activated by keyboard", () => {
        const handleCardClick = vi.fn();
        renderCard({ title: TITLE, onCardClick: handleCardClick });

        const titleButton = screen.getByRole("button", { name: TITLE });
        titleButton.focus();
        fireEvent.click(titleButton, { detail: 0 });

        expect(titleButton).toHaveFocus();
        expect(handleCardClick).toHaveBeenCalledTimes(1);
      });

      it("does not call onButtonClick", () => {
        const handleButtonClick = vi.fn();
        renderCard({
          title: TITLE,
          onButtonClick: handleButtonClick,
          onCardClick: vi.fn(),
        });

        fireEvent.click(screen.getByRole("button", { name: TITLE }));

        expect(handleButtonClick).not.toHaveBeenCalled();
      });
    });

    describe("given onCardClick, a logo and a title", () => {
      it("names the logo button after the title", () => {
        renderCard({ title: TITLE, logoUrl: LOGO_URL, onCardClick: vi.fn() });

        expect(screen.getByRole("button", { name: TITLE })).toContainElement(
          screen.getByRole("img", { name: TITLE }),
        );
      });
    });

    describe("given onCardClick but no title", () => {
      it("renders no card-level button", () => {
        renderCard({ logoUrl: LOGO_URL, onCardClick: vi.fn() });

        expect(
          screen
            .getAllByRole("button")
            .map((button) => button.getAttribute("aria-label")),
        ).toEqual([EXPAND_NAME, PLAY_NAME]);
      });

      it("does not call it when the card is clicked", () => {
        const handleCardClick = vi.fn();
        renderCard({ logoUrl: LOGO_URL, onCardClick: handleCardClick });

        fireEvent.click(getCard());

        expect(handleCardClick).not.toHaveBeenCalled();
      });
    });

    describe("given onCardClick and a title of whitespace only", () => {
      it("is not interactive either", () => {
        const handleCardClick = vi.fn();
        renderCard({ title: " \n ", onCardClick: handleCardClick });

        fireEvent.click(getCard());

        expect(handleCardClick).not.toHaveBeenCalled();
        expect(
          screen
            .getAllByRole("button")
            .map((button) => button.getAttribute("aria-label")),
        ).toEqual([EXPAND_NAME, PLAY_NAME]);
      });
    });

    describe("given no onCardClick", () => {
      it("renders no card-level button", () => {
        renderCard({ title: TITLE });

        expect(
          screen.queryByRole("button", { name: TITLE }),
        ).not.toBeInTheDocument();
      });
    });
  });
});
