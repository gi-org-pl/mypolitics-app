import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import type { AuthSession } from "@/types/auth";
import { createAuthAccount } from "@/utils/vitest/auth/createAuthAccount";
import {
  createSessionValue,
  renderWithSession,
} from "@/utils/vitest/auth/renderWithSession";

import { HeaderAccount } from "./HeaderAccount";
import type { HeaderAccountProps } from "./HeaderAccount.types";

// The account place composes: what each part does is tested on the part.
const renderAccount = (
  session: AuthSession,
  variant: HeaderAccountProps["variant"],
) =>
  renderWithSession(
    <MemoryRouter initialEntries={["/quizzes"]}>
      <HeaderAccount variant={variant} />
    </MemoryRouter>,
    createSessionValue({ session }),
  );

const SIGNED_IN: AuthSession = {
  status: "signed-in",
  account: createAuthAccount(),
};

describe("HeaderAccount", () => {
  describe.each(["bar", "menu"] as const)("in the %s", (variant) => {
    it("shows nothing while the session is not known", () => {
      const { container } = renderAccount({ status: "unknown" }, variant);

      expect(container).toBeEmptyDOMElement();
    });

    it("offers to sign in when signed out", () => {
      renderAccount({ status: "signed-out" }, variant);

      expect(screen.getByRole("link", { name: "Zaloguj się" })).toBeVisible();
    });
  });

  describe("given a signed-in session in the bar", () => {
    it("shows the account pill", () => {
      renderAccount(SIGNED_IN, "bar");

      expect(
        screen.getByRole("button", { name: "Ala Nowak" }),
      ).toBeInTheDocument();
    });
  });

  describe("given a signed-in session in the phone menu", () => {
    it("shows who is signed in and the sign-out button", () => {
      renderAccount(SIGNED_IN, "menu");

      expect(screen.getByText("Ala Nowak")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Wyloguj się" }),
      ).toBeInTheDocument();
    });
  });
});
