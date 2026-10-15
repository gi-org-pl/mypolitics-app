import { type KeyboardEvent, type RefObject, useEffect } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Keeps keyboard focus inside a modal dialog while it is open and gives it
// back when it closes.
//
// When it opens, focus moves to the dialog itself, so a screen reader starts
// at its name and the phone keyboard stays down. Tab and Shift+Tab wrap
// between the first and the last control; the controls are looked up on every
// press, because the content changes while the dialog is open (the card
// turns into the step). Escape closes it, unless closing is blocked. When it
// closes, focus returns to the element that had it before, and the page
// behind can scroll again.
export const useDialogFocus = (
  dialogRef: RefObject<HTMLElement | null>,
  onEscape: () => void,
) => {
  useEffect(() => {
    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const overflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, [dialogRef]);

  return (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onEscape();
      return;
    }

    if (event.key !== "Tab" || !dialogRef.current) return;

    const controls = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
    );
    const first = controls[0];
    const last = controls.at(-1);
    const active = document.activeElement;

    if (!first || !last) {
      event.preventDefault();
      return;
    }

    if (event.shiftKey && (active === first || active === dialogRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };
};
