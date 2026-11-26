import { describe, expect, it } from "vitest";

import type { PillTab } from "../PillTabs.types";
import { toTabValue } from "./toTabValue";

type Mode = "mode-friend" | "mode-orientation";

const TABS: PillTab<Mode>[] = [
  { value: "mode-friend", label: "Ze znajomym" },
  { value: "mode-orientation", label: "Z orientacją" },
];

describe("toTabValue()", () => {
  describe("given the value of one of the tabs", () => {
    it("returns it", () => {
      expect(toTabValue(TABS, "mode-orientation", "mode-friend")).toBe(
        "mode-orientation",
      );
      expect(toTabValue(TABS, "mode-friend", "mode-friend")).toBe(
        "mode-friend",
      );
    });
  });

  describe("given a text that is the value of none of the tabs", () => {
    it("keeps the tab that was chosen", () => {
      expect(toTabValue(TABS, "mode-stranger", "mode-friend")).toBe(
        "mode-friend",
      );
      expect(toTabValue(TABS, "", "mode-orientation")).toBe("mode-orientation");
      expect(toTabValue(TABS, "Ze znajomym", "mode-orientation")).toBe(
        "mode-orientation",
      );
    });
  });

  describe("given no tabs", () => {
    it("keeps the tab that was chosen", () => {
      expect(toTabValue<Mode>([], "mode-orientation", "mode-friend")).toBe(
        "mode-friend",
      );
    });
  });
});
