import { describe, expect, it } from "vitest";

import { ComparisonMode } from "@/types/comparison";

import {
  choosingFriend,
  choosingOrientation,
  FRIEND_ID,
  fetchingFriend,
  friendComparison,
  refusedUnreadable,
  TAKER_ID,
} from "../ResultsComparison.fixtures";
import { ComparisonStatus, FriendRefusal } from "../ResultsComparison.types";
import { enterFriendId } from "./enterFriendId";

describe("enterFriendId()", () => {
  describe("given a result identifier in form", () => {
    it("asks for the result of the friend", () => {
      expect(enterFriendId(choosingFriend, FRIEND_ID, TAKER_ID)).toEqual({
        status: ComparisonStatus.Fetching,
        mode: ComparisonMode.Friend,
        friendId: FRIEND_ID,
        requestedId: FRIEND_ID,
      });
    });
  });

  describe("given an identifier with space around it", () => {
    it("asks by the trimmed identifier, and keeps the text as typed", () => {
      expect(
        enterFriendId(choosingFriend, `  ${FRIEND_ID}\n`, TAKER_ID),
      ).toMatchObject({
        status: ComparisonStatus.Fetching,
        friendId: `  ${FRIEND_ID}\n`,
        requestedId: FRIEND_ID,
      });
    });
  });

  describe("given an identifier in upper case", () => {
    it("asks by the identifier in lower case", () => {
      expect(
        enterFriendId(choosingFriend, FRIEND_ID.toUpperCase(), TAKER_ID),
      ).toMatchObject({ requestedId: FRIEND_ID });
    });
  });

  describe("given the identifier of the taker", () => {
    it("refuses it, without asking for anything", () => {
      expect(enterFriendId(choosingFriend, TAKER_ID, TAKER_ID)).toEqual({
        status: ComparisonStatus.Refused,
        mode: ComparisonMode.Friend,
        friendId: TAKER_ID,
        refusal: FriendRefusal.Own,
      });
    });

    it("refuses it whatever its letter case and the space around it", () => {
      expect(
        enterFriendId(choosingFriend, ` ${TAKER_ID.toUpperCase()} `, TAKER_ID),
      ).toMatchObject({
        status: ComparisonStatus.Refused,
        refusal: FriendRefusal.Own,
      });
    });
  });

  describe("given a text that is not an identifier in form", () => {
    it("asks for nothing, and keeps the text", () => {
      expect(enterFriendId(choosingFriend, "5218cde2-beac", TAKER_ID)).toEqual({
        status: ComparisonStatus.Choosing,
        mode: ComparisonMode.Friend,
        friendId: "5218cde2-beac",
      });
    });
  });

  describe("given an emptied field", () => {
    it("asks for nothing", () => {
      expect(enterFriendId(choosingFriend, "", TAKER_ID)).toEqual(
        choosingFriend,
      );
    });
  });

  describe("after a refusal", () => {
    it("takes another identifier", () => {
      expect(
        enterFriendId(refusedUnreadable, FRIEND_ID, TAKER_ID),
      ).toMatchObject({
        status: ComparisonStatus.Fetching,
        requestedId: FRIEND_ID,
      });
    });

    it("drops the refusal as soon as the text changes", () => {
      expect(
        enterFriendId(refusedUnreadable, FRIEND_ID.slice(0, -1), TAKER_ID),
      ).toEqual({
        status: ComparisonStatus.Choosing,
        mode: ComparisonMode.Friend,
        friendId: FRIEND_ID.slice(0, -1),
      });
    });
  });

  describe("given the field of another mode", () => {
    it("is the field of the friend mode", () => {
      expect(
        enterFriendId(choosingOrientation, FRIEND_ID, TAKER_ID),
      ).toMatchObject({ mode: ComparisonMode.Friend });
    });
  });

  describe("while a result is on the way", () => {
    it("changes nothing", () => {
      expect(enterFriendId(fetchingFriend, "", TAKER_ID)).toBe(fetchingFriend);
    });
  });

  describe("while a comparison runs", () => {
    it("changes nothing", () => {
      expect(enterFriendId(friendComparison, FRIEND_ID, TAKER_ID)).toBe(
        friendComparison,
      );
    });
  });
});
