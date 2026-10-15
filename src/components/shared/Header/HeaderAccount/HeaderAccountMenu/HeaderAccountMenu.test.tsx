import { act, fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { AuthAccount } from "@/types/auth";
import { createAuthAccount } from "@/utils/vitest/auth/createAuthAccount";
import {
  createSessionValue,
  renderWithSession,
} from "@/utils/vitest/auth/renderWithSession";

import { HeaderAccountMenu } from "./HeaderAccountMenu";

const renderMenu = (
  account: AuthAccount = createAuthAccount(),
  signOut = vi.fn().mockResolvedValue(true),
) => {
  renderWithSession(
    <HeaderAccountMenu account={account} />,
    createSessionValue({ signOut }),
  );

  return {
    signOut,
    pill: screen.getByRole("button", { name: /Ala Nowak|Ola/ }),
  };
};

describe("HeaderAccountMenu", () => {
  describe("given the menu is closed", () => {
    it("shows the pill with the initials and the name, collapsed", () => {
      const { pill } = renderMenu();

      expect(pill).toHaveTextContent("ANAla Nowak");
      expect(pill).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByRole("group")).not.toBeInTheDocument();
    });
  });

  describe("given the pill is pressed", () => {
    it("opens the menu with the name, the provider and the address", () => {
      const { pill } = renderMenu();

      fireEvent.click(pill);

      const menu = screen.getByRole("group", { name: "Konto" });
      expect(pill).toHaveAttribute("aria-expanded", "true");
      expect(pill).toHaveAttribute("aria-controls", menu.id);
      expect(within(menu).getByText("ala.nowak@example.com")).toBeVisible();
      expect(within(menu).getByRole("img", { name: "Google" })).toBeVisible();
    });

    it("shows only the provider's mark when there is no address", () => {
      const { pill } = renderMenu(
        createAuthAccount({ email: undefined, provider: "x" }),
      );

      fireEvent.click(pill);

      const menu = screen.getByRole("group", { name: "Konto" });
      expect(within(menu).getByRole("img", { name: "X" })).toBeVisible();
      expect(within(menu).queryByText(/@/)).not.toBeInTheDocument();
    });
  });

  describe("given the menu is open", () => {
    it("closes on Escape and gives focus back to the pill", () => {
      const { pill } = renderMenu();
      fireEvent.click(pill);

      fireEvent.keyDown(within(screen.getByRole("group")).getByRole("button"), {
        key: "Escape",
      });

      expect(screen.queryByRole("group")).not.toBeInTheDocument();
      expect(pill).toHaveFocus();
    });

    it("signs out and closes", async () => {
      const { pill, signOut } = renderMenu();
      fireEvent.click(pill);

      await act(async () =>
        fireEvent.click(screen.getByRole("button", { name: "Wyloguj się" })),
      );

      expect(signOut).toHaveBeenCalledOnce();
      expect(screen.queryByRole("group")).not.toBeInTheDocument();
    });

    it("stays open and says so when signing out fails", async () => {
      const { pill } = renderMenu(
        createAuthAccount(),
        vi.fn().mockResolvedValue(false),
      );
      fireEvent.click(pill);

      await act(async () =>
        fireEvent.click(screen.getByRole("button", { name: "Wyloguj się" })),
      );

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Nie udało się wylogować. Spróbuj jeszcze raz.",
      );
      expect(screen.getByRole("group")).toBeInTheDocument();
    });
  });
});
