import { act, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AccountSetup } from "@/types/auth";

import { useAccountSetupForm } from "./useAccountSetupForm";

const COMPLETE: AccountSetup = {
  displayName: "Ala Nowak",
  isAgeDeclared: true,
  hasAcceptedTerms: true,
};

// A form with the controls the hook focuses, found by their identifiers.
const Harness = ({
  onSubmit,
  isSaving = false,
  suggestedName = "",
}: {
  onSubmit: (setup: AccountSetup) => void;
  isSaving?: boolean;
  suggestedName?: string;
}) => {
  const form = useAccountSetupForm({ suggestedName, isSaving, onSubmit });

  return (
    <form onSubmit={form.submit}>
      <input ref={form.nameRef} aria-label="name" />
      <button type="button" id={form.ids.age} aria-label="age" />
      <button type="button" id={form.ids.terms} aria-label="terms" />
      <button
        type="button"
        aria-label="age yes"
        onClick={() => form.setIsAgeDeclared(true)}
      />
      <button
        type="button"
        aria-label="terms yes"
        onClick={() => form.setHasAcceptedTerms(true)}
      />
      <button type="submit">submit</button>
    </form>
  );
};

describe("useAccountSetupForm()", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("given identifiers", () => {
    it("gives every control its own", () => {
      const { result } = renderHook(() =>
        useAccountSetupForm({ isSaving: false, onSubmit: vi.fn() }),
      );
      const ids = Object.values(result.current.ids);

      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("given the name is missing", () => {
    it("focuses the name field and submits nothing", () => {
      const onSubmit = vi.fn();
      render(<Harness onSubmit={onSubmit} />);

      act(() => screen.getByText("submit").click());

      expect(screen.getByLabelText("name")).toHaveFocus();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe("given only the age is missing", () => {
    it("focuses the age box", () => {
      render(<Harness onSubmit={vi.fn()} suggestedName="Ala Nowak" />);

      act(() => screen.getByLabelText("terms yes").click());
      act(() => screen.getByText("submit").click());

      expect(screen.getByLabelText("age")).toHaveFocus();
    });
  });

  describe("given only the terms are missing", () => {
    it("focuses the terms box", () => {
      render(<Harness onSubmit={vi.fn()} suggestedName="Ala Nowak" />);

      act(() => screen.getByLabelText("age yes").click());
      act(() => screen.getByText("submit").click());

      expect(screen.getByLabelText("terms")).toHaveFocus();
    });
  });

  describe("given everything is filled in", () => {
    it("hands the setup over", () => {
      const onSubmit = vi.fn();
      render(<Harness onSubmit={onSubmit} suggestedName="Ala Nowak" />);

      act(() => screen.getByLabelText("age yes").click());
      act(() => screen.getByLabelText("terms yes").click());
      act(() => screen.getByText("submit").click());

      expect(onSubmit).toHaveBeenCalledWith(COMPLETE);
    });

    it("reports which name issue there is, if any", () => {
      const { result } = renderHook(() =>
        useAccountSetupForm({
          isSaving: false,
          onSubmit: vi.fn(),
          suggestedName: "A",
        }),
      );

      act(() => result.current.submit());

      expect(result.current.nameIssue).toBe("name-too-short");
    });
  });

  describe("given the account is being saved", () => {
    it("ignores a submit", () => {
      const onSubmit = vi.fn();
      render(
        <Harness onSubmit={onSubmit} isSaving suggestedName="Ala Nowak" />,
      );

      act(() => screen.getByLabelText("age yes").click());
      act(() => screen.getByLabelText("terms yes").click());
      act(() => screen.getByText("submit").click());

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});
