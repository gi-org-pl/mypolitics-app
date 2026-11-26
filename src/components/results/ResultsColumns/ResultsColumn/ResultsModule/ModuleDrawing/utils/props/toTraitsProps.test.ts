import { describe, expect, it } from "vitest";
import { findModule } from "@/utils/result-modules/resolvedModules.fixtures";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { toTraitsProps } from "./toTraitsProps";

describe("toTraitsProps()", () => {
  describe("given resolved traits", () => {
    it("hands over the title, the catalogue and the earned traits as they are", () => {
      expect(toTraitsProps(findModule("traits"))).toEqual({
        title: "Cechy",
        traits: [
          createOrientation("brave", "Odwaga"),
          createOrientation("calm", "Spokój"),
        ],
        earnedIds: ["brave"],
      });
    });
  });
});
