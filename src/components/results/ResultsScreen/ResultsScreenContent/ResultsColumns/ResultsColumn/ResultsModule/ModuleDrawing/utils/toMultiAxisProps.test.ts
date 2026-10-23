import { describe, expect, it } from "vitest";

import { findModule } from "@/utils/result-modules/resolvedModules.fixtures";
import { toMultiAxisProps } from "./toMultiAxisProps";

describe("toMultiAxisProps()", () => {
  describe("given a resolved multi axis", () => {
    it("hands over the title, the groups with their axes as they are, and the marker", () => {
      const module = findModule("multi_axis");
      const props = toMultiAxisProps(module);

      expect(props).toEqual({
        title: "Ideologie",
        groups: module.groups,
        marker: 50,
      });
      expect(props.groups.map(({ name }) => name)).toEqual([
        "Gospodarka",
        "Społeczeństwo",
      ]);
      expect(props.groups[0].axes[0].id).toBe("economy-axis");
    });

    it("carries nothing else of the module", () => {
      expect(Object.keys(toMultiAxisProps(findModule("multi_axis")))).toEqual([
        "title",
        "groups",
        "marker",
      ]);
    });
  });
});
