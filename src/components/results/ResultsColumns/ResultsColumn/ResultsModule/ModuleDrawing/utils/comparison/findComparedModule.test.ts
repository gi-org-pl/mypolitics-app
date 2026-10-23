import { describe, expect, it } from "vitest";

import {
  findFriendModule,
  findModule,
  friendModules,
} from "@/utils/result-modules/resolvedModules.fixtures";

import { findComparedModule } from "./findComparedModule";

describe("findComparedModule()", () => {
  describe("given the modules of the other result", () => {
    it("returns the one resolved from the same record", () => {
      expect(findComparedModule(findModule("archetype"), friendModules)).toBe(
        findFriendModule("archetype"),
      );
      expect(findComparedModule(findModule("traits"), friendModules)).toBe(
        findFriendModule("traits"),
      );
    });
  });

  describe("given an other result that does not draw the module", () => {
    it("returns none", () => {
      expect(
        findComparedModule(
          findModule("archetype"),
          friendModules.filter(({ type }) => type !== "archetype"),
        ),
      ).toBeUndefined();
      expect(findComparedModule(findModule("archetype"), [])).toBeUndefined();
    });
  });

  describe("given a module with the same identifier and another type", () => {
    it("returns none", () => {
      expect(
        findComparedModule(findModule("archetype"), [
          { ...findFriendModule("traits"), id: findModule("archetype").id },
        ]),
      ).toBeUndefined();
    });
  });
});
