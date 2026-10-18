import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { AuthSession } from "@/types/auth";
import { AuthDialogContext } from "@/utils/auth/authDialogContext";
import { AuthSessionContext } from "@/utils/auth/authSessionContext";
import { createAuthAccount } from "@/utils/vitest/auth/createAuthAccount";
import { createSessionValue } from "@/utils/vitest/auth/createSessionValue";

import { RequireAuth } from "./RequireAuth";

// The guard composes: when it lets the page show is tested on
// useRequireAuthGuard.
const renderGuard = (session: AuthSession) =>
  render(
    <MemoryRouter>
      <AuthSessionContext value={createSessionValue({ session })}>
        <AuthDialogContext value={vi.fn()}>
          <RequireAuth intent="create-quiz">
            <p>Edytor</p>
          </RequireAuth>
        </AuthDialogContext>
      </AuthSessionContext>
    </MemoryRouter>,
  );

describe("RequireAuth", () => {
  describe("given a signed-in session", () => {
    it("shows the page", () => {
      renderGuard({ status: "signed-in", account: createAuthAccount() });

      expect(screen.getByText("Edytor")).toBeInTheDocument();
    });
  });

  describe("given a signed-out session", () => {
    it("shows nothing of the page", () => {
      renderGuard({ status: "signed-out" });

      expect(screen.queryByText("Edytor")).not.toBeInTheDocument();
    });
  });
});
