import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { QuizCard } from "@/components/quiz/QuizCard/QuizCard";
import type { HomeQuiz } from "@/types/home";
import { createMessage } from "@/utils/vitest/createMessage";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { HomeQuizCard } from "./HomeQuizCard";

// The card renders as it is; the spy shows what it receives where the result
// is a look that only CSS draws (the image, the highlighted card).
vi.mock("@/components/quiz/QuizCard/QuizCard", async (importOriginal) => {
  const original =
    await importOriginal<
      typeof import("@/components/quiz/QuizCard/QuizCard")
    >();

  return { QuizCard: vi.fn(original.QuizCard) };
});

const LOGO_URL = "/assets/quiz-logo-wyborczy-2023.svg";
const BACKGROUND_URL = "/assets/quiz-card-lata-90.png";
const PLAY_NAME = "Rozpocznij quiz";

const LOGO_QUIZ: HomeQuiz = {
  id: "wyborczy-2023",
  name: createMessage("Wyborczy 2023"),
  categories: ["electoral"],
  logoUrl: LOGO_URL,
  description: createMessage(
    "<0>Poznaj najbliższych sobie polityków!</0> Dowiesz się, który jest Tobie najbliższy.",
  ),
  tags: [createMessage("+40K osób"), createMessage("9 min")],
};

const IMAGE_QUIZ: HomeQuiz = {
  id: "polskie-lata-90",
  name: createMessage("Polskie Lata 90."),
  categories: ["social"],
  backgroundUrl: BACKGROUND_URL,
  badge: createMessage("Kiedyś to było... no właśnie, jak?"),
  tags: [],
};

const getCardProps = () => vi.mocked(QuizCard).mock.lastCall?.[0];

describe("<HomeQuizCard />", () => {
  beforeEach(() => {
    vi.mocked(QuizCard).mockClear();
  });

  describe("when the quiz has a logo, a description and tags", () => {
    it("names the card by the quiz", () => {
      renderWithI18n(<HomeQuizCard quiz={LOGO_QUIZ} onStart={vi.fn()} />);

      expect(
        screen.getByRole("heading", { name: "Wyborczy 2023" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("img", { name: "Wyborczy 2023" }),
      ).toHaveAttribute("src", LOGO_URL);
    });

    it("sets the lead of the description in bold and the rest after it", () => {
      renderWithI18n(<HomeQuizCard quiz={LOGO_QUIZ} onStart={vi.fn()} />);

      expect(screen.getByRole("strong")).toHaveTextContent(
        /^Poznaj najbliższych sobie polityków!$/,
      );
      expect(
        screen.getByText(
          (_, element) =>
            element?.textContent ===
            "Poznaj najbliższych sobie polityków! Dowiesz się, który jest Tobie najbliższy.",
        ),
      ).toBeInTheDocument();
    });

    it("renders one chip per tag, in the given order", () => {
      renderWithI18n(<HomeQuizCard quiz={LOGO_QUIZ} onStart={vi.fn()} />);

      expect(
        within(screen.getByRole("list"))
          .getAllByRole("listitem")
          .map((chip) => chip.textContent),
      ).toEqual(["+40K osób", "9 min"]);
    });

    it("passes no image and no badge to the card", () => {
      renderWithI18n(<HomeQuizCard quiz={LOGO_QUIZ} onStart={vi.fn()} />);

      expect(getCardProps()).toMatchObject({
        backgroundUrl: undefined,
        cta: undefined,
      });
    });
  });

  describe("when the quiz has an image and a badge, and no description", () => {
    it("renders the title and the badge", () => {
      renderWithI18n(<HomeQuizCard quiz={IMAGE_QUIZ} onStart={vi.fn()} />);

      expect(
        screen.getByRole("heading", { name: "Polskie Lata 90." }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Kiedyś to było... no właśnie, jak?"),
      ).toBeInTheDocument();
    });

    it("passes the image to the card, and no description", () => {
      renderWithI18n(<HomeQuizCard quiz={IMAGE_QUIZ} onStart={vi.fn()} />);

      expect(getCardProps()).toMatchObject({
        backgroundUrl: BACKGROUND_URL,
        description: undefined,
        tags: [],
      });
    });
  });

  describe("when the card is not featured", () => {
    it("renders an ordinary card with the play button as an icon", () => {
      renderWithI18n(<HomeQuizCard quiz={LOGO_QUIZ} onStart={vi.fn()} />);

      expect(getCardProps()).toMatchObject({
        isHighlighted: false,
        isShowStartText: false,
      });
      expect(
        screen.getByRole("button", { name: PLAY_NAME }),
      ).not.toHaveTextContent("Rozpocznij");
    });
  });

  describe("when the card is featured", () => {
    it("renders a highlighted card whose play button has the start label", () => {
      renderWithI18n(
        <HomeQuizCard quiz={LOGO_QUIZ} isFeatured onStart={vi.fn()} />,
      );

      expect(getCardProps()).toMatchObject({
        isHighlighted: true,
        isShowStartText: true,
      });
      expect(screen.getByRole("button", { name: PLAY_NAME })).toHaveTextContent(
        "Rozpocznij",
      );
    });
  });

  describe("when the play button is pressed", () => {
    it("calls onStart once", () => {
      const onStart = vi.fn();
      renderWithI18n(<HomeQuizCard quiz={LOGO_QUIZ} onStart={onStart} />);

      fireEvent.click(screen.getByRole("button", { name: PLAY_NAME }));

      expect(onStart).toHaveBeenCalledTimes(1);
    });
  });
});
