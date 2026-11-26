import { type RefObject, useEffect, useRef } from "react";

// A ref for an element that takes the focus whenever a value changes, and
// not when it first appears. For a place whose content is replaced: the
// control that had the focus is gone with the old content, and without this
// the focus would fall back to the top of the page. The element needs
// `tabIndex={-1}` unless it takes the focus by itself.
//
// Taking the focus does not move the page: the browser would scroll the
// element into view on its own terms, and pushed what stands above it - the
// header of a result - out of sight. The page moves only when the start of
// the element is above the top of the window, and then just so far that the
// start shows.
export const useFocusOnChange = <Element extends HTMLElement>(
  value: unknown,
): RefObject<Element | null> => {
  const element = useRef<Element>(null);
  const lastValue = useRef(value);

  useEffect(() => {
    if (Object.is(lastValue.current, value)) return;

    lastValue.current = value;

    const current = element.current;

    if (!current) return;

    current.focus({ preventScroll: true });

    if (current.getBoundingClientRect().top < 0) {
      current.scrollIntoView({ block: "start" });
    }
  }, [value]);

  return element;
};
