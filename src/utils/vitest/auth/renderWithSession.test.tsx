import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useAuthSession } from "@/utils/auth/useAuthSession";

import { createAuthAccount } from "./createAuthAccount";
import { createSessionValue } from "./createSessionValue";
import { renderWithSession } from "./renderWithSession";

const SessionStatus = () => <p>{useAuthSession().session.status}</p>;

describe("renderWithSession()", () => {
  describe("given no session value", () => {
    it("renders signed out and returns the value it used", () => {
      const { value } = renderWithSession(<SessionStatus />);

      expect(screen.getByText("signed-out")).toBeInTheDocument();
      expect(value.session).toEqual({ status: "signed-out" });
    });
  });

  describe("given a session value", () => {
    it("renders with it and returns it", () => {
      const session = createSessionValue({
        session: { status: "signed-in", account: createAuthAccount() },
      });

      const { value } = renderWithSession(<SessionStatus />, session);

      expect(screen.getByText("signed-in")).toBeInTheDocument();
      expect(value).toBe(session);
    });
  });
});
