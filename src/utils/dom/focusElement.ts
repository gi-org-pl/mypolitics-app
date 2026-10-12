interface FocusableElement {
  focus: () => void;
}

// A ref for an element that takes the focus when it appears: React hands it
// the element once it is in the page, and nothing when it is gone.
export const focusElement = (element: FocusableElement | null): void => {
  element?.focus();
};
