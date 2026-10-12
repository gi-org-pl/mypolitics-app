import { act, fireEvent, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useEmailHint } from "./useEmailHint";

const renderHint = (address = "") =>
  renderHook(({ text }) => useEmailHint(text), {
    initialProps: { text: address },
  });

describe("useEmailHint()", () => {
  describe("when the field has not been left", () => {
    it.each([
      [""],
      ["biuro@mypolitics"],
      ["biuro@mypolitics.pl"],
    ])("shows no hint at first: %j", (address) => {
      const { result } = renderHint(address);

      expect(result.current.isHintShown).toBe(false);
    });

    it("shows no hint while the taker types text that is not valid", () => {
      const { result, rerender } = renderHint();

      for (const text of ["b", "biuro", "biuro@", "biuro@mypolitics"]) {
        rerender({ text });

        expect(result.current.isHintShown).toBe(false);
      }
    });
  });

  describe("when the hint is asked for", () => {
    it.each([
      ["biuro@mypolitics"],
      ["biuro"],
      ["Jan Kowalski <jan@poczta.pl>"],
    ])("shows the hint when the field loses focus with text that is not valid: %s", (address) => {
      const { result } = renderHint(address);

      act(() => result.current.showHint());

      expect(result.current.isHintShown).toBe(true);
    });

    it.each([
      [""],
      ["   "],
      ["biuro@mypolitics.pl"],
      ["  biuro@mypolitics.pl  "],
    ])("shows no hint when the field loses focus empty or valid: %j", (address) => {
      const { result } = renderHint(address);

      act(() => result.current.showHint());

      expect(result.current.isHintShown).toBe(false);
    });

    it("keeps the hint while the text changes and stays not valid", () => {
      const { result, rerender } = renderHint("biuro@mypolitics");

      act(() => result.current.showHint());
      rerender({ text: "biuro@mypolitics." });

      expect(result.current.isHintShown).toBe(true);
    });
  });

  describe("when the hint is asked for in the middle of a press", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("shows the hint when the press is over, so the pressed control stays under the pointer", () => {
      const { result } = renderHint("biuro@mypolitics");

      fireEvent.pointerDown(document.body);
      act(() => result.current.showHint());

      expect(result.current.isHintShown).toBe(false);

      fireEvent.pointerUp(document.body);
      act(() => vi.runAllTimers());

      expect(result.current.isHintShown).toBe(true);
    });

    it("shows no hint when the text became valid before the press was over", () => {
      const { result, rerender } = renderHint("biuro@mypolitics");

      fireEvent.pointerDown(document.body);
      act(() => result.current.showHint());
      rerender({ text: "biuro@mypolitics.pl" });
      fireEvent.pointerUp(document.body);
      act(() => vi.runAllTimers());

      expect(result.current.isHintShown).toBe(false);
    });
  });

  describe("given a shown hint", () => {
    it("hides the hint when the text becomes valid, and when the field is emptied", () => {
      const { result, rerender } = renderHint("biuro@mypolitics");

      act(() => result.current.showHint());
      rerender({ text: "biuro@mypolitics.pl" });

      expect(result.current.isHintShown).toBe(false);

      rerender({ text: "biuro@mypolitics" });
      act(() => result.current.showHint());

      expect(result.current.isHintShown).toBe(true);

      rerender({ text: "" });

      expect(result.current.isHintShown).toBe(false);
    });

    it("does not bring the hint back by itself when the text stops being valid again", () => {
      const { result, rerender } = renderHint("biuro@mypolitics");

      act(() => result.current.showHint());
      rerender({ text: "biuro@mypolitics.pl" });
      rerender({ text: "biuro@mypolitics.p" });
      rerender({ text: "biuro@mypolitics." });

      expect(result.current.isHintShown).toBe(false);
    });
  });
});
