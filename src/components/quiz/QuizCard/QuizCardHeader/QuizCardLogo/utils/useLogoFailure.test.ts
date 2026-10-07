import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useLogoFailure } from "./useLogoFailure";

const LOGO_URL = "/assets/quiz-logo-mypolitics.svg";
const OTHER_LOGO_URL = "/assets/quiz-logo-wyborczy-2023.svg";

const renderLogoFailure = (initialUrl: string = LOGO_URL) =>
  renderHook(({ url }) => useLogoFailure(url), {
    initialProps: { url: initialUrl },
  });

describe("useLogoFailure()", () => {
  describe("given the address of a logo", () => {
    it("starts with the logo not failed", () => {
      const { result } = renderLogoFailure();

      expect(result.current.hasFailed).toBe(false);
    });

    it("stays not failed between renders", () => {
      const { result, rerender } = renderLogoFailure();

      rerender({ url: LOGO_URL });

      expect(result.current.hasFailed).toBe(false);
    });
  });

  describe("when the logo is marked as failed", () => {
    it("reports the failure", () => {
      const { result } = renderLogoFailure();

      act(() => result.current.markFailed());

      expect(result.current.hasFailed).toBe(true);
    });

    it("keeps reporting it between renders with the same address", () => {
      const { result, rerender } = renderLogoFailure();

      act(() => result.current.markFailed());
      rerender({ url: LOGO_URL });

      expect(result.current.hasFailed).toBe(true);
    });
  });

  describe("when the address changes after a failure", () => {
    it("gives the new logo a chance to load", () => {
      const { result, rerender } = renderLogoFailure();

      act(() => result.current.markFailed());
      rerender({ url: OTHER_LOGO_URL });

      expect(result.current.hasFailed).toBe(false);
    });

    it("still knows the first address failed when it comes back", () => {
      const { result, rerender } = renderLogoFailure();

      act(() => result.current.markFailed());
      rerender({ url: OTHER_LOGO_URL });
      rerender({ url: LOGO_URL });

      expect(result.current.hasFailed).toBe(true);
    });
  });

  describe("when the new logo fails as well", () => {
    it("reports the failure of the new logo", () => {
      const { result, rerender } = renderLogoFailure();

      act(() => result.current.markFailed());
      rerender({ url: OTHER_LOGO_URL });
      act(() => result.current.markFailed());

      expect(result.current.hasFailed).toBe(true);
    });
  });
});
