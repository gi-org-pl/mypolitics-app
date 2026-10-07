import { describe, expect, it } from "vitest";
import { createAxisPair } from "@/utils/vitest/createAxisPair";
import type { AxisPair } from "../MultiAxisChart.types";
import { getPreviewIcons } from "./getPreviewIcons";

const force = createAxisPair("force", "Pacyfizm", "Militaryzm", 5, 95);
const faith = createAxisPair("faith", "Sekularyzm", "Religijność", 60, 40);

describe("getPreviewIcons()", () => {
  describe("given axes with icons", () => {
    it("returns the icons of the start poles, in the given order", () => {
      expect(getPreviewIcons([force, faith], "start")).toEqual([
        "https://example.com/force-start.svg",
        "https://example.com/faith-start.svg",
      ]);
    });

    it("returns the icons of the end poles, in the given order", () => {
      expect(getPreviewIcons([force, faith], "end")).toEqual([
        "https://example.com/force-end.svg",
        "https://example.com/faith-end.svg",
      ]);
    });
  });

  describe("given an orientation without an icon", () => {
    it("leaves it out", () => {
      const withoutIcon: AxisPair = {
        ...force,
        start: {
          ...force.start,
          orientation: { ...force.start.orientation, imageUrl: "" },
        },
      };

      expect(getPreviewIcons([withoutIcon, faith], "start")).toEqual([
        "https://example.com/faith-start.svg",
      ]);
    });
  });

  describe("given an axis with a missing entry", () => {
    it("leaves it out without throwing", () => {
      expect(
        getPreviewIcons([{ id: "a" } as unknown as AxisPair, faith], "end"),
      ).toEqual(["https://example.com/faith-end.svg"]);
    });
  });
});
