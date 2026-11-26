import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import checkIcon from "@/assets/icons/checkmark-strong.svg";
import copyIcon from "@/assets/icons/copy.svg";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { FriendFormIdentifier } from "./FriendFormIdentifier";

const IDENTIFIER = "3f0c2a52-6f7b-4d53-9a55-0d5f1b9f3c11";
const COPIED = "Skopiowano identyfikator.";
const FAILED =
  "Nie udało się skopiować. Zaznacz identyfikator i skopiuj go ręcznie.";

const stubClipboard = (clipboard: unknown) =>
  vi.stubGlobal("navigator", { clipboard });

const renderIdentifier = () =>
  renderWithI18n(<FriendFormIdentifier identifier={IDENTIFIER} />);

const getControl = () =>
  screen.getByRole("button", { name: "Skopiuj identyfikator" });

const getIcon = () => getControl().querySelector("img")?.getAttribute("src");

describe("<FriendFormIdentifier />", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("given an identifier", () => {
    it("writes it out in full, on as many lines as it takes", () => {
      renderIdentifier();

      expect(screen.getByText(IDENTIFIER)).toBeVisible();
      expect(screen.getByText(IDENTIFIER)).toHaveClass("break-all");
      expect(screen.getByText(IDENTIFIER)).not.toHaveClass("truncate");
    });

    it("lets it be selected whole with one press, to copy it by hand", () => {
      renderIdentifier();

      expect(screen.getByText(IDENTIFIER)).toHaveClass("select-all");
    });

    it("shows the copy control, and says nothing yet", () => {
      renderIdentifier();

      expect(getControl()).toBeEnabled();
      expect(getIcon()).toBe(copyIcon);
      expect(screen.getByRole("status")).toBeEmptyDOMElement();
    });
  });

  describe("when the copy control is pressed", () => {
    it("puts the identifier on the clipboard, and says so", async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);

      stubClipboard({ writeText });
      renderIdentifier();

      fireEvent.click(getControl());

      await waitFor(() =>
        expect(screen.getByRole("status")).toHaveTextContent(COPIED),
      );
      expect(writeText).toHaveBeenCalledExactlyOnceWith(IDENTIFIER);
    });

    it("shows a tick on the control, and says it to a screen reader only", async () => {
      stubClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });
      renderIdentifier();

      fireEvent.click(getControl());

      await waitFor(() => expect(getIcon()).toBe(checkIcon));
      expect(screen.getByRole("status")).toHaveClass("sr-only");
    });
  });

  describe("when the browser has no Clipboard API", () => {
    it("writes out that the copy failed and what to do, and keeps the control", async () => {
      stubClipboard(undefined);
      renderIdentifier();

      fireEvent.click(getControl());

      await waitFor(() =>
        expect(screen.getByRole("status")).toHaveTextContent(FAILED),
      );
      expect(screen.getByRole("status")).not.toHaveClass("sr-only");
      expect(getIcon()).toBe(copyIcon);
      expect(getControl()).toBeEnabled();
      expect(screen.getByText(IDENTIFIER)).toBeVisible();
    });
  });

  describe("when the browser refuses to write to the clipboard", () => {
    it("writes out that the copy failed", async () => {
      stubClipboard({
        writeText: vi.fn().mockRejectedValue(new Error("NotAllowedError")),
      });
      renderIdentifier();

      fireEvent.click(getControl());

      await waitFor(() =>
        expect(screen.getByRole("status")).toHaveTextContent(FAILED),
      );
    });
  });
});
