import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useAccountSetup } from "./useAccountSetup";

describe("useAccountSetup()", () => {
  describe("given a suggested name", () => {
    it("starts with it, both declarations missing and nothing shown", () => {
      const { result } = renderHook(() => useAccountSetup("Ala Nowak"));

      expect(result.current.name).toBe("Ala Nowak");
      expect(result.current.isAgeDeclared).toBe(false);
      expect(result.current.hasAcceptedTerms).toBe(false);
      expect(result.current.issues).toEqual([]);
    });
  });

  describe("given no suggested name", () => {
    it("starts empty", () => {
      const { result } = renderHook(() => useAccountSetup());

      expect(result.current.name).toBe("");
    });
  });

  describe("given everything is missing", () => {
    it("answers the issues in the order of the step and shows them", () => {
      const { result } = renderHook(() => useAccountSetup());

      let outcome: ReturnType<typeof result.current.submit> | undefined;
      act(() => {
        outcome = result.current.submit();
      });

      expect(outcome).toEqual([
        "name-missing",
        "age-not-declared",
        "terms-not-accepted",
      ]);
      expect(result.current.issues).toEqual(outcome);
    });
  });

  describe("given a one-character name", () => {
    it("says it is too short", () => {
      const { result } = renderHook(() => useAccountSetup("A"));

      let outcome: ReturnType<typeof result.current.submit> | undefined;
      act(() => {
        outcome = result.current.submit();
      });

      expect(outcome).toContain("name-too-short");
    });
  });

  describe("given a name made only of zero-width spaces", () => {
    it("says the name is missing", () => {
      const { result } = renderHook(() => useAccountSetup("​​"));

      let outcome: ReturnType<typeof result.current.submit> | undefined;
      act(() => {
        outcome = result.current.submit();
      });

      expect(outcome).toContain("name-missing");
    });
  });

  describe("given everything is filled in", () => {
    it("answers the cleaned setup", () => {
      const { result } = renderHook(() => useAccountSetup());

      act(() => {
        result.current.changeName("  Ala\tNowak ");
        result.current.setIsAgeDeclared(true);
        result.current.setHasAcceptedTerms(true);
      });
      let outcome: ReturnType<typeof result.current.submit> | undefined;
      act(() => {
        outcome = result.current.submit();
      });

      expect(outcome).toEqual({
        displayName: "Ala Nowak",
        isAgeDeclared: true,
        hasAcceptedTerms: true,
      });
    });
  });

  describe("given the issues are shown", () => {
    it("drops each as soon as it is fixed", () => {
      const { result } = renderHook(() => useAccountSetup());
      act(() => {
        result.current.submit();
      });

      act(() => result.current.setIsAgeDeclared(true));

      expect(result.current.issues).toEqual([
        "name-missing",
        "terms-not-accepted",
      ]);
    });
  });
});
