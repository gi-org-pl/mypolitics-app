import { describe, expect, it } from "vitest";

import verifiedIcon from "@/assets/icons/verified.svg";
import { createOrientation } from "@/utils/vitest/createOrientation";

import { MODULE_TEXTS } from "../ModuleDrawing.fixtures";
import { toRankedEntry } from "./toRankedEntry";

const orientation = createOrientation("party-left", "Lewica", {
  type: "party",
});

describe("toRankedEntry()", () => {
  describe("given an official orientation", () => {
    it("carries the verified badge, named for assistive technology", () => {
      expect(
        toRankedEntry(
          { orientation, value: 85, isOfficial: true },
          MODULE_TEXTS,
        ),
      ).toEqual({
        orientation,
        value: 85,
        badge: { iconUrl: verifiedIcon, label: "Zweryfikowany" },
      });
    });
  });

  describe("given an orientation that is not official", () => {
    it("carries no badge", () => {
      expect(
        toRankedEntry(
          { orientation, value: 85, isOfficial: false },
          MODULE_TEXTS,
        ).badge,
      ).toBeUndefined();
    });
  });

  describe("given an entry without a value", () => {
    it("stays without a value", () => {
      expect(
        toRankedEntry({ orientation, isOfficial: false }, MODULE_TEXTS).value,
      ).toBeUndefined();
    });
  });
});
