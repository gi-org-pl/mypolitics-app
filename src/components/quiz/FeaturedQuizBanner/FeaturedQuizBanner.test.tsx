import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import quizBannerBackground from "@/assets/images/home/quiz-banner-bg.png";
import quizBannerContent from "@/assets/images/home/quiz-banner-content.png";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { FeaturedQuizBanner } from "./FeaturedQuizBanner";

const PREVIEW_NAME = "Podgląd wyników quizu myPolitics";

describe("<FeaturedQuizBanner />", () => {
  describe("when it is rendered", () => {
    it("shows the preview of the quiz results as a named image", () => {
      renderWithI18n(<FeaturedQuizBanner />);

      expect(screen.getByRole("img", { name: PREVIEW_NAME })).toHaveAttribute(
        "src",
        quizBannerContent,
      );
    });

    it("keeps the background picture out of the accessibility tree", () => {
      renderWithI18n(<FeaturedQuizBanner />);

      expect(screen.getByRole("presentation")).toHaveAttribute(
        "src",
        quizBannerBackground,
      );
      expect(screen.getAllByRole("img")).toHaveLength(1);
    });
  });
});
