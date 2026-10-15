import { act, fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createAuthAccount } from "@/utils/vitest/auth/createAuthAccount";
import {
  createSessionValue,
  renderWithSession,
} from "@/utils/vitest/auth/renderWithSession";

import { HeaderAccountPhone } from "./HeaderAccountPhone";

const renderPhone = (signOut = vi.fn().mockResolvedValue(true)) => {
  const onNavigate = vi.fn();

  renderWithSession(
    <HeaderAccountPhone
      account={createAuthAccount()}
      onNavigate={onNavigate}
    />,
    createSessionValue({ signOut }),
  );

  return { onNavigate, signOut };
};

describe("HeaderAccountPhone", () => {
  describe("given a signed-in person", () => {
    it("shows who is signed in, with the initials", () => {
      renderPhone();

      expect(screen.getByText("Ala Nowak")).toBeInTheDocument();
      expect(screen.getByText("AN")).toBeInTheDocument();
    });

    it("signs out and closes the menu", async () => {
      const { onNavigate, signOut } = renderPhone();

      await act(async () =>
        fireEvent.click(screen.getByRole("button", { name: "Wyloguj się" })),
      );

      expect(signOut).toHaveBeenCalledOnce();
      expect(onNavigate).toHaveBeenCalledOnce();
    });

    it("keeps the menu open and says so when signing out fails", async () => {
      const { onNavigate } = renderPhone(vi.fn().mockResolvedValue(false));

      await act(async () =>
        fireEvent.click(screen.getByRole("button", { name: "Wyloguj się" })),
      );

      expect(onNavigate).not.toHaveBeenCalled();
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Nie udało się wylogować. Spróbuj jeszcze raz.",
      );
    });
  });
});
