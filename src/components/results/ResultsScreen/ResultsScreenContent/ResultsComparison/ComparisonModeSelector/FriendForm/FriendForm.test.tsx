import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { FRIEND_ID, TAKER_ID } from "../../ResultsComparison.fixtures";
import { FriendForm } from "./FriendForm";
import { FRIEND_ID_PLACEHOLDER, IS_NOTICE_ERROR } from "./FriendForm.constants";
import { type FriendFormProps, FriendNotice } from "./FriendForm.types";

const OWN_LABEL = "Mój identyfikator wyników";
const FRIEND_LABEL = "Identyfikator wyników znajomego";
const HINT =
  "Wymień się identyfikatorami wyników ze znajomym, aby porównać wzajemnie swoje odpowiedzi.";

const renderForm = (props: Partial<FriendFormProps> = {}) => {
  const onFriendIdChange = vi.fn();

  renderWithI18n(
    <FriendForm
      resultId={TAKER_ID}
      friendId=""
      notice={FriendNotice.Hint}
      onFriendIdChange={onFriendIdChange}
      {...props}
    />,
  );

  return { onFriendIdChange };
};

const getField = () => screen.getByRole("textbox", { name: FRIEND_LABEL });

describe("<FriendForm />", () => {
  describe("given an empty field", () => {
    it("shows the identifier of the taker under its name, with the copy control", () => {
      renderForm();

      const own = within(screen.getByRole("group", { name: OWN_LABEL }));

      expect(own.getByText(TAKER_ID)).toBeVisible();
      expect(
        own.getByRole("button", { name: "Skopiuj identyfikator" }),
      ).toBeEnabled();
    });

    it("shows the field of the friend under its name, empty, with the form of an identifier as its placeholder", () => {
      renderForm();

      expect(getField()).toHaveValue("");
      expect(getField()).toHaveAttribute("placeholder", FRIEND_ID_PLACEHOLDER);
      expect(getField()).toBeValid();
    });

    it("describes the field by the hint", () => {
      renderForm();

      expect(getField().closest("[role=group]")).toHaveAccessibleDescription(
        HINT,
      );
    });

    it("is no field a browser fills in, corrects or capitalises", () => {
      renderForm();

      expect(getField()).toHaveAttribute("autocomplete", "off");
      expect(getField()).toHaveAttribute("autocapitalize", "none");
      expect(getField()).toHaveAttribute("spellcheck", "false");
    });
  });

  describe("when the field is changed", () => {
    it("hands on the text as typed", () => {
      const { onFriendIdChange } = renderForm();

      fireEvent.change(getField(), { target: { value: ` ${FRIEND_ID} ` } });

      expect(onFriendIdChange).toHaveBeenCalledExactlyOnceWith(
        ` ${FRIEND_ID} `,
      );
    });
  });

  describe("given a text and a notice about it", () => {
    it.each([
      [FriendNotice.Invalid, "To nie jest identyfikator wyników."],
      [FriendNotice.Own, "To jest Twój identyfikator."],
      [FriendNotice.OtherSurvey, "Ten wynik pochodzi z innego quizu."],
      [FriendNotice.Unreadable, "Nie znaleźliśmy takiego wyniku."],
    ])("marks the field as invalid and says why: %s", (notice, line) => {
      renderForm({ friendId: FRIEND_ID, notice });

      expect(getField()).toHaveValue(FRIEND_ID);
      expect(getField()).toBeInvalid();
      expect(getField().closest("[role=group]")).toHaveAccessibleDescription(
        line,
      );
      expect(screen.queryByText(HINT)).not.toBeInTheDocument();
    });
  });

  describe("given a result on the way", () => {
    it("says so, keeps the field valid, and does not let it be changed", () => {
      renderForm({ friendId: FRIEND_ID, notice: FriendNotice.Fetching });

      expect(getField().closest("[role=group]")).toHaveAccessibleDescription(
        "Wczytujemy wynik…",
      );
      expect(getField()).toBeValid();
      expect(getField()).toHaveAttribute("readonly");
      expect(getField()).toHaveAttribute("aria-busy", "true");
    });
  });

  describe("given any other notice", () => {
    it("lets the field be changed", () => {
      renderForm({ friendId: FRIEND_ID, notice: FriendNotice.Unreadable });

      expect(getField()).not.toHaveAttribute("readonly");
      expect(getField()).toHaveAttribute("aria-busy", "false");
    });
  });

  describe("the notices", () => {
    it("each say whether the text of the field cannot be used", () => {
      expect(Object.keys(IS_NOTICE_ERROR).sort()).toEqual(
        Object.values(FriendNotice).sort(),
      );
      expect(IS_NOTICE_ERROR[FriendNotice.Hint]).toBe(false);
      expect(IS_NOTICE_ERROR[FriendNotice.Fetching]).toBe(false);
    });
  });
});
