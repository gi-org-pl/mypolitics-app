import { type RefObject, useEffect, useRef } from "react";

// When the text of a card changes in place - a puzzle revealing its answer -
// the content of the screen has not changed, so the screen moves no focus:
// the text takes it here, and the new line is announced like a new card. The
// text a card appears with is left alone: that focus is the screen's to move.
export const useTextFocus = (
  text: string,
): RefObject<HTMLParagraphElement | null> => {
  const textRef = useRef<HTMLParagraphElement>(null);
  const shownText = useRef(text);

  useEffect(() => {
    if (shownText.current === text) return;

    shownText.current = text;
    textRef.current?.focus({ preventScroll: true });
  }, [text]);

  return textRef;
};
