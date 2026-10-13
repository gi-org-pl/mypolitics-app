import { i18n } from "@lingui/core";
import { describe, expect, it } from "vitest";

import { Agreement } from "@/types/comparison";

import { AGREEMENT_LABELS } from "./comparison";

describe("AGREEMENT_LABELS", () => {
  describe("given every way two sides can stand on a question", () => {
    it("has a word for each", () => {
      expect(Object.keys(AGREEMENT_LABELS).sort()).toEqual(
        Object.values(Agreement).sort(),
      );
    });

    it("has a different word for each", () => {
      expect(
        Object.values(Agreement).map((agreement) =>
          i18n._(AGREEMENT_LABELS[agreement]),
        ),
      ).toEqual(["Zgodność", "Niezgodność", "Brak porównania"]);
    });
  });
});
