import { i18n } from "@lingui/core";
import { describe, expect, it } from "vitest";

import { createMessage } from "./createMessage";

describe("createMessage", () => {
  describe("when it gets a text", () => {
    it("returns a descriptor with the text as its message and its id", () => {
      expect(createMessage("Wyborczy 2023")).toEqual({
        id: "Wyborczy 2023",
        message: "Wyborczy 2023",
      });
    });

    it("returns a descriptor that is translated to the text itself", () => {
      expect(i18n._(createMessage("Polskie Lata 90."))).toBe(
        "Polskie Lata 90.",
      );
    });

    it("keeps the tags of a rich text as they are", () => {
      expect(createMessage("<0>Lead.</0> Rest.").message).toBe(
        "<0>Lead.</0> Rest.",
      );
    });
  });

  describe("when it gets an empty text", () => {
    it("returns a descriptor with an empty message", () => {
      expect(createMessage("")).toEqual({ id: "", message: "" });
    });
  });
});
