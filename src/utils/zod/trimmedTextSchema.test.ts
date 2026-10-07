import { describe, expect, it } from "vitest";

import { trimmedTextSchema } from "./trimmedTextSchema";

describe("trimmedTextSchema", () => {
  describe("given text", () => {
    it("returns it without the space and line breaks around it", () => {
      expect(trimmedTextSchema.parse("Zieloni")).toBe("Zieloni");
      expect(trimmedTextSchema.parse("  Nowa Lewica \n")).toBe("Nowa Lewica");
    });

    it("keeps the space and line breaks inside it", () => {
      expect(trimmedTextSchema.parse("Pierwszy akapit.\n\nDrugi akapit.")).toBe(
        "Pierwszy akapit.\n\nDrugi akapit.",
      );
    });
  });

  describe("given empty or blank text", () => {
    it.each(["", "   ", " \n\t "])("rejects %j", (text) => {
      expect(trimmedTextSchema.safeParse(text).success).toBe(false);
    });
  });

  describe("given a value that is not text", () => {
    it.each([undefined, null, 2050, true, {}, []])("rejects %j", (value) => {
      expect(trimmedTextSchema.safeParse(value).success).toBe(false);
    });
  });
});
