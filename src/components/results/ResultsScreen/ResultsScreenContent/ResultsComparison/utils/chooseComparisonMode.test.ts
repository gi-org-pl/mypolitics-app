import { describe, expect, it } from "vitest";

import { ComparisonMode } from "@/types/comparison";

import {
  choosingFriend,
  choosingWithInvalidId,
  fetchingFriend,
  friendComparison,
  refusedOwn,
  TAKER_ID,
} from "../ResultsComparison.fixtures";
import { ComparisonStatus } from "../ResultsComparison.types";
import { chooseComparisonMode } from "./chooseComparisonMode";

describe("chooseComparisonMode()", () => {
  describe("while the taker chooses", () => {
    it("shows the mode that was picked", () => {
      expect(
        chooseComparisonMode(choosingFriend, ComparisonMode.Orientation),
      ).toEqual({
        status: ComparisonStatus.Choosing,
        mode: ComparisonMode.Orientation,
        friendId: "",
      });
    });

    it("keeps what was typed in the field of the friend", () => {
      expect(
        chooseComparisonMode(choosingWithInvalidId, ComparisonMode.Orientation),
      ).toMatchObject({ friendId: choosingWithInvalidId.friendId });
    });
  });

  describe("after a refusal", () => {
    it("shows the mode that was picked, without the refusal", () => {
      expect(
        chooseComparisonMode(refusedOwn, ComparisonMode.Orientation),
      ).toEqual({
        status: ComparisonStatus.Choosing,
        mode: ComparisonMode.Orientation,
        friendId: TAKER_ID,
      });
    });
  });

  describe("while a result is on the way", () => {
    it("changes nothing", () => {
      expect(
        chooseComparisonMode(fetchingFriend, ComparisonMode.Orientation),
      ).toBe(fetchingFriend);
    });
  });

  describe("while a comparison runs", () => {
    it("changes nothing", () => {
      expect(
        chooseComparisonMode(friendComparison, ComparisonMode.Orientation),
      ).toBe(friendComparison);
    });
  });
});
