import { getImageKind } from "./getImageKind";

describe("getImageKind()", () => {
  describe("given the address of a vector image", () => {
    it("is a glyph", () => {
      expect(getImageKind("https://example.com/icons/pacyfizm.svg")).toBe(
        "glyph",
      );
    });
  });

  describe("given any other address", () => {
    it("is a picture", () => {
      expect(getImageKind("https://example.com/identities/patriot.png")).toBe(
        "picture",
      );
    });
  });

  describe("given no address", () => {
    it("is a picture", () => {
      expect(getImageKind()).toBe("picture");
    });
  });
});
