import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { createAxisPair } from "@/utils/vitest/createAxisPair";
import type { AxisGroup, AxisPair } from "../MultiAxisChart.types";
import { useGroupName } from "./useGroupName";

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

const getName = (group: AxisGroup) =>
  renderHook(() => useGroupName(group), { wrapper }).result.current;

describe("useGroupName()", () => {
  describe("given a group with a name", () => {
    it("returns the name on one line", () => {
      expect(
        getName({
          name: " Świato\npogląd ",
          axes: [createAxisPair("a", "Pacyfizm", "Militaryzm", 5, 95)],
        }),
      ).toBe("Świato pogląd");
    });
  });

  describe("given a group without a name", () => {
    it("returns the headline axis lead", () => {
      expect(
        getName({
          axes: [
            createAxisPair("a", "Pacyfizm", "Militaryzm", 5, 95),
            createAxisPair("b", "Sekularyzm", "Religijność", 100, 0),
          ],
        }),
      ).toBe("Militaryzm");
    });

    it("returns both poles on a tie", () => {
      expect(
        getName({
          axes: [createAxisPair("a", "Pacyfizm", "Militaryzm", 50, 50)],
        }),
      ).toBe("Pacyfizm / Militaryzm");
    });

    it("returns the only named pole of a tie", () => {
      expect(
        getName({ axes: [createAxisPair("a", "", "Militaryzm", 50, 50)] }),
      ).toBe("Militaryzm");
      expect(
        getName({ axes: [createAxisPair("a", "Pacyfizm", " ", 50, 50)] }),
      ).toBe("Pacyfizm");
    });

    it("returns an empty name when there is nothing to name it by", () => {
      expect(getName({ axes: [createAxisPair("a", "", "", 50, 50)] })).toBe("");
      expect(getName({ axes: [{ id: "a" } as unknown as AxisPair] })).toBe("");
    });
  });
});
