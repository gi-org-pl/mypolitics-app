import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SignInPanelError } from "./SignInPanelError";

describe("SignInPanelError", () => {
  describe.each([
    [
      "google",
      "Okno Google zostało zamknięte przed końcem logowania. Spróbuj jeszcze raz.",
    ],
    [
      "facebook",
      "Okno Facebooka zostało zamknięte przed końcem logowania. Spróbuj jeszcze raz.",
    ],
    [
      "x",
      "Okno X zostało zamknięte przed końcem logowania. Spróbuj jeszcze raz.",
    ],
  ] as const)("given the %s window was closed", (provider, text) => {
    it("announces the interrupted sign-in, naming the provider", () => {
      renderWithI18n(
        <SignInPanelError error={{ kind: "window-closed", provider }} />,
      );

      const alert = screen.getByRole("alert");

      expect(alert).toHaveTextContent("Logowanie przerwane");
      expect(alert).toHaveTextContent(text);
    });
  });

  describe.each([
    [
      "google",
      "Google nie odpowiada",
      "Nie udało się zalogować przez Google. Spróbuj za chwilę albo wybierz inny sposób.",
    ],
    [
      "facebook",
      "Facebook nie odpowiada",
      "Nie udało się zalogować przez Facebooka. Spróbuj za chwilę albo wybierz inny sposób.",
    ],
  ] as const)("given %s failed", (provider, title, text) => {
    it("says that the provider does not answer and points to the others", () => {
      renderWithI18n(
        <SignInPanelError error={{ kind: "provider-failed", provider }} />,
      );

      const alert = screen.getByRole("alert");

      expect(alert).toHaveTextContent(title);
      expect(alert).toHaveTextContent(text);
    });
  });

  describe("given the app failed", () => {
    it("says that something went wrong and to try again", () => {
      renderWithI18n(<SignInPanelError error={{ kind: "failed" }} />);

      const alert = screen.getByRole("alert");

      expect(alert).toHaveTextContent("Coś poszło nie tak");
      expect(alert).toHaveTextContent(
        "Nie udało się zalogować. Spróbuj jeszcze raz.",
      );
    });
  });
});
