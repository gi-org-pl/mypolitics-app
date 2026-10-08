import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { QuizCardLogo } from "./QuizCardLogo";

const LOGO_URL = "/assets/quiz-logo-mypolitics.svg";
const OTHER_LOGO_URL = "/assets/quiz-logo-wyborczy-2023.svg";
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

    it("does not hide the named image from assistive technology", () => {
      render(<QuizCardLogo url={LOGO_URL} title={TITLE} height={24} />);

      expect(screen.getByRole("img", { name: TITLE })).not.toHaveAttribute(
        "aria-hidden",
      );
    });

    it("does not repeat the title as text next to the image", () => {
      render(<QuizCardLogo url={LOGO_URL} title={TITLE} height={24} />);

      expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
    });

    it("renders the same named image at the other height", () => {
      render(<QuizCardLogo url={LOGO_URL} title={TITLE} height={32} />);

      expect(screen.getByRole("img", { name: TITLE })).toHaveAttribute(
        "src",
        LOGO_URL,
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

  describe("when the logo fails to load", () => {
    it("renders the title as text in its place", () => {
      render(<QuizCardLogo url={LOGO_URL} title={TITLE} height={24} />);

      fireEvent.error(screen.getByRole("img", { name: TITLE }));

      expect(screen.getByText(TITLE)).toBeInTheDocument();
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("renders nothing when there is no title to fall back on", () => {
      const { container } = render(<QuizCardLogo url={LOGO_URL} height={24} />);

      fireEvent.error(screen.getByRole("presentation"));

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("when the address changes after a failure", () => {
    it("tries the new logo", () => {
      const { rerender } = render(
        <QuizCardLogo url={LOGO_URL} title={TITLE} height={24} />,
      );

      fireEvent.error(screen.getByRole("img", { name: TITLE }));
      rerender(<QuizCardLogo url={OTHER_LOGO_URL} title={TITLE} height={24} />);

      expect(screen.getByRole("img", { name: TITLE })).toHaveAttribute(
        "src",
        OTHER_LOGO_URL,
      );
      expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
    });
  });
});
