import { describe, expect, it } from "vitest";

import personAvatar from "@/assets/icons/person-avatar.svg";
import { SAFE_COLOR_PATTERN } from "@/constants/color";
import { ComparisonMode } from "@/types/comparison";

import { FRIEND_COLOR } from "../ResultsComparison.constants";
import { FRIEND_ID, moduleFriendResult } from "../ResultsComparison.fixtures";
import { toFriendSide } from "./toFriendSide";

describe("toFriendSide()", () => {
  describe("given the result of a friend", () => {
    const side = toFriendSide(moduleFriendResult, "Znajomy");

    it("is a friend with that result", () => {
      expect(side.mode).toBe(ComparisonMode.Friend);
      expect(side.result).toBe(moduleFriendResult);
    });

    it("draws the friend as a person whose identifier is the identifier of the result", () => {
      expect(side.orientation).toMatchObject({
        id: FRIEND_ID,
        type: "person",
      });
    });

    it("names the friend by the word it is given, not by anything of their own", () => {
      expect(side.orientation.name).toBe("Znajomy");
      expect(toFriendSide(moduleFriendResult, "Friend").orientation.name).toBe(
        "Friend",
      );
    });

    it("draws the friend with the default avatar, in the colour of a friend", () => {
      expect(side.orientation.imageUrl).toBe(personAvatar);
      expect(side.orientation.color).toBe(FRIEND_COLOR);
    });
  });

  describe("the colour of a friend", () => {
    it("is one a bar accepts", () => {
      expect(FRIEND_COLOR).toMatch(SAFE_COLOR_PATTERN);
    });
  });
});
