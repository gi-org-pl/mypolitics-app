import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { QuizCardBody } from "./QuizCardBody";
import {
  BODY_COLLAPSED_CLASS_NAME,
  BODY_OPEN_CLASS_NAME,
  BODY_OPEN_ON_WIDE_SCREEN_CLASS_NAME,
} from "./QuizCardBody.constants";
import type { QuizCardBodyProps } from "./QuizCardBody.types";

const BODY_ID = "quiz-card-body";
const DESCRIPTION = "Poznaj najbliższych sobie warszawskich polityków!";
const TAGS = ["+40K osób", "9 min"];

const renderBody = (props: Partial<QuizCardBodyProps> = {}) =>
  render(
    <QuizCardBody
      id={BODY_ID}
      description={DESCRIPTION}
      tags={TAGS}
      isOpen
      isOpenOnWideScreen={false}
      isHighlighted={false}
      {...props}
    />,
  );

const getBody = () => {
  const body = document.getElementById(BODY_ID);

  if (!body) {
    throw new Error("The body is not rendered under its id");
  }

  return body;
};

const getChipTexts = () =>
  screen.getAllByRole("listitem").map((chip) => chip.textContent);

describe("<QuizCardBody />", () => {
  describe("given an id", () => {
    it("renders the description and the tags inside the element with that id", () => {
      renderBody();

      const body = within(getBody());

      expect(body.getByText(DESCRIPTION)).toBeInTheDocument();
      expect(body.getByRole("list")).toBeInTheDocument();
    });
  });

  describe("given a description as text", () => {
    it("renders it as a paragraph", () => {
      renderBody();

      expect(screen.getByRole("paragraph")).toHaveTextContent(DESCRIPTION);
    });
  });

  describe("given a description as a node", () => {
    const description: ReactNode = (
      <>
        <strong>Najbardziej zaawansowany test.</strong> Poznaj najbliższą
        ideologię!
      </>
    );

    it("renders it as given", () => {
      renderBody({ description });

      expect(
        screen.getByText(/Poznaj najbliższą\s+ideologię!/),
      ).toHaveTextContent(
        "Najbardziej zaawansowany test. Poznaj najbliższą ideologię!",
      );
    });

    it("keeps the bold lead bold", () => {
      renderBody({ description });

      expect(screen.getByRole("strong")).toHaveTextContent(
        "Najbardziej zaawansowany test.",
      );
    });

    it("does not wrap it in a paragraph of its own", () => {
      renderBody({ description });

      expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
    });
  });

  describe("given no description", () => {
    it("renders no paragraph", () => {
      renderBody({ description: undefined });

      expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
    });

    it("still renders the tags", () => {
      renderBody({ description: undefined });

      expect(getChipTexts()).toEqual(TAGS);
    });
  });

  describe("given tags", () => {
    it("renders every chip, in the order given", () => {
      renderBody({ tags: ["+1.5M osób", "15 min", "600 pytań"] });

      expect(getChipTexts()).toEqual(["+1.5M osób", "15 min", "600 pytań"]);
    });

    it("renders two equal tags", () => {
      renderBody({ tags: ["15 min", "15 min"] });

      expect(getChipTexts()).toEqual(["15 min", "15 min"]);
    });
  });

  describe("given no tags", () => {
    it("renders no chip row", () => {
      renderBody({ tags: [] });

      expect(screen.queryByRole("list")).not.toBeInTheDocument();
      expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    });

    it("still renders the description", () => {
      renderBody({ tags: [] });

      expect(screen.getByRole("paragraph")).toHaveTextContent(DESCRIPTION);
    });
  });

  describe("given an open card", () => {
    it("shows its content", () => {
      renderBody({ isOpen: true });

      expect(getBody()).toHaveClass(...BODY_OPEN_CLASS_NAME.split(" "));
    });
  });

  describe("given a collapsed card", () => {
    it("keeps its content out of sight, of the tab order and of the accessibility tree, in CSS alone", () => {
      renderBody({ isOpen: false });

      expect(getBody()).toHaveClass(...BODY_COLLAPSED_CLASS_NAME.split(" "));
    });

    it("renders the same markup as an open card, so the server and the browser agree", () => {
      renderBody({ isOpen: false });

      expect(screen.getByRole("paragraph")).toHaveTextContent(DESCRIPTION);
      expect(getChipTexts()).toEqual(TAGS);
    });
  });

  describe("given a collapsed card that is open on a wide screen", () => {
    it("shows its content from the wide breakpoint up, in CSS alone", () => {
      renderBody({ isOpen: false, isOpenOnWideScreen: true });

      expect(getBody()).toHaveClass(
        ...BODY_OPEN_ON_WIDE_SCREEN_CLASS_NAME.split(" "),
      );
    });
  });

  describe("given a highlighted card", () => {
    it("renders the same description and tags", () => {
      renderBody({ isHighlighted: true });

      expect(screen.getByRole("paragraph")).toHaveTextContent(DESCRIPTION);
      expect(getChipTexts()).toEqual(TAGS);
    });
  });
});
