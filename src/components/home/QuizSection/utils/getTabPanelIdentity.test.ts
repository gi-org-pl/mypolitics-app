import { describe, expect, it } from "vitest";

import { getTabPanelIdentity } from "./getTabPanelIdentity";

describe("getTabPanelIdentity", () => {
  describe("when it gets a tab", () => {
    it("names the panel after the tab", () => {
      expect(getTabPanelIdentity("all").id).toBe("panel-all");
      expect(getTabPanelIdentity("social").id).toBe("panel-social");
    });

    it("points the label of the panel at the tab", () => {
      expect(getTabPanelIdentity("electoral").labelledBy).toBe("tab-electoral");
    });
  });
});
