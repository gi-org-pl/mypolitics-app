import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Agreement } from "@/types/comparison";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { Side } from "./Side";
import type { SideProps } from "./Side.types";

const OTHER: SideProps = {
  who: {
    name: "Progresywizm",
    color: "#9b59b6",
    imageUrl: "https://example.org/progressivism.svg",
  },
  answers: [
    {
      id: "a1",
      text: "Rząd nie powinien interweniować na rynku mieszkaniowym",
      agreement: Agreement.Agree,
    },
    {
      id: "a2",
      text: "Uproszczenie prawa budowlanego",
      agreement: Agreement.Disagree,
    },
  ],
};

const TAKER: SideProps = {
  who: { name: "Ty", imageUrl: "https://example.org/taker.svg" },
  answers: [
    {
      id: "a1",
      text: "Rząd nie powinien interweniować na rynku mieszkaniowym",
    },
  ],
  isTaker: true,
};

const renderSide = (props: SideProps = OTHER) =>
  renderWithI18n(<Side {...props} />);

const getSide = (name: string) => screen.getByRole("group", { name });
const getAvatar = () => screen.getByTestId("orientation-avatar");
const getChips = () => screen.getAllByTestId("answer-chip");

describe("<Side />", () => {
  describe("given a side", () => {
    it("is a group named by the side", () => {
      renderSide();

      expect(getSide("Progresywizm")).toBeVisible();
    });

    it("writes the name beside the mark of the side: the regular disc in its colour, with its image", () => {
      renderSide();

      expect(screen.getByText("Progresywizm")).toBeVisible();
      expect(getAvatar()).toHaveClass("size-8");
      expect(getAvatar()).toHaveStyle({ "--avatar-color": "#9b59b6" });
      expect(getAvatar().querySelector("img")).toHaveAttribute(
        "src",
        OTHER.who.imageUrl,
      );
    });

    it("writes the name in full, on as many lines as it takes", () => {
      renderSide();

      expect(screen.getByText("Progresywizm")).toHaveClass("wrap-break-word");
      expect(screen.getByText("Progresywizm")).not.toHaveClass("truncate");
    });

    it("writes a name with line breaks on one run of text", () => {
      renderSide({ ...OTHER, who: { name: "Wolny\n  rynek" } });

      expect(getSide("Wolny rynek")).toHaveTextContent(/^Wolny rynek/);
    });

    it("stands on two rows of the grid it is put in: the name, then the answers", () => {
      renderSide();

      expect(getSide("Progresywizm")).toHaveClass(
        "row-span-2",
        "grid-rows-subgrid",
      );
      expect(getSide("Progresywizm").children).toHaveLength(2);
    });
  });

  describe("given several answers", () => {
    it("lists every one, in the order given", () => {
      renderSide();

      const answers = within(getSide("Progresywizm")).getAllByRole("listitem");

      expect(answers.map((answer) => answer.textContent)).toEqual([
        "Rząd nie powinien interweniować na rynku mieszkaniowym",
        "Uproszczenie prawa budowlanego",
      ]);
    });

    it("marks each by how it stands to the answer of the taker", () => {
      renderSide();

      const [first, second] = within(getSide("Progresywizm")).getAllByRole(
        "listitem",
      );

      expect(
        within(first).getByRole("img", { name: "Zgodność" }),
      ).toBeVisible();
      expect(
        within(second).getByRole("img", { name: "Niezgodność" }),
      ).toBeVisible();
    });
  });

  describe("given one answer with nothing to hold it up against", () => {
    it("lists it with no mark", () => {
      renderSide({
        ...OTHER,
        answers: [{ id: "a1", text: "Dopłaty do kredytów" }],
      });

      expect(getChips().map((chip) => chip.textContent)).toEqual([
        "Dopłaty do kredytów",
      ]);
      expect(
        within(screen.getByRole("list")).queryByRole("img"),
      ).not.toBeInTheDocument();
    });
  });

  describe("given no answer", () => {
    it('says "no answer" where the answers stand', () => {
      renderSide({ ...OTHER, answers: [] });

      expect(
        within(getSide("Progresywizm"))
          .getAllByRole("listitem")
          .map((answer) => answer.textContent),
      ).toEqual(["Brak odpowiedzi"]);
    });
  });

  describe("given the side of the taker", () => {
    it("is a group named by the word for the taker", () => {
      renderSide(TAKER);

      expect(getSide("Ty")).toBeVisible();
    });

    it("draws the name before the mark, from the end of the row", () => {
      renderSide(TAKER);

      expect(getSide("Ty").firstElementChild).toHaveClass(
        "flex-row-reverse",
        "text-right",
      );
    });

    it("writes its answer from the end", () => {
      renderSide(TAKER);

      expect(getChips()[0]).toHaveClass("text-right");
    });

    it('writes "no answer" from the end when the taker did not answer', () => {
      renderSide({ ...TAKER, answers: [] });

      expect(getChips()).toHaveLength(1);
      expect(getChips()[0]).toHaveTextContent("Brak odpowiedzi");
      expect(getChips()[0]).toHaveClass("text-right");
    });
  });

  describe("given the other side", () => {
    it("gives its name the room the row says it has, and the width of the side when no row says", () => {
      renderSide();

      expect(getSide("Progresywizm").firstElementChild).toHaveClass(
        "w-max",
        "max-w-(--side-name-room,100%)",
      );
    });

    it("keeps the name of the taker inside the side of the taker", () => {
      renderSide(TAKER);

      expect(getSide("Ty").firstElementChild).not.toHaveClass("w-max");
    });

    it("draws the mark before the name, and its answers from the start", () => {
      renderSide();

      expect(getSide("Progresywizm").firstElementChild).not.toHaveClass(
        "flex-row-reverse",
      );
      expect(getChips()[0]).not.toHaveClass("text-right");
    });
  });
});
