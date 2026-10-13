import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { useDocumentTitle } from "./useDocumentTitle";

const renderTitle = (title?: string) =>
  renderHook(({ current }) => useDocumentTitle(current), {
    initialProps: { current: title },
  });

describe("useDocumentTitle()", () => {
  beforeEach(() => {
    document.title = "mypolitics";
  });

  afterEach(() => {
    document.title = "";
  });

  describe("given a title", () => {
    it("sets the title of the document", () => {
      renderTitle("Quiz Tożsamościowy");

      expect(document.title).toBe("Quiz Tożsamościowy");
    });

    it("follows the title when it changes", () => {
      const { rerender } = renderTitle("Quiz Tożsamościowy");

      rerender({ current: "Barometr Prezydencki 2025" });

      expect(document.title).toBe("Barometr Prezydencki 2025");
    });

    it("gives the document its own title back when it is unmounted", () => {
      const { unmount } = renderTitle("Quiz Tożsamościowy");

      unmount();

      expect(document.title).toBe("mypolitics");
    });

    it("gives the document its own title back when the title is gone", () => {
      const { rerender } = renderTitle("Quiz Tożsamościowy");

      rerender({ current: undefined });

      expect(document.title).toBe("mypolitics");
    });
  });

  describe("given no title", () => {
    it("leaves the title of the document as it is", () => {
      const { unmount } = renderTitle();

      expect(document.title).toBe("mypolitics");

      unmount();

      expect(document.title).toBe("mypolitics");
    });
  });
});
