import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { FriendNotice } from "../FriendForm.types";
import { FriendFormNotice } from "./FriendFormNotice";
import { FRIEND_NOTICE_TEXTS } from "./FriendFormNotice.constants";

const renderNotice = (notice: FriendNotice, isError = false) =>
  renderWithI18n(
    <FriendFormNotice id="notice" notice={notice} isError={isError} />,
  );

describe("<FriendFormNotice />", () => {
  describe("given a notice", () => {
    it.each([
      [
        FriendNotice.Hint,
        "Wymień się identyfikatorami wyników ze znajomym, aby porównać wzajemnie swoje odpowiedzi.",
      ],
      [FriendNotice.Fetching, "Wczytujemy wynik…"],
      [FriendNotice.Invalid, "To nie jest identyfikator wyników."],
      [FriendNotice.Own, "To jest Twój identyfikator."],
      [FriendNotice.OtherSurvey, "Ten wynik pochodzi z innego quizu."],
      [FriendNotice.Unreadable, "Nie znaleźliśmy takiego wyniku."],
    ])("says its sentence: %s", (notice, sentence) => {
      renderNotice(notice);

      expect(screen.getByRole("status")).toHaveTextContent(sentence);
    });

    it("is a status with the identifier it is given, so the field can be described by it", () => {
      renderNotice(FriendNotice.Hint);

      expect(screen.getByRole("status")).toHaveAttribute("id", "notice");
    });

    it("draws the info mark as decoration", () => {
      renderNotice(FriendNotice.Hint);

      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(document.querySelector("img")).toHaveAttribute("alt", "");
    });
  });

  describe("given the hint", () => {
    it("writes it quietly", () => {
      renderNotice(FriendNotice.Hint);

      expect(screen.getByText(/Wymień się/)).toHaveClass("text-gi-primary/50");
    });
  });

  describe("given a notice that the text cannot be used", () => {
    it("writes it in the full colour", () => {
      renderNotice(FriendNotice.Own, true);

      expect(screen.getByText("To jest Twój identyfikator.")).toHaveClass(
        "text-gi-primary",
      );
      expect(screen.getByText("To jest Twój identyfikator.")).not.toHaveClass(
        "text-gi-primary/50",
      );
    });
  });

  describe("the sentences", () => {
    it("cover every notice", () => {
      expect(Object.keys(FRIEND_NOTICE_TEXTS).sort()).toEqual(
        Object.values(FriendNotice).sort(),
      );
    });
  });
});
