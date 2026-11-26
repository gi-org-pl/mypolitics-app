import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SignInProviderButton } from "./SignInProviderButton";
import type { SignInProviderButtonProps } from "./SignInProviderButton.types";

const renderButton = (props: Partial<SignInProviderButtonProps> = {}) => {
  const onSelect = vi.fn();

  render(
    <SignInProviderButton
      mark="/mark.svg"
      label="Kontynuuj z Google"
      onSelect={onSelect}
      {...props}
    />,
  );

  return { onSelect, button: screen.getByRole("button") };
};

describe("SignInProviderButton", () => {
  describe("given an available provider", () => {
    it("is named by its label and calls onSelect when pressed", () => {
      const { onSelect, button } = renderButton();

      fireEvent.click(button);

      expect(button).toHaveAccessibleName("Kontynuuj z Google");
      expect(onSelect).toHaveBeenCalledOnce();
    });

    it("draws the mark as decoration and no spinner", () => {
      const { button } = renderButton();
      const images = button.querySelectorAll("img");

      expect(images).toHaveLength(1);
      expect(images[0]).toHaveAttribute("src", "/mark.svg");
      expect(images[0]).toHaveAttribute("alt", "");
      expect(button).toHaveAttribute("aria-busy", "false");
    });
  });

  describe("given its provider is waited for", () => {
    it("is busy, stays focusable and ignores presses", () => {
      const { onSelect, button } = renderButton({ isWaiting: true });

      fireEvent.click(button);

      expect(button).toHaveAttribute("aria-busy", "true");
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).not.toBeDisabled();
      expect(onSelect).not.toHaveBeenCalled();
    });

    it("shows the spinner beside the label", () => {
      const { button } = renderButton({ isWaiting: true });

      expect(button.querySelectorAll("img")).toHaveLength(2);
    });
  });

  describe("given another provider is waited for", () => {
    it("is disabled and ignores presses", () => {
      const { onSelect, button } = renderButton({ isDisabled: true });

      fireEvent.click(button);

      expect(button).toBeDisabled();
      expect(onSelect).not.toHaveBeenCalled();
    });
  });
});
