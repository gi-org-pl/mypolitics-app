import { type RefObject, useEffect, useRef } from "react";

interface PhaseFocus {
  topRef: RefObject<HTMLDivElement | null>; // the top of the screen
  contentRef: RefObject<HTMLDivElement | null>; // the top of the content
}

// When the content changes, the view returns to the top of the screen - only
// as far as needed, so nothing moves while the top is in sight - and the focus
// goes to the top of the new content, so a screen reader starts with what the
// phase is. The content that is on screen when the screen appears is left
// alone: nothing changed, and the page keeps its own focus and scroll.
export const usePhaseFocus = (contentKey: string): PhaseFocus => {
  const topRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const shownKey = useRef(contentKey);

  useEffect(() => {
    if (shownKey.current === contentKey) return;

    shownKey.current = contentKey;
    topRef.current?.scrollIntoView({ block: "nearest" });
    contentRef.current?.focus({ preventScroll: true });
  }, [contentKey]);

  return { topRef, contentRef };
};
