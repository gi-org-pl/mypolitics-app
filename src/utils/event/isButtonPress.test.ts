import { describe, expect, it } from "vitest";

import { isButtonPress } from "./isButtonPress";

const createGroup = () => {
  const group = document.createElement("div");

  group.innerHTML = "<button><span>Za</span></button>";

  return group;
};

describe("isButtonPress()", () => {
  describe("given a press on a button", () => {
    it("is true for the button itself", () => {
      const group = createGroup();

      expect(isButtonPress({ target: group.querySelector("button") })).toBe(
        true,
      );
    });

    it("is true for what is inside the button", () => {
      const group = createGroup();

      expect(isButtonPress({ target: group.querySelector("span") })).toBe(true);
    });
  });

  describe("given a press beside the buttons", () => {
    it("is false for the container", () => {
      expect(isButtonPress({ target: createGroup() })).toBe(false);
    });

    it("is false for a target that is not an element", () => {
      expect(isButtonPress({ target: null })).toBe(false);
      expect(isButtonPress({ target: document })).toBe(false);
    });
  });
});
