import { toWebAddress } from "./toWebAddress";

describe("toWebAddress()", () => {
  describe("given an http or https address", () => {
    it("returns it as written", () => {
      expect(toWebAddress("https://example.com/logo.svg")).toBe(
        "https://example.com/logo.svg",
      );
      expect(toWebAddress("http://example.com")).toBe("http://example.com");
    });

    it("trims the space and line breaks around it", () => {
      expect(toWebAddress("  https://example.com/logo.svg\n")).toBe(
        "https://example.com/logo.svg",
      );
    });

    it("accepts an upper-case scheme", () => {
      expect(toWebAddress("HTTPS://example.com")).toBe("HTTPS://example.com");
    });
  });

  describe("given an address of another scheme", () => {
    it("returns undefined", () => {
      expect(toWebAddress("javascript:alert(1)")).toBeUndefined();
      expect(toWebAddress("data:image/png;base64,AAAA")).toBeUndefined();
      expect(toWebAddress("mailto:someone@example.com")).toBeUndefined();
    });
  });

  describe("given text that is not an address", () => {
    it("returns undefined", () => {
      expect(toWebAddress("example.com")).toBeUndefined();
      expect(toWebAddress("/logo.svg")).toBeUndefined();
      expect(toWebAddress("not an address")).toBeUndefined();
    });
  });

  describe("given missing, empty or blank text", () => {
    it("returns undefined", () => {
      expect(toWebAddress()).toBeUndefined();
      expect(toWebAddress(null)).toBeUndefined();
      expect(toWebAddress("")).toBeUndefined();
      expect(toWebAddress("   ")).toBeUndefined();
    });
  });

  describe("given a value that is not text", () => {
    it("returns undefined", () => {
      expect(toWebAddress(42 as unknown as string)).toBeUndefined();
    });
  });
});
