import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { useOnNavigation } from "@/utils/router/useOnNavigation";

// The open state of the account menu, like the phone menu of the header:
// it closes on a press outside it, on Escape, which gives focus back to the
// pill that opened it, and when the app moves to another page - the header
// stays on screen, so a link followed from the keyboard would leave it open.
export const useAccountMenu = () => {
  const menuId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const close = useCallback(() => setIsOpen(false), []);

  useOnNavigation(close);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        !menuRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  return {
    menuId,
    isOpen,
    menuRef,
    buttonRef,
    toggle: () => setIsOpen((open) => !open),
    close,
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !isOpen) return;

      setIsOpen(false);
      buttonRef.current?.focus();
    },
  };
};
