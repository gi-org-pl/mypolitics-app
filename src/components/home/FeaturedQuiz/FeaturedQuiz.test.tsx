import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { HomeQuiz } from "@/types/home";
import { createMessage } from "@/utils/vitest/createMessage";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { HomeQuizCard } from "../HomeQuizCard/HomeQuizCard";
import { FeaturedQuiz } from "./FeaturedQuiz";

// The card renders as it is; the spy shows what the row passes to it.
vi.mock("../HomeQuizCard/HomeQuizCard", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../HomeQuizCard/HomeQuizCard")>();

  return { HomeQuizCard: vi.fn(original.HomeQuizCard) };
});

const QUIZ: HomeQuiz = {
  id: "mypolitics",
  name: createMessage("myPolitics"),
  categories: [],
  logoUrl: "/assets/quiz-logo-mypolitics.svg",
  backgroundUrl: "/assets/quiz-card-mypolitics.png",
  description: createMessage(
    "<0>Najbardziej zaawansowany test poglądów politycznych.</0> Poznaj swoją tożsamość!",
  ),
  tags: [createMessage("+1.5M osób"), createMessage("15 min")],
};

describe("<FeaturedQuiz />", () => {
  beforeEach(() => {
    vi.mocked(HomeQuizCard).mockClear();
  });

  describe("when it gets a quiz", () => {
    it("renders the quiz once, as the featured card", () => {
      renderWithI18n(<FeaturedQuiz quiz={QUIZ} onStart={vi.fn()} />);

      expect(
        screen.getAllByRole("heading", { name: "myPolitics" }),
      ).toHaveLength(1);
      expect(vi.mocked(HomeQuizCard).mock.lastCall?.[0]).toMatchObject({
        quiz: QUIZ,
        isFeatured: true,
      });
    });

    it("renders the banner with the preview of the quiz beside the card", () => {
      renderWithI18n(<FeaturedQuiz quiz={QUIZ} onStart={vi.fn()} />);

      expect(
        screen.getByRole("img", { name: "Podgląd wyników quizu myPolitics" }),
      ).toBeInTheDocument();
    });
  });

  describe("when the play button of the card is pressed", () => {
    it("calls onStart once", () => {
      const onStart = vi.fn();
      renderWithI18n(<FeaturedQuiz quiz={QUIZ} onStart={onStart} />);

      fireEvent.click(screen.getByRole("button", { name: "Rozpocznij quiz" }));

      expect(onStart).toHaveBeenCalledTimes(1);
    });
  });
});
