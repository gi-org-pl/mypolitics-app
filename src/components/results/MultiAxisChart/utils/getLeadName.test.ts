import { describe, expect, it } from "vitest";
import { createAxisPair } from "@/utils/vitest/createAxisPair";
import type { AxisPair } from "../MultiAxisChart.types";
import { getLeadName } from "./getLeadName";

describe("getLeadName()", () => {
  describe("given a lead", () => {
    it("returns the name of the leading orientation", () => {
      expect(
        getLeadName(createAxisPair("a", "Pacyfizm", "Militaryzm", 69, 31)),
      ).toBe("Pacyfizm");
      expect(
        getLeadName(createAxisPair("a", "Pacyfizm", "Militaryzm", 31, 69)),
      ).toBe("Militaryzm");
    });

    it("returns the name on one line", () => {
      expect(
        getLeadName(createAxisPair("a", " Pacy\nfizm ", "Militaryzm", 69, 31)),
      ).toBe("Pacy fizm");
    });

    it("lets the other side lead when one value is absent", () => {
      expect(
        getLeadName(
          createAxisPair("a", "Pacyfizm", "Militaryzm", undefined, 31),
        ),
      ).toBe("Militaryzm");
    });
  });

  describe("given a tie", () => {
    it("returns an empty name", () => {
      expect(
        getLeadName(createAxisPair("a", "Pacyfizm", "Militaryzm", 50, 50)),
      ).toBe("");
      expect(getLeadName(createAxisPair("a", "Pacyfizm", "Militaryzm"))).toBe(
        "",
      );
    });

    it("decides the tie on rounded values", () => {
      expect(
        getLeadName(createAxisPair("a", "Pacyfizm", "Militaryzm", 50.4, 49.6)),
      ).toBe("");
    });
  });

  describe("given an axis with a missing entry", () => {
    it("does not throw", () => {
      expect(getLeadName({ id: "a" } as unknown as AxisPair)).toBe("");
      expect(
        getLeadName({
          id: "a",
          start: { value: 60 },
          end: { value: 40 },
        } as unknown as AxisPair),
      ).toBe("");
    });
  });
});
