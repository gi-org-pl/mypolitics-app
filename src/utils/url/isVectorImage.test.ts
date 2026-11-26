import { isVectorImage } from "./isVectorImage";

describe("isVectorImage()", () => {
  describe("given the address of an SVG file", () => {
    it("returns true", () => {
      expect(
        isVectorImage(
          "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/icons/v2/progresywizm.svg",
        ),
      ).toBe(true);
      expect(isVectorImage("/icons/arrow.svg")).toBe(true);
    });

    it("ignores the case of the extension, and the space around the address", () => {
      expect(isVectorImage("  https://example.com/ICON.SVG\n")).toBe(true);
    });

    it("ignores a query and a fragment after the file name", () => {
      expect(isVectorImage("https://example.com/icon.svg?v=2")).toBe(true);
      expect(isVectorImage("https://example.com/icon.svg#glyph")).toBe(true);
    });
  });

  describe("given an SVG written into the address", () => {
    it("returns true", () => {
      expect(isVectorImage("data:image/svg+xml,%3Csvg/%3E")).toBe(true);
      expect(isVectorImage("data:image/svg+xml;base64,PHN2Zy8+")).toBe(true);
    });
  });

  describe("given the address of a raster image", () => {
    it("returns false", () => {
      expect(
        isVectorImage(
          "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/icons/v2/identities/spoleczny-patriota-m.png",
        ),
      ).toBe(false);
      expect(isVectorImage("https://example.com/photo.jpg")).toBe(false);
      expect(isVectorImage("data:image/png;base64,AAAA")).toBe(false);
    });

    it("is not misled by svg elsewhere in the address", () => {
      expect(isVectorImage("https://example.com/svg/photo.png")).toBe(false);
      expect(isVectorImage("https://example.com/photo.png?as=.svg")).toBe(
        false,
      );
    });
  });

  describe("given no address", () => {
    it("returns false", () => {
      expect(isVectorImage()).toBe(false);
      expect(isVectorImage(null)).toBe(false);
      expect(isVectorImage("")).toBe(false);
      expect(isVectorImage(42 as unknown as string)).toBe(false);
    });
  });
});
