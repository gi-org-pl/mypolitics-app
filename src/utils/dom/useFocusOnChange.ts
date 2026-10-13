import { type RefObject, useEffect, useRef } from "react";

// A ref for an element that takes the focus whenever a value changes, and
// not when it first appears. For a place whose content is replaced: the
// control that had the focus is gone with the old content, and without this
// the focus would fall back to the top of the page. The element needs
// `tabIndex={-1}` unless it takes the focus by itself.
export const useFocusOnChange = <Element extends HTMLElement>(
  value: unknown,
): RefObject<Element | null> => {
  const element = useRef<Element>(null);
  const lastValue = useRef(value);

  useEffect(() => {
    if (Object.is(lastValue.current, value)) return;

    lastValue.current = value;
    element.current?.focus();
  }, [value]);

  return element;
};
