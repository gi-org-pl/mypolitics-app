import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useModuleInfo } from "./useModuleInfo";

const DESCRIPTION = "Jak blisko ci do każdej ze stron osi.";

describe("useModuleInfo()", () => {
  describe("given a description", () => {
    it("is closed at first, and can be opened", () => {
      const { result } = renderHook(() => useModuleInfo(DESCRIPTION));

      expect(result.current.isOpen).toBe(false);
      expect(result.current.open).toBeTypeOf("function");
    });

    it("opens, and closes again", () => {
      const { result } = renderHook(() => useModuleInfo(DESCRIPTION));

      act(() => result.current.open?.());

      expect(result.current.isOpen).toBe(true);

      act(() => result.current.close());

      expect(result.current.isOpen).toBe(false);
    });

    it("keeps the same functions between renders, open or closed", () => {
      const { result } = renderHook(() => useModuleInfo(DESCRIPTION));
      const { open, close } = result.current;

      act(() => result.current.open?.());

      expect(result.current.open).toBe(open);
      expect(result.current.close).toBe(close);
    });
  });

  describe("given no description, or a blank one", () => {
    it.each([
      ["none", undefined],
      ["an empty one", ""],
      ["only spaces", "   "],
    ])("offers no way to open it: %s", (_, description) => {
      const { result } = renderHook(() => useModuleInfo(description));

      expect(result.current.open).toBeUndefined();
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe("when the description goes away while it is open", () => {
    it("is closed", () => {
      const { result, rerender } = renderHook(
        ({ description }: { description?: string }) =>
          useModuleInfo(description),
        {
          initialProps: { description: DESCRIPTION } as {
            description?: string;
          },
        },
      );

      act(() => result.current.open?.());
      rerender({ description: undefined });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.open).toBeUndefined();
    });
  });
});
