import { describe, expect, it } from "vitest";

import { PARTIAL_MATCH_FROM } from "@/constants/results";
import { createOrientation } from "@/utils/vitest/createOrientation";

import { getLeader } from "./getLeader";

const orientation = createOrientation("socialist", "Socjalista");

describe("getLeader()", () => {
  describe("given a header whose orientation is a partial match at least", () => {
    it("returns the orientation with its value", () => {
      expect(getLeader({ orientation, confidence: 82.5 })).toEqual({
        orientation,
        value: 82.5,
      });
    });

    it("returns it at the threshold itself", () => {
      expect(
        getLeader({ orientation, confidence: PARTIAL_MATCH_FROM }),
      ).toEqual({ orientation, value: PARTIAL_MATCH_FROM });
    });
  });

  describe("given a header whose orientation is below a partial match", () => {
    it("returns nothing", () => {
      expect(
        getLeader({ orientation, confidence: PARTIAL_MATCH_FROM - 0.1 }),
      ).toBeUndefined();
      expect(getLeader({ orientation, confidence: 0 })).toBeUndefined();
    });
  });

  describe("given a header with no orientation", () => {
    it("returns nothing", () => {
      expect(getLeader({ linkLabel: "Zobacz stronę" })).toBeUndefined();
      expect(getLeader({ confidence: 90 })).toBeUndefined();
    });
  });

  describe("given an orientation with no confidence", () => {
    it("returns nothing", () => {
      expect(getLeader({ orientation })).toBeUndefined();
    });
  });

  describe("given no header", () => {
    it("returns nothing", () => {
      expect(getLeader()).toBeUndefined();
    });
  });
});
