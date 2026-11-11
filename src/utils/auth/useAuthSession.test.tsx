import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useAuthSession } from "./useAuthSession";

const Probe = () => {
  useAuthSession();

  return null;
};

describe("useAuthSession()", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("given no AuthSessionProvider around it", () => {
    it("throws an error that names the provider", () => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);

      expect(() => render(<Probe />)).toThrow(
        "useAuthSession is used outside AuthSessionProvider",
      );
    });
  });
});
