import { describe, expect, it } from "vitest";

import {
  choosingFriend,
  choosingOrientation,
  choosingWithInvalidId,
  FRIEND_ID,
  fetchingFriend,
  refusedOtherSurvey,
  refusedOwn,
  refusedUnreadable,
} from "../../ResultsComparison.fixtures";
import { FriendNotice } from "../FriendForm/FriendForm.types";
import { getFriendNotice } from "./getFriendNotice";

describe("getFriendNotice()", () => {
  describe("while the taker chooses", () => {
    it("is the hint for an empty field", () => {
      expect(getFriendNotice(choosingFriend)).toBe(FriendNotice.Hint);
      expect(getFriendNotice({ ...choosingFriend, friendId: "   " })).toBe(
        FriendNotice.Hint,
      );
      expect(getFriendNotice(choosingOrientation)).toBe(FriendNotice.Hint);
    });

    it("says that a text which is not an identifier in form is none", () => {
      expect(getFriendNotice(choosingWithInvalidId)).toBe(FriendNotice.Invalid);
      expect(getFriendNotice({ ...choosingFriend, friendId: "znajomy" })).toBe(
        FriendNotice.Invalid,
      );
    });

    it("keeps the hint for an identifier nothing was asked for yet", () => {
      expect(getFriendNotice({ ...choosingFriend, friendId: FRIEND_ID })).toBe(
        FriendNotice.Hint,
      );
    });
  });

  describe("while a result is on the way", () => {
    it("says so", () => {
      expect(getFriendNotice(fetchingFriend)).toBe(FriendNotice.Fetching);
    });
  });

  describe("after a refusal", () => {
    it("says why the result cannot be used", () => {
      expect(getFriendNotice(refusedOwn)).toBe(FriendNotice.Own);
      expect(getFriendNotice(refusedOtherSurvey)).toBe(
        FriendNotice.OtherSurvey,
      );
      expect(getFriendNotice(refusedUnreadable)).toBe(FriendNotice.Unreadable);
    });
  });
});
