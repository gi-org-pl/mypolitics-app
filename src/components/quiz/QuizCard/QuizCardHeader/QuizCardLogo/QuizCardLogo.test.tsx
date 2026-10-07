import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuizCardLogo } from "./QuizCardLogo";
import { LOGO_HEIGHT_CLASS_NAMES } from "./QuizCardLogo.constants";

const LOGO_URL = "/assets/quiz-logo-mypolitics.svg";
const TITLE = "myPolitics";

describe("<QuizCardLogo />", () => {
  describe("given the address of a logo and a title", () => {
    it("renders the logo image named after the title", () => {
      render(<QuizCardLogo url={LOGO_URL} title={TITLE} height={24} />);

      expect(screen.getByRole("img", { name: TITLE })).toHaveAttribute(
        "src",
        LOGO_URL,
      );
    });

    it("carries the title as the alternative text shown when the file fails to load", () => {
      render(<QuizCardLogo url={LOGO_URL} title={TITLE} height={24} />);

      expect(screen.getByRole("img", { name: TITLE })).toHaveAttribute(
        "alt",
        TITLE,
      );
    });

    it("does not hide the named image from assistive technology", () => {
      render(<QuizCardLogo url={LOGO_URL} title={TITLE} height={24} />);

      expect(screen.getByRole("img", { name: TITLE })).not.toHaveAttribute(
        "aria-hidden",
      );
    });
  });

  describe("given no title", () => {
    it("renders the logo as decorative, with an empty alternative text", () => {
      render(<QuizCardLogo url={LOGO_URL} height={24} />);

      expect(screen.getByRole("presentation")).toHaveAttribute("alt", "");
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });
  });

  describe("given a height of 24", () => {
    it("renders the logo 24 px high", () => {
      render(<QuizCardLogo url={LOGO_URL} title={TITLE} height={24} />);

      const logo = screen.getByRole("img", { name: TITLE });

      expect(logo).toHaveClass(LOGO_HEIGHT_CLASS_NAMES[24]);
      expect(logo).not.toHaveClass(LOGO_HEIGHT_CLASS_NAMES[32]);
    });
  });

  describe("given a height of 32", () => {
    it("renders the logo 32 px high", () => {
      render(<QuizCardLogo url={LOGO_URL} title={TITLE} height={32} />);

      const logo = screen.getByRole("img", { name: TITLE });

      expect(logo).toHaveClass(LOGO_HEIGHT_CLASS_NAMES[32]);
      expect(logo).not.toHaveClass(LOGO_HEIGHT_CLASS_NAMES[24]);
    });
  });
});
