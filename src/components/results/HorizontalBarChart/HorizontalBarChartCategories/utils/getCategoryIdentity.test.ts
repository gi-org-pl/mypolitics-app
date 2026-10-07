import { describe, expect, it } from "vitest";

import { getCategoryIdentity } from "./getCategoryIdentity";

describe("getCategoryIdentity()", () => {
  describe("given a category with an id", () => {
    it("returns the id, whatever the name is", () => {
      expect(
        getCategoryIdentity({ id: "economy", name: "Gospodarka", entries: [] }),
      ).toBe("id:economy");
      expect(
        getCategoryIdentity({ id: "economy", name: "Finanse", entries: [] }),
      ).toBe("id:economy");
    });

    it("keeps an empty id as an id", () => {
      expect(getCategoryIdentity({ id: "", entries: [] })).toBe("id:");
    });
  });

  describe("given a category without an id", () => {
    it("returns its name on one line", () => {
      expect(
        getCategoryIdentity({ name: " Polityka\nkrajowa ", entries: [] }),
      ).toBe("name:Polityka krajowa");
    });
  });

  describe("given an id equal to another category's name", () => {
    it("returns different identities", () => {
      expect(getCategoryIdentity({ id: "Prawo", entries: [] })).not.toBe(
        getCategoryIdentity({ name: "Prawo", entries: [] }),
      );
    });
  });

  describe("given neither an id nor a name, or no category", () => {
    it("returns the identity of a nameless category", () => {
      expect(getCategoryIdentity({ entries: [] })).toBe("name:");
      expect(getCategoryIdentity()).toBe("name:");
    });
  });
});
