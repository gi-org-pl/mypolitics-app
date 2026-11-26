import { afterEach, describe, expect, it, vi } from "vitest";

import { copyText } from "./copyText";

const stubClipboard = (clipboard: unknown) =>
  vi.stubGlobal("navigator", { clipboard });

describe("copyText()", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("given a browser with the Clipboard API", () => {
    it("writes the text to the clipboard and says it was copied", async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);

      stubClipboard({ writeText });

      await expect(copyText("5218cde2")).resolves.toBe(true);
      expect(writeText).toHaveBeenCalledExactlyOnceWith("5218cde2");
    });
  });

  describe("given a browser that refuses to write to the clipboard", () => {
    it("says it was not copied", async () => {
      stubClipboard({
        writeText: vi.fn().mockRejectedValue(new Error("NotAllowedError")),
      });

      await expect(copyText("5218cde2")).resolves.toBe(false);
    });
  });

  describe("given a browser without the Clipboard API", () => {
    it("says it was not copied", async () => {
      stubClipboard(undefined);

      await expect(copyText("5218cde2")).resolves.toBe(false);
    });
  });
});
