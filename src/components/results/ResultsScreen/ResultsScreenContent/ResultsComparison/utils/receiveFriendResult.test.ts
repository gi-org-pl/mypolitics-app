import { describe, expect, it } from "vitest";

import { ComparisonMode } from "@/types/comparison";
import { type ResultLoadResult, ResultLoadStatus } from "@/types/survey";

import {
  choosingFriend,
  FRIEND_ID,
  fetchingFriend,
  friendComparison,
  moduleFriendResult,
  moduleTaker,
  refusedOwn,
} from "../ResultsComparison.fixtures";
import {
  type ComparisonState,
  ComparisonStatus,
  FriendRefusal,
} from "../ResultsComparison.types";
import { receiveFriendResult } from "./receiveFriendResult";

const READY: ResultLoadResult = {
  status: ResultLoadStatus.Ready,
  result: moduleFriendResult,
};

const receive = (
  load: ResultLoadResult,
  state: ComparisonState = fetchingFriend,
  requestedId = FRIEND_ID,
) => receiveFriendResult(state, requestedId, load, moduleTaker, "Znajomy");

const refused = (refusal: FriendRefusal) => ({
  status: ComparisonStatus.Refused,
  mode: ComparisonMode.Friend,
  friendId: FRIEND_ID,
  refusal,
});

describe("receiveFriendResult()", () => {
  describe("given a calculated result of the same survey", () => {
    it("starts the comparison with the friend", () => {
      expect(receive(READY)).toEqual(friendComparison);
    });

    it("names the friend by the word it is given", () => {
      expect(receive(READY)).toMatchObject({
        other: { orientation: { id: FRIEND_ID, name: "Znajomy" } },
      });
    });
  });

  describe("given a result of another survey", () => {
    it("refuses it, with the text of the field kept", () => {
      expect(
        receive({
          status: ResultLoadStatus.Ready,
          result: { ...moduleFriendResult, surveyId: "another" },
        }),
      ).toEqual(refused(FriendRefusal.OtherSurvey));
    });
  });

  describe("given a result that does not exist, is not calculated, or cannot be read", () => {
    it.each([
      ["no such result", { status: ResultLoadStatus.NotFound }],
      ["a read that failed", { status: ResultLoadStatus.Failed }],
      [
        "a result that is not calculated",
        {
          status: ResultLoadStatus.Ready,
          result: { ...moduleFriendResult, isCalculated: false },
        },
      ],
    ] as [string, ResultLoadResult][])("refuses it: %s", (_, load) => {
      expect(receive(load)).toEqual(refused(FriendRefusal.Unreadable));
    });
  });

  describe("given a read nothing waits for any more", () => {
    it.each([
      ["the taker chooses again", choosingFriend],
      ["another identifier was refused", refusedOwn],
      ["a comparison runs", friendComparison],
    ] as [string, ComparisonState][])("changes nothing: %s", (_, state) => {
      expect(receive(READY, state)).toBe(state);
    });

    it("changes nothing when another identifier is waited for", () => {
      expect(
        receive(READY, fetchingFriend, "0b9f3c1e-5a7d-4e2b-9c41-7f6a2d8e1b35"),
      ).toBe(fetchingFriend);
    });
  });
});
