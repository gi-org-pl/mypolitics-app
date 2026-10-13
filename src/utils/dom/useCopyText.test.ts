import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CopyOutcome } from "@/types/common";

import { useCopyText } from "./useCopyText";

const stubClipboard = (clipboard: unknown) =>
  vi.stubGlobal("navigator", { clipboard });

describe("useCopyText()", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("before anything is copied", () => {
    it("has no outcome", () => {
      const { result } = renderHook(() => useCopyText("5218cde2"));

      expect(result.current.outcome).toBeUndefined();
    });
  });

  describe("when the text is copied", () => {
    it("writes it to the clipboard and says it was copied", async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);

      stubClipboard({ writeText });

      const { result } = renderHook(() => useCopyText("5218cde2"));

      act(() => result.current.copy());

      await waitFor(() =>
        expect(result.current.outcome).toBe(CopyOutcome.Copied),
      );
      expect(writeText).toHaveBeenCalledExactlyOnceWith("5218cde2");
    });
  });

  describe("when the browser refuses to write to the clipboard", () => {
    it("says the copy failed", async () => {
      stubClipboard({
        writeText: vi.fn().mockRejectedValue(new Error("NotAllowedError")),
      });

      const { result } = renderHook(() => useCopyText("5218cde2"));

      act(() => result.current.copy());

      await waitFor(() =>
        expect(result.current.outcome).toBe(CopyOutcome.Failed),
      );
    });
  });

  describe("when the browser has no Clipboard API", () => {
    it("says the copy failed", async () => {
      stubClipboard(undefined);

      const { result } = renderHook(() => useCopyText("5218cde2"));

      act(() => result.current.copy());

      await waitFor(() =>
        expect(result.current.outcome).toBe(CopyOutcome.Failed),
      );
    });
  });

  describe("when a copy that failed is tried again and works", () => {
    it("says it was copied", async () => {
      const writeText = vi
        .fn()
        .mockRejectedValueOnce(new Error("NotAllowedError"))
        .mockResolvedValue(undefined);

      stubClipboard({ writeText });

      const { result } = renderHook(() => useCopyText("5218cde2"));

      act(() => result.current.copy());
      await waitFor(() =>
        expect(result.current.outcome).toBe(CopyOutcome.Failed),
      );

      act(() => result.current.copy());
      await waitFor(() =>
        expect(result.current.outcome).toBe(CopyOutcome.Copied),
      );
    });
  });
});
