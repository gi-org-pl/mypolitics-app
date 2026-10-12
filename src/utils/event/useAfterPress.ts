import { useCallback, useEffect, useRef } from "react";

type Callback = () => void;

// Runs a callback when no press is under way: at once, or - when asked in the
// middle of a press - as soon as that press is over and the browser has
// delivered it. For a change that moves things on the page: made between the
// start and the end of a press, it would take the control from under the
// pointer, and the press would be lost. Asked twice during one press, the
// later callback stands.
export const useAfterPress = (): ((callback: Callback) => void) => {
  const isPressed = useRef(false);
  const waiting = useRef<Callback>(undefined);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const press = () => {
      isPressed.current = true;
    };

    const release = () => {
      const callback = waiting.current;

      isPressed.current = false;
      waiting.current = undefined;

      // The click of a press comes after its release: the callback waits for
      // the task that delivers both to end.
      if (callback) {
        timeout = setTimeout(callback);
      }
    };

    document.addEventListener("pointerdown", press, true);
    document.addEventListener("pointerup", release, true);
    document.addEventListener("pointercancel", release, true);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("pointerdown", press, true);
      document.removeEventListener("pointerup", release, true);
      document.removeEventListener("pointercancel", release, true);
    };
  }, []);

  return useCallback((callback: Callback) => {
    if (isPressed.current) {
      waiting.current = callback;
    } else {
      callback();
    }
  }, []);
};
