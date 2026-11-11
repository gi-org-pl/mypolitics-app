import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

// Calls back each time the app moves to a new location - a link followed by
// pointer or keyboard, the browser's back and forward, a link to the page
// already open - and not on the first render. What stays on screen across
// pages, like the header, uses it to close what it had open.
export const useOnNavigation = (onNavigation: () => void) => {
  const { key } = useLocation();
  const lastKey = useRef(key);

  useEffect(() => {
    if (lastKey.current === key) return;

    lastKey.current = key;
    onNavigation();
  }, [key, onNavigation]);
};
